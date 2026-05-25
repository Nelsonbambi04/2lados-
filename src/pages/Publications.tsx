import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ExternalLink, MapPin, Newspaper, Search } from "lucide-react";
import {
  getPublicPublications,
  Publication,
  PublicationCategory,
} from "../services/api";

type Filter = "todos" | PublicationCategory;

const categories: { id: Filter; label: string }[] = [
  { id: "todos", label: "Tudo" },
  { id: "noticia", label: "Noticias" },
  { id: "atividade", label: "Atividades" },
  { id: "evento", label: "Eventos" },
  { id: "publicidade", label: "Publicidades" },
  { id: "obra", label: "Obras" },
];

const categoryLabels: Record<PublicationCategory, string> = {
  noticia: "Noticia",
  atividade: "Atividade",
  evento: "Evento",
  publicidade: "Publicidade",
  obra: "Obra",
};

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function Publications() {
  const [items, setItems] = useState<Publication[]>([]);
  const [filter, setFilter] = useState<Filter>("todos");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const featured = filtered.find((item) => item.is_featured) || filtered[0];
  const remaining = featured ? filtered.filter((item) => item.id !== featured.id) : filtered;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white">
        <div className="container mx-auto flex min-h-[300px] items-end px-4 py-10 sm:min-h-[360px] sm:py-12">
          <div className="max-w-3xl pb-4">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950">
              <Newspaper className="h-4 w-4" />
              Noticias, atividades e eventos
            </span>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Publicacoes da Dois Lados
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Acompanhe novidades, obras em destaque, anuncios, eventos e
              atividades do escritorio.
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
            <div className="text-center text-slate-500">A carregar...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
              Nenhuma publicacao encontrada.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {remaining.map((item) => (
                <PublicationCard key={item.id} item={item} />
              ))}
              {featured && <PublicationCard item={featured} featured />}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function PublicationCard({ item, featured = false }: { item: Publication; featured?: boolean }) {
  return (
    <article
      className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${
        featured ? "md:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-[0.9fr_1.1fr]" : ""
      }`}
    >
      <div className={featured ? "min-h-56 sm:min-h-72" : "h-52"}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-900 text-yellow-400">
            <Newspaper className="h-14 w-14" />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-800">
            {categoryLabels[item.category]}
          </span>
          {item.is_featured && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Destaque
            </span>
          )}
        </div>
        <h2 className={`${featured ? "text-2xl sm:text-3xl" : "text-xl"} break-words font-bold text-slate-950`}>
          {item.title}
        </h2>
        {item.summary && <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>}
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{item.content}</p>
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
              {item.location}
            </span>
          )}
        </div>
        {item.link_url && (
          <a
            href={item.link_url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Abrir anuncio <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
