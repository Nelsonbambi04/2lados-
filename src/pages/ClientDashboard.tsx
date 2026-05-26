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

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-slate-950">Acesso restrito</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {error}. Inicie sessão com uma conta de cliente autorizada para acompanhar os seus projetos.
              </p>
              <div className="mt-5">
                <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800" to="/login">
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

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
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
              onClick={() => document.getElementById("client-messages")?.scrollIntoView({ behavior: "smooth", block: "start" })}
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

      <section className="container mx-auto grid gap-6 px-4 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat icon={Building2} value={projects.length} label="Projetos" />
            <Stat icon={Mail} value={data.messages.length} label="Mensagens" />
            <Stat icon={FileText} value={unread} label="Por ler" />
          </div>

          <section id="client-messages" className="scroll-mt-28 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Meus Projetos</h2>
            <div className="mt-4 space-y-4">
              {projects.map((project) => (
                <article key={project.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900">{project.title}</h3>
                      <p className="text-sm text-slate-500">{project.location || project.category || "Sem localizacao"}</p>
                    </div>
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">{project.status}</span>
                  </div>
                  {project.description && <p className="mt-3 text-sm leading-6 text-slate-600">{project.description}</p>}
                  {project.phases?.length > 0 && (
                    <ol className="mt-4 space-y-2 text-sm">
                      {project.phases.map((phase: any) => (
                        <li key={phase.id} className="flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2 sm:flex-row sm:justify-between">
                          <span className="break-words">{phase.phase_order}. {phase.phase_name}</span>
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

        <aside className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Enviar Mensagem</h2>
            <form onSubmit={handleMessageSubmit} className="mt-4 space-y-3">
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Assunto" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <textarea className="min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Escreva a sua mensagem" value={content} onChange={(e) => setContent(e.target.value)} required />
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-900 hover:bg-yellow-500" disabled={busy}>
                <Send className="h-4 w-4" />
                {busy ? "A enviar..." : "Enviar ao Admin"}
              </button>
              {notice && <p className="text-sm text-slate-600">{notice}</p>}
            </form>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Historico</h2>
            <div className="mt-4 space-y-3">
              {data.messages.map((message) => (
                <div key={message.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-3">
                    <span className="break-words font-semibold text-slate-900">{message.subject || "Mensagem"}</span>
                    <span className="shrink-0 text-slate-400">{new Date(message.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{message.content}</p>
                  {message.attachment_url && (
                    <a className="mt-2 inline-block text-sm text-yellow-700 underline" href={resolveAssetUrl(message.attachment_url)} target="_blank" rel="noreferrer">
                      {message.attachment_name || "Abrir anexo"}
                    </a>
                  )}
                </div>
              ))}
              {!data.messages.length && <p className="text-sm text-slate-500">Sem mensagens ainda.</p>}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Mail; value: number; label: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400/20 text-yellow-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
