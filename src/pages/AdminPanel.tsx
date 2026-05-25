import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  Briefcase,
  FileText,
  FolderOpen,
  LogOut,
  Mail,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";
import {
  AdminUser,
  MessageItem,
  PortfolioItem,
  Publication,
  PublicationCategory,
  Quote,
  createAdminUser,
  createPortfolio,
  createPublication,
  deleteAdminUser,
  deleteMessage,
  deletePortfolio,
  deletePublication,
  getAdminMessages,
  getAdminPortfolio,
  getAdminPublications,
  getAdminQuotes,
  getAdminUsers,
  markMessageRead,
  sendAdminMessage,
  updateAdminUser,
  updatePortfolio,
  updatePublication,
  updateQuoteStatus,
  uploadPortfolioImage,
} from "../services/api";
import { AdminDashboardGuard } from "../components/AdminDashboardGuard";
import useUser from "../hooks/useUser";

type Tab = "overview" | "clients" | "messages" | "projects" | "publications" | "quotes";

const tabs: Array<{ id: Tab; label: string; icon: typeof Users }> = [
  { id: "overview", label: "Visao Geral", icon: Briefcase },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "messages", label: "Comunicacao", icon: Mail },
  { id: "projects", label: "Projetos", icon: FolderOpen },
  { id: "publications", label: "Publicacoes", icon: Newspaper },
  { id: "quotes", label: "Orcamentos", icon: FileText },
];

export default function AdminPanel() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [alert, setAlert] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [quoteFilter, setQuoteFilter] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | "">("");
  const [replySubject, setReplySubject] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);

  const [clientForm, setClientForm] = useState({
    username: "",
    email: "",
    password: "",
    is_admin: false,
  });
  const [projectForm, setProjectForm] = useState<Partial<PortfolioItem>>({});
  const [publicationForm, setPublicationForm] = useState<Partial<Publication>>({
    category: "noticia",
    is_active: true,
  });

  useEffect(() => {
    refreshAll();
  }, []);

  async function refreshAll() {
    try {
      const [u, m, p, pub, q] = await Promise.all([
        getAdminUsers(),
        getAdminMessages(),
        getAdminPortfolio(),
        getAdminPublications(),
        getAdminQuotes(),
      ]);
      setUsers(u.users);
      setMessages(m.messages);
      setPortfolio(p.portfolio);
      setPublications(pub.publications);
      setQuotes(q.quotes);
    } catch (err: any) {
      setAlert(err.message);
    }
  }

  const stats = useMemo(() => {
    const clients = users.filter((item) => !item.is_admin);
    return {
      activeClients: clients.filter((item) => item.is_active).length,
      unreadMessages: messages.filter((item) => !item.is_read).length,
      pendingQuotes: quotes.filter((item) => item.status === "pendente").length,
      projects: portfolio.length,
    };
  }, [users, messages, quotes, portfolio]);

  const clientUsers = users.filter((item) => !item.is_admin);
  const currentClientId =
    selectedClientId || clientUsers.find((item) => messages.some((message) => message.user_id === item.id))?.id || clientUsers[0]?.id || "";
  const currentClient = clientUsers.find((item) => item.id === currentClientId);
  const threadMessages = messages
    .filter((item) => item.user_id === currentClientId || item.email === currentClient?.email)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  async function handleClientSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await createAdminUser(clientForm);
      setClientForm({ username: "", email: "", password: "", is_admin: false });
      setAlert("Cliente criado com sucesso.");
      refreshAll();
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      let itemId = projectForm.id;
      if (itemId) {
        await updatePortfolio(itemId, projectForm);
      } else {
        itemId = (await createPortfolio(projectForm)).item.id;
      }
      if (itemId && file) await uploadPortfolioImage(itemId, file);
      setProjectForm({});
      setFile(null);
      setAlert("Projeto salvo.");
      refreshAll();
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePublicationSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...publicationForm,
        category: (publicationForm.category || "noticia") as PublicationCategory,
        is_active: publicationForm.is_active ?? true,
        is_featured: publicationForm.is_featured ?? false,
      };
      if (publicationForm.id) await updatePublication(publicationForm.id, payload);
      else await createPublication(payload);
      setPublicationForm({ category: "noticia", is_active: true });
      setAlert("Publicacao salva.");
      refreshAll();
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("dl_user");
    localStorage.removeItem("doislados_user");
    window.location.href = "/login";
  }

  async function handleAdminReply(e: React.FormEvent) {
    e.preventDefault();
    if (!currentClientId) return;
    setBusy(true);
    try {
      await sendAdminMessage({
        user_id: Number(currentClientId),
        subject: replySubject,
        content: replyContent,
        attachment: replyFile,
      });
      setReplySubject("");
      setReplyContent("");
      setReplyFile(null);
      setAlert("Mensagem enviada ao cliente.");
      refreshAll();
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminDashboardGuard user={user}>
      <main className="min-h-screen bg-slate-50">
        <section className="bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400">
                  <Users className="h-6 w-6 text-slate-900" />
                </div>
                <div className="min-w-0">
                  <h1 className="break-words text-lg font-bold text-slate-900 sm:text-xl">
                    Bem-vindo, {user?.username || "admin"}!
                  </h1>
                  <p className="text-sm text-slate-500">
                    Clientes, comunicacao, conteudo e orcamentos num unico painel.
                  </p>
                </div>
              </div>
              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <button className="relative rounded-lg p-2 hover:bg-slate-100">
                  <Bell className="h-5 w-5 text-slate-600" />
                  {stats.unreadMessages > 0 && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-yellow-400" />
                  )}
                </button>
                <button className="rounded-lg p-2 hover:bg-slate-100">
                  <Settings className="h-5 w-5 text-slate-600" />
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-4">
              <aside className="lg:col-span-1">
                <div className="sticky top-24 rounded-2xl bg-white p-4 shadow-sm">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition ${
                          activeTab === tab.id
                            ? "bg-yellow-400 text-slate-900"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <tab.icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>

              <div className="space-y-6 lg:col-span-3">
                {alert && (
                  <div className="break-words rounded-xl border border-yellow-300 bg-yellow-100 p-4 text-slate-900">
                    {alert}
                  </div>
                )}

                {activeTab === "overview" && (
                  <div className="grid gap-4 md:grid-cols-4">
                    <StatCard icon={Users} value={stats.activeClients} label="Clientes Ativos" color="yellow" />
                    <StatCard icon={Mail} value={stats.unreadMessages} label="Mensagens Novas" color="blue" />
                    <StatCard icon={FolderOpen} value={stats.projects} label="Projetos" color="green" />
                    <StatCard icon={FileText} value={stats.pendingQuotes} label="Orcamentos" color="purple" />
                  </div>
                )}

                {activeTab === "clients" && (
                  <Panel title="Clientes" subtitle="Crie clientes, ative acessos e fale diretamente com eles.">
                    <form onSubmit={handleClientSubmit} className="grid gap-3 md:grid-cols-4">
                      <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Nome" value={clientForm.username} onChange={(e) => setClientForm((f) => ({ ...f, username: e.target.value }))} required />
                      <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" type="email" placeholder="Email" value={clientForm.email} onChange={(e) => setClientForm((f) => ({ ...f, email: e.target.value }))} required />
                      <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" type="password" placeholder="Password inicial" value={clientForm.password} onChange={(e) => setClientForm((f) => ({ ...f, password: e.target.value }))} required />
                      <button className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white" disabled={busy}>{busy ? "A criar..." : "Adicionar Cliente"}</button>
                    </form>
                    <DataTable headers={["Cliente", "Email", "Tipo", "Projetos", "Estado", "Acoes"]}>
                      {users.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="p-3 font-medium">{item.username}</td>
                          <td className="p-3">{item.email}</td>
                          <td className="p-3">{item.is_admin ? "Admin" : "Cliente"}</td>
                          <td className="p-3">{item.projects_count}</td>
                          <td className="p-3">{item.is_active ? "Ativo" : "Inativo"}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-3">
                              <a className="text-yellow-700 underline" href={`mailto:${item.email}`}>Email</a>
                              <button className="text-slate-700" onClick={() => updateAdminUser(item.id, { is_active: !item.is_active }).then(refreshAll)}>
                                {item.is_active ? "Desativar" : "Ativar"}
                              </button>
                              <button className="text-red-600" onClick={() => deleteAdminUser(item.id).then(refreshAll)}>Eliminar</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </DataTable>
                  </Panel>
                )}

                {activeTab === "messages" && (
                  <Panel title="Comunicacao" subtitle="Chat interno com clientes, documentos e imagens anexadas.">
                    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0">
                        {clientUsers.map((client) => {
                          const unread = messages.filter((message) => message.user_id === client.id && !message.is_read && message.sender_role !== "admin").length;
                          return (
                            <button
                              key={client.id}
                              onClick={() => setSelectedClientId(client.id)}
                              className={`w-56 shrink-0 rounded-xl px-3 py-3 text-left text-sm lg:w-full ${
                                currentClientId === client.id ? "bg-yellow-400 text-slate-900" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <span className="block truncate font-semibold">{client.username}</span>
                              <span className="block truncate text-xs opacity-80">{client.email}</span>
                              {unread > 0 && <span className="mt-2 inline-block rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">{unread}</span>}
                            </button>
                          );
                        })}
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="mb-4 border-b border-slate-200 pb-3">
                          <p className="font-bold text-slate-900">{currentClient?.username || "Selecione um cliente"}</p>
                          <p className="text-sm text-slate-500">{currentClient?.email}</p>
                        </div>

                        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
                          {threadMessages.map((item) => (
                            <div key={item.id} className={`flex ${item.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[92%] overflow-hidden rounded-2xl p-4 shadow-sm sm:max-w-[78%] ${
                                item.sender_role === "admin" ? "bg-slate-900 text-white" : item.is_read ? "bg-white text-slate-800" : "bg-yellow-50 text-slate-900"
                              }`}>
                                <div className="mb-1 flex flex-col gap-1 text-xs opacity-80 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                  <span className="truncate">{item.sender_role === "admin" ? "Admin" : item.name}</span>
                                  <span className="shrink-0">{new Date(item.created_at).toLocaleString()}</span>
                                </div>
                                {item.subject && <p className="break-words font-semibold">{item.subject}</p>}
                                <p className="mt-2 break-words text-sm leading-6">{item.content}</p>
                                {item.attachment_url && (
                                  <a className="mt-3 inline-block rounded-lg bg-white/20 px-3 py-2 text-sm underline" href={item.attachment_url} target="_blank" rel="noreferrer">
                                    {item.attachment_name || "Abrir anexo"}
                                  </a>
                                )}
                                {item.sender_role !== "admin" && (
                                  <button className="mt-3 block text-xs underline" onClick={() => markMessageRead(item.id, true).then(refreshAll)}>
                                    Marcar lida
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          {!threadMessages.length && <p className="text-sm text-slate-500">Sem mensagens com este cliente.</p>}
                        </div>

                        <form onSubmit={handleAdminReply} className="mt-4 grid gap-3">
                          <input className="rounded-xl border border-slate-200 bg-white px-4 py-3" placeholder="Assunto" value={replySubject} onChange={(e) => setReplySubject(e.target.value)} />
                          <textarea className="min-h-28 rounded-xl border border-slate-200 bg-white px-4 py-3" placeholder="Escreva a mensagem para o cliente" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} required />
                          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <input className="w-full text-sm sm:w-auto" type="file" onChange={(e) => setReplyFile(e.target.files?.[0] || null)} />
                            <button className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-900" disabled={busy || !currentClientId}>
                              Enviar mensagem
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </Panel>
                )}

                {activeTab === "projects" && (
                  <Panel title="Projetos / Portfolio" subtitle="Conteudo publico do portfolio do site.">
                    <form onSubmit={handleProjectSubmit} className="grid gap-3 md:grid-cols-2">
                      <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Titulo" value={projectForm.title || ""} onChange={(e) => setProjectForm((f) => ({ ...f, title: e.target.value }))} required />
                      <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Categoria" value={projectForm.category || ""} onChange={(e) => setProjectForm((f) => ({ ...f, category: e.target.value }))} />
                      <textarea className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2" placeholder="Descricao" value={projectForm.description || ""} onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))} />
                      <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Localizacao" value={projectForm.location || ""} onChange={(e) => setProjectForm((f) => ({ ...f, location: e.target.value }))} />
                      <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="URL da imagem" value={projectForm.image_url || ""} onChange={(e) => setProjectForm((f) => ({ ...f, image_url: e.target.value }))} />
                      <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      <button className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white" disabled={busy}>{busy ? "A gravar..." : "Guardar Projeto"}</button>
                    </form>
                    <DataTable headers={["ID", "Titulo", "Categoria", "Ativo", "Acoes"]}>
                      {portfolio.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="p-3">{item.id}</td>
                          <td className="p-3 font-medium">{item.title}</td>
                          <td className="p-3">{item.category}</td>
                          <td className="p-3">{item.is_active ? "Sim" : "Nao"}</td>
                          <td className="p-3 space-x-3">
                            <button className="text-blue-700" onClick={() => setProjectForm(item)}>Editar</button>
                            <button className="text-red-600" onClick={() => deletePortfolio(item.id).then(refreshAll)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </DataTable>
                  </Panel>
                )}

                {activeTab === "publications" && (
                  <Panel title="Publicacoes" subtitle="Noticias, atividades, eventos e anuncios do site.">
                    <form onSubmit={handlePublicationSubmit} className="grid gap-3 md:grid-cols-2">
                      <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Titulo" value={publicationForm.title || ""} onChange={(e) => setPublicationForm((f) => ({ ...f, title: e.target.value }))} required />
                      <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" value={publicationForm.category || "noticia"} onChange={(e) => setPublicationForm((f) => ({ ...f, category: e.target.value as PublicationCategory }))}>
                        <option value="noticia">Noticia</option>
                        <option value="atividade">Atividade</option>
                        <option value="evento">Evento</option>
                        <option value="publicidade">Publicidade</option>
                        <option value="obra">Obra</option>
                      </select>
                      <textarea className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2" placeholder="Conteudo" value={publicationForm.content || ""} onChange={(e) => setPublicationForm((f) => ({ ...f, content: e.target.value }))} required />
                      <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="URL da imagem" value={publicationForm.image_url || ""} onChange={(e) => setPublicationForm((f) => ({ ...f, image_url: e.target.value }))} />
                      <button className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white" disabled={busy}>{busy ? "A gravar..." : "Guardar Publicacao"}</button>
                    </form>
                    <DataTable headers={["ID", "Titulo", "Categoria", "Ativa", "Acoes"]}>
                      {publications.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="p-3">{item.id}</td>
                          <td className="p-3 font-medium">{item.title}</td>
                          <td className="p-3">{item.category}</td>
                          <td className="p-3">{item.is_active ? "Sim" : "Nao"}</td>
                          <td className="p-3 space-x-3">
                            <button className="text-blue-700" onClick={() => setPublicationForm(item)}>Editar</button>
                            <button className="text-red-600" onClick={() => deletePublication(item.id).then(refreshAll)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </DataTable>
                  </Panel>
                )}

                {activeTab === "quotes" && (
                  <Panel title="Orcamentos" subtitle="Pedidos recebidos pelo formulario publico.">
                    <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" value={quoteFilter} onChange={(e) => setQuoteFilter(e.target.value)}>
                      <option value="">Todos</option>
                      <option value="pendente">Pendente</option>
                      <option value="analise">Em Analise</option>
                      <option value="aprovado">Aprovado</option>
                      <option value="rejeitado">Rejeitado</option>
                    </select>
                    <DataTable headers={["Cliente", "Email", "Servico", "Status", "Alterar"]}>
                      {quotes.filter((item) => (quoteFilter ? item.status === quoteFilter : true)).map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="p-3 font-medium">{item.client_name}</td>
                          <td className="p-3">{item.client_email}</td>
                          <td className="p-3">{item.service_type}</td>
                          <td className="p-3">{item.status}</td>
                          <td className="p-3">
                            <select className="rounded-lg border border-slate-200 px-3 py-2" value={item.status} onChange={(e) => updateQuoteStatus(item.id, e.target.value).then(refreshAll)}>
                              <option value="pendente">Pendente</option>
                              <option value="analise">Em Analise</option>
                              <option value="aprovado">Aprovado</option>
                              <option value="rejeitado">Rejeitado</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </DataTable>
                  </Panel>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </AdminDashboardGuard>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto border-y border-slate-100 sm:mx-0 sm:rounded-xl sm:border">
      <table className="min-w-[720px] bg-white text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>{headers.map((item) => <th key={item} className="p-3 text-left font-semibold">{item}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: { icon: typeof Users; value: number; label: string; color: "yellow" | "blue" | "green" | "purple" }) {
  const colors = {
    yellow: "bg-yellow-400/20 text-yellow-700",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
