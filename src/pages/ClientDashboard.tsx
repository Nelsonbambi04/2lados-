import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Bell, Building2, FileText, LogIn, LogOut, Mail, Send, User } from "lucide-react";
import LoadingLogo from "../components/LoadingLogo";
import { ClientProfile, getClientProfile, request, resolveAssetUrl, sendClientMessage } from "../services/api";

export default function ClientDashboard() {
  const [data, setData] = useState<ClientProfile | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [messageFilter, setMessageFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      const profile = await getClientProfile();
      setData(profile);
      const projectRes = await request<{ projects: any[] }>("/client/projects");
      setProjects(projectRes.projects);
      setError("");
    } catch (err: any) {
      const rawUser = localStorage.getItem("dl_user");
      if (rawUser) {
        try {
          const storedUser = JSON.parse(rawUser);
          if (storedUser?.is_admin && err.message === "Apenas clientes") {
            window.location.href = "/admin";
            return;
          }
        } catch {
          // Ignore malformed local session data and show the normal error.
        }
      }
      setError(err.message);
    }
  }

  async function handleMessageSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await sendClientMessage({ subject, content, attachment });
      setSubject("");
      setContent("");
      setAttachment(null);
      setNotice("Mensagem enviada ao administrador.");
      refresh();
    } catch (err: any) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("dl_user");
    localStorage.removeItem("doislados_user");
    window.location.href = "/login";
  }

  function openSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-lg border border-yellow-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-yellow-50 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-slate-950">Acesso restrito</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {error}. Inicie sessão com uma conta de cliente autorizada para acompanhar os seus projetos.
              </p>
              <div className="mt-4">
                <Link className="inline-flex items-center justify-center gap-2 rounded-md bg-yellow-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-200" to="/login">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return <LoadingLogo fullScreen label="A carregar área do cliente..." />;
  }

  const unread = data.messages.filter((item) => !item.is_read).length;
  const displayedMessages =
    messageFilter === "unread" ? data.messages.filter((item) => !item.is_read) : data.messages;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="container mx-auto flex flex-col gap-4 px-3 py-5 sm:px-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400">
              <User className="h-6 w-6 text-slate-900" />
            </div>
            <div className="min-w-0">
              <h1 className="break-words text-lg font-bold text-slate-900 sm:text-xl">Bem-vindo, {data.user.username}!</h1>
              <p className="text-sm text-slate-500">Acompanhe os seus projetos e fale com a equipa.</p>
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <button
              onClick={() => {
                setMessageFilter("unread");
                openSection("client-history");
              }}
              className="relative rounded-lg p-2 hover:bg-slate-100"
              type="button"
              title="Ver mensagens"
              aria-label="Ver mensagens"
            >
              <Bell className="h-5 w-5 text-slate-600" />
              {unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-yellow-400" />}
            </button>
            <button onClick={logout} className="rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200">
              <LogOut className="mr-2 inline h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid max-w-7xl gap-4 px-3 py-5 sm:px-4 sm:py-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:gap-6">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Stat
              icon={Building2}
              value={projects.length}
              label="Projetos"
              onClick={() => openSection("client-projects")}
            />
            <Stat
              icon={Mail}
              value={data.messages.length}
              label="Mensagens"
              onClick={() => {
                setMessageFilter("all");
                openSection("client-history");
              }}
            />
            <Stat
              icon={FileText}
              value={unread}
              label="Por ler"
              onClick={() => {
                setMessageFilter("unread");
                openSection("client-history");
              }}
            />
          </div>

          <section id="client-projects" className="scroll-mt-28 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-yellow-400" />
              <h2 className="text-base font-bold text-slate-950 sm:text-lg">Meus Projetos</h2>
            </div>
            <div className="mt-4 space-y-3">
              {projects.map((project) => (
                <article key={project.id} className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-bold text-slate-950 sm:text-base">{project.title}</h3>
                      <p className="mt-1 break-words text-xs text-slate-500 sm:text-sm">{project.location || project.category || "Sem localizacao"}</p>
                    </div>
                    <span className="w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">{project.status}</span>
                  </div>
                  {project.description && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">{project.description}</p>}
                  {project.phases?.length > 0 && (
                    <ol className="mt-4 space-y-2 text-sm">
                      {project.phases.map((phase: any) => (
                        <li key={phase.id} className="flex flex-col gap-1 rounded-md bg-yellow-50/70 px-3 py-2 sm:flex-row sm:justify-between">
                          <span className="break-words font-medium text-slate-800">{phase.phase_order}. {phase.phase_name}</span>
                          <span className="text-slate-500">{phase.status}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </article>
              ))}
              {!projects.length && <p className="text-sm text-slate-500">Ainda nao ha projetos associados a sua conta.</p>}
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-4 sm:space-y-6">
          <section id="client-compose" className="scroll-mt-28 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-yellow-400" />
              <h2 className="text-base font-bold text-slate-950 sm:text-lg">Enviar Mensagem</h2>
            </div>
            <form onSubmit={handleMessageSubmit} className="mt-4 space-y-3">
              <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100" placeholder="Assunto" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <textarea className="min-h-32 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100" placeholder="Escreva a sua mensagem" value={content} onChange={(e) => setContent(e.target.value)} required />
              <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-yellow-100 file:px-3 file:py-2 file:text-sm file:font-bold file:text-yellow-800" type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-70" disabled={busy}>
                <Send className="h-4 w-4" />
                {busy ? "A enviar..." : "Enviar ao Admin"}
              </button>
              {notice && <p className="text-sm text-slate-600">{notice}</p>}
            </form>
          </section>

          <section id="client-history" className="scroll-mt-28 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-yellow-400" />
                <h2 className="text-base font-bold text-slate-950 sm:text-lg">Historico</h2>
              </div>
              <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setMessageFilter("all")}
                  className={`rounded-md px-3 py-2 transition ${messageFilter === "all" ? "bg-white text-slate-950 shadow-sm" : "hover:text-slate-950"}`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setMessageFilter("unread")}
                  className={`rounded-md px-3 py-2 transition ${messageFilter === "unread" ? "bg-yellow-400 text-slate-950 shadow-sm" : "hover:text-slate-950"}`}
                >
                  Por ler
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {displayedMessages.map((message) => (
                <div key={message.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-3">
                    <span className="break-words font-semibold text-slate-900">{message.subject || "Mensagem"}</span>
                    <span className="shrink-0 text-slate-400">{new Date(message.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">{message.content}</p>
                  {message.attachment_url && (
                    <a className="mt-2 inline-block max-w-full break-words text-sm font-medium text-yellow-700 underline [overflow-wrap:anywhere]" href={resolveAssetUrl(message.attachment_url)} target="_blank" rel="noreferrer">
                      {message.attachment_name || "Abrir anexo"}
                    </a>
                  )}
                </div>
              ))}
              {!displayedMessages.length && (
                <p className="text-sm text-slate-500">
                  {messageFilter === "unread" ? "Nao ha mensagens por ler." : "Sem mensagens ainda."}
                </p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  onClick,
}: {
  icon: typeof Mail;
  value: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-yellow-300 hover:bg-yellow-50/40 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-yellow-100 sm:p-4"
      aria-label={`Abrir ${label}`}
    >
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-yellow-100 text-yellow-700 sm:h-10 sm:w-10">
        <Icon className="h-4 w-4 transition group-hover:scale-110 sm:h-5 sm:w-5" />
      </div>
      <div className="text-xl font-bold leading-none text-slate-950 sm:text-2xl">{value}</div>
      <div className="mt-1 break-words text-xs font-medium text-slate-500 sm:text-sm">{label}</div>
    </button>
  );
}
