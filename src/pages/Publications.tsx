import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  FileUp,
  MapPin,
  Newspaper,
  Search,
  X,
} from "lucide-react";
import LoadingLogo from "../components/LoadingLogo";
import {
  getPublicPublications,
  Publication,
  PublicationCategory,
  resolveAssetUrl,
  submitJobApplication,
} from "../services/api";

type Filter = "todos" | PublicationCategory;

const categories: { id: Filter; label: string }[] = [
  { id: "todos", label: "Tudo" },
  { id: "noticia", label: "Noticias" },
  { id: "atividade", label: "Atividades" },
  { id: "evento", label: "Eventos" },
  { id: "publicidade", label: "Publicidades" },
  { id: "obra", label: "Obras" },
  { id: "recrutamento", label: "Recrutamento" },
];

const categoryLabels: Record<PublicationCategory, string> = {
  noticia: "Noticia",
  atividade: "Atividade",
  evento: "Evento",
  publicidade: "Publicidade",
  obra: "Obra",
  recrutamento: "Recrutamento",
};

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function truncateText(value: string, limit: number) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
}

export default function Publications() {
  const [items, setItems] = useState<Publication[]>([]);
  const [filter, setFilter] = useState<Filter>("todos");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Publication | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPublicPublications();
        setItems(res.publications);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = filter === "todos" || item.category === filter;
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.summary || "").toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        (item.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, filter, query]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white">
        <div className="container mx-auto flex min-h-[300px] items-end px-4 py-10 sm:min-h-[360px] sm:py-12">
          <div className="max-w-3xl pb-4">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950">
              <Newspaper className="h-4 w-4" />
              Noticias, atividades, vagas e eventos
            </span>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Publicacoes da Dois Lados
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Acompanhe novidades, obras em destaque, anuncios, eventos,
              atividades e oportunidades de recrutamento.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-5">
        <div className="container mx-auto flex flex-col gap-4 px-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === category.id
                    ? "bg-yellow-400 text-slate-950"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar publicacoes..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
            />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          {loading ? (
            <LoadingLogo label="A carregar publicações..." />
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
              Nenhuma publicacao encontrada.
            </div>
          ) : (
            <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <PublicationCard key={item.id} item={item} onApply={setSelectedJob} />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedJob && (
        <ApplicationModal item={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </main>
  );
}

function PublicationCard({ item, onApply }: { item: Publication; onApply: (item: Publication) => void }) {
  const isRecruitment = item.category === "recrutamento";
  const summary = item.summary || item.content;

  return (
    <article className="grid h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-[16/10] bg-slate-900">
        {item.image_url ? (
          <img src={resolveAssetUrl(item.image_url)} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-yellow-400">
            {isRecruitment ? <BriefcaseBusiness className="h-14 w-14" /> : <Newspaper className="h-14 w-14" />}
          </div>
        )}
      </div>

      <div className="flex min-h-[300px] flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            isRecruitment ? "bg-slate-950 text-yellow-300" : "bg-yellow-100 text-yellow-800"
          }`}>
            {categoryLabels[item.category]}
          </span>
          {item.is_featured && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Destaque
            </span>
          )}
        </div>

        <h2 className="line-clamp-2 min-h-[3.5rem] break-words text-xl font-bold leading-7 text-slate-950">
          {truncateText(item.title, 78)}
        </h2>
        <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
          {truncateText(summary, 170)}
        </p>

        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
          {(item.event_date || item.created_at) && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDate(item.event_date || item.created_at)}
            </span>
          )}
          {item.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {truncateText(item.location, 32)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-5">
          {isRecruitment ? (
            <button
              onClick={() => onApply(item)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-yellow-500"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Candidatar-me Agora
            </button>
          ) : item.link_url ? (
            <a
              href={item.link_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Abrir anuncio <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ApplicationModal({ item, onClose }: { item: Publication; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!cv) {
      setError("Anexe o seu CV em PDF, DOC ou DOCX.");
      return;
    }

    setBusy(true);
    try {
      const res = await submitJobApplication({
        publication_id: item.id,
        publication_title: item.title,
        name,
        email,
        phone,
        message,
        cv,
      });
      setNotice(res.message || "Candidatura enviada com sucesso.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setCv(null);
    } catch (err: any) {
      setError(err.message || "Nao foi possivel enviar a candidatura.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">Candidatura</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{item.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Nome Completo
              <input className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              E-mail de Contacto
              <input className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Telefone
            <input className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Mensagem/Apresentacao curta
            <textarea className="min-h-32 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30" value={message} onChange={(e) => setMessage(e.target.value)} required />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Curriculo/CV
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center">
              <FileUp className="h-5 w-5 text-slate-500" />
              <input className="text-sm" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCv(e.target.files?.[0] || null)} required />
            </div>
          </label>

          {notice && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</div>}
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">
              Fechar
            </button>
            <button className="rounded-lg bg-yellow-400 px-5 py-3 font-bold text-slate-950 hover:bg-yellow-500 disabled:opacity-60" disabled={busy}>
              {busy ? "A enviar..." : "Enviar candidatura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
