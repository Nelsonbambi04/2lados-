import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileArchive,
  FileText,
  FolderOpen,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareText,
  Newspaper,
  Plus,
  ReceiptText,
  Search,
  Send,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import {
  AdminUser,
  MessageItem,
  ProjectDocument,
  ProjectDocumentType,
  ProjectItem,
  ProjectSiteImage,
  Publication,
  PublicationCategory,
  Quote,
  createAdminUser,
  createProject,
  createPublication,
  deleteAdminUser,
  deleteProject,
  deleteProjectDocument,
  deleteProjectImage,
  deletePublication,
  getAdminMessages,
  getAdminProjects,
  getAdminPublications,
  getAdminQuotes,
  getAdminUsers,
  getProjectDocuments,
  getProjectImages,
  markMessageRead,
  resolveAssetUrl,
  sendAdminMessage,
  updateAdminUser,
  updateProject,
  updatePublication,
  updateQuoteStatus,
  uploadProjectDocument,
  uploadProjectImage,
  uploadPublicationImage,
} from "../services/api";
import { AdminDashboardGuard } from "../components/AdminDashboardGuard";
import useUser from "../hooks/useUser";

type Tab = "overview" | "clients" | "works" | "conversations" | "quotes" | "content";
type ProjectWorkspaceTab = "summary" | "documents" | "images" | "conversation" | "quotes";

const tabs: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Painel", icon: LayoutDashboard },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "works", label: "Obras", icon: Building2 },
  { id: "conversations", label: "Conversas", icon: MessageSquareText },
  { id: "quotes", label: "Orcamentos", icon: ReceiptText },
  { id: "content", label: "Publicacoes", icon: Newspaper },
];

const documentTypes: Array<{ value: ProjectDocumentType; label: string; icon: LucideIcon }> = [
  { value: "planta", label: "Planta", icon: FileArchive },
  { value: "proposta", label: "Proposta", icon: FileText },
  { value: "fatura", label: "Fatura", icon: ReceiptText },
  { value: "orcamento", label: "Orcamento", icon: BriefcaseBusiness },
  { value: "contrato", label: "Contrato", icon: FileText },
  { value: "relatorio", label: "Relatorio", icon: FileText },
  { value: "outro", label: "Outro", icon: FileText },
];

const emptyProject: Partial<ProjectItem> = {
  title: "",
  category: "residencial",
  status: "orcamento",
  client_id: null,
  description: "",
  location: "",
};

export default function AdminPanel() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [workspaceTab, setWorkspaceTab] = useState<ProjectWorkspaceTab>("summary");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [siteImages, setSiteImages] = useState<ProjectSiteImage[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | "">("");
  const [quoteFilter, setQuoteFilter] = useState("");
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState("");
  const [busy, setBusy] = useState(false);
  const [projectForm, setProjectForm] = useState<Partial<ProjectItem>>(emptyProject);
  const [clientForm, setClientForm] = useState({ username: "", email: "", password: "", is_admin: false });
  const [documentForm, setDocumentForm] = useState({
    document_type: "planta" as ProjectDocumentType,
    title: "",
    description: "",
    amount: "",
    status: "rascunho",
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [imageCaption, setImageCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [publicationFile, setPublicationFile] = useState<File | null>(null);
  const [publicationForm, setPublicationForm] = useState<Partial<Publication>>({
    category: "noticia",
    is_active: true,
  });

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (projects.length && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setDocuments([]);
      setSiteImages([]);
      return;
    }
    refreshProjectAssets(selectedProjectId);
  }, [selectedProjectId]);

  async function refreshAll() {
    try {
      const [u, m, p, pub, q] = await Promise.all([
        getAdminUsers(),
        getAdminMessages(),
        getAdminProjects(),
        getAdminPublications(),
        getAdminQuotes(),
      ]);
      setUsers(u.users);
      setMessages(m.messages);
      setProjects(p.projects);
      setPublications(pub.publications);
      setQuotes(q.quotes);
    } catch (err: any) {
      setAlert(err.message);
    }
  }

  async function refreshProjectAssets(projectId: number) {
    try {
      const [docs, imgs] = await Promise.all([getProjectDocuments(projectId), getProjectImages(projectId)]);
      setDocuments(docs.documents);
      setSiteImages(imgs.images);
    } catch (err: any) {
      setAlert(err.message);
    }
  }

  const clientUsers = users.filter((item) => !item.is_admin);
  const selectedProject = projects.find((item) => item.id === selectedProjectId) || null;
  const selectedProjectClient = clientUsers.find((item) => item.id === selectedProject?.client_id);

  const stats = useMemo(() => {
    return {
      activeClients: clientUsers.filter((item) => item.is_active).length,
      activeWorks: projects.filter((item) => item.status === "em_progresso").length,
      pendingQuotes: quotes.filter((item) => item.status === "pendente").length,
      unreadMessages: messages.filter((item) => !item.is_read && item.sender_role !== "admin").length,
      documents: projects.reduce((sum, item) => sum + (item.documents_count || 0), 0),
      images: projects.reduce((sum, item) => sum + (item.images_count || 0), 0),
    };
  }, [clientUsers, projects, quotes, messages]);

  const filteredProjects = projects.filter((item) => {
    const text = `${item.title} ${item.client_name || ""} ${item.location || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const projectThread = messages
    .filter((item) => {
      if (!selectedProjectClient) return false;
      return item.user_id === selectedProjectClient.id || item.email === selectedProjectClient.email;
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const projectQuotes = quotes.filter((item) => {
    if (!selectedProjectClient) return false;
    return item.client_email === selectedProjectClient.email;
  });

  const activeClientId =
    selectedClientId ||
    clientUsers.find((item) => messages.some((message) => message.user_id === item.id))?.id ||
    clientUsers[0]?.id ||
    "";
  const activeClient = clientUsers.find((item) => item.id === activeClientId);
  const activeThread = messages
    .filter((item) => item.user_id === activeClientId || item.email === activeClient?.email)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  async function handleClientSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await createAdminUser(clientForm);
      setClientForm({ username: "", email: "", password: "", is_admin: false });
      setAlert("Cliente criado com sucesso.");
      await refreshAll();
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
      const payload = {
        ...projectForm,
        client_id: projectForm.client_id ? Number(projectForm.client_id) : null,
        budget: projectForm.budget ? Number(projectForm.budget) : null,
        area_sqm: projectForm.area_sqm ? Number(projectForm.area_sqm) : null,
      };
      if (projectForm.id) {
        await updateProject(projectForm.id, payload);
        setSelectedProjectId(projectForm.id);
      } else {
        const created = await createProject(payload);
        setSelectedProjectId(created.project.id);
      }
      setProjectForm(emptyProject);
      setAlert("Obra guardada com sucesso.");
      await refreshAll();
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDocumentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProjectId || !documentFile) return;
    setBusy(true);
    try {
      await uploadProjectDocument(selectedProjectId, { ...documentForm, file: documentFile });
      setDocumentForm({ document_type: "planta", title: "", description: "", amount: "", status: "rascunho" });
      setDocumentFile(null);
      setAlert("Documento adicionado a obra.");
      await refreshAll();
      await refreshProjectAssets(selectedProjectId);
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleImageSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProjectId || !imageFile) return;
    setBusy(true);
    try {
      await uploadProjectImage(selectedProjectId, { image: imageFile, caption: imageCaption });
      setImageFile(null);
      setImageCaption("");
      setAlert("Imagem do local adicionada.");
      await refreshAll();
      await refreshProjectAssets(selectedProjectId);
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReply(e: React.FormEvent, targetUserId?: number | "") {
    e.preventDefault();
    if (!targetUserId) return;
    setBusy(true);
    try {
      await sendAdminMessage({
        user_id: Number(targetUserId),
        subject: replySubject,
        content: replyContent,
        attachment: replyFile,
      });
      setReplySubject("");
      setReplyContent("");
      setReplyFile(null);
      setAlert("Mensagem enviada ao cliente.");
      await refreshAll();
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
      let publicationId = publicationForm.id;
      if (publicationId) {
        await updatePublication(publicationId, payload);
      } else {
        publicationId = (await createPublication(payload)).publication.id;
      }
      if (publicationId && publicationFile) await uploadPublicationImage(publicationId, publicationFile);
      setPublicationForm({ category: "noticia", is_active: true });
      setPublicationFile(null);
      setAlert("Publicacao guardada.");
      await refreshAll();
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

  return (
    <AdminDashboardGuard user={user}>
      <main className="min-h-screen bg-zinc-100 text-zinc-950">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Dois Lados Admin</p>
              <h1 className="break-words text-xl font-bold sm:text-2xl">Gestao profissional de obras</h1>
              <p className="text-sm text-zinc-500">Clientes, plantas, propostas, faturas, orcamentos, conversas e imagens de obra.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50" onClick={() => setActiveTab("conversations")} type="button" title="Conversas">
                <Bell className="h-5 w-5" />
                {stats.unreadMessages > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />}
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white" onClick={logout} type="button">
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-[1600px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
          <aside className="min-w-0">
            <nav className="flex gap-2 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2 lg:block lg:space-y-1 lg:overflow-visible">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition lg:w-full ${
                    activeTab === tab.id ? "bg-amber-400 text-zinc-950" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 space-y-5">
            {alert && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-zinc-900">
                {alert}
              </div>
            )}

            {activeTab === "overview" && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                  <Stat icon={Users} label="Clientes ativos" value={stats.activeClients} />
                  <Stat icon={Building2} label="Obras em curso" value={stats.activeWorks} />
                  <Stat icon={ReceiptText} label="Orcamentos pendentes" value={stats.pendingQuotes} />
                  <Stat icon={Mail} label="Mensagens novas" value={stats.unreadMessages} />
                  <Stat icon={FileArchive} label="Documentos" value={stats.documents} />
                  <Stat icon={Image} label="Imagens de obra" value={stats.images} />
                </div>
                <Panel title="Obras recentes">
                  <ProjectList projects={filteredProjects.slice(0, 8)} selectedId={selectedProjectId} onSelect={(id) => { setSelectedProjectId(id); setActiveTab("works"); }} />
                </Panel>
              </div>
            )}

            {activeTab === "clients" && (
              <Panel title="Clientes">
                <form onSubmit={handleClientSubmit} className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
                  <TextInput placeholder="Nome do cliente" value={clientForm.username} onChange={(value) => setClientForm((form) => ({ ...form, username: value }))} required />
                  <TextInput type="email" placeholder="Email" value={clientForm.email} onChange={(value) => setClientForm((form) => ({ ...form, email: value }))} required />
                  <TextInput type="password" placeholder="Password inicial" value={clientForm.password} onChange={(value) => setClientForm((form) => ({ ...form, password: value }))} required />
                  <ActionButton icon={Plus} disabled={busy}>{busy ? "A criar" : "Criar cliente"}</ActionButton>
                </form>
                <DataTable headers={["Cliente", "Email", "Projetos", "Estado", "Acoes"]}>
                  {users.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-100">
                      <td className="p-3 font-semibold">{item.username}</td>
                      <td className="p-3">{item.email}</td>
                      <td className="p-3">{item.projects_count}</td>
                      <td className="p-3">{item.is_active ? "Ativo" : "Inativo"}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <SmallButton onClick={() => { setSelectedClientId(item.id); setActiveTab("conversations"); }}>Conversa</SmallButton>
                          <SmallButton onClick={() => updateAdminUser(item.id, { is_active: !item.is_active }).then(refreshAll)}>
                            {item.is_active ? "Desativar" : "Ativar"}
                          </SmallButton>
                          <SmallButton danger onClick={() => deleteAdminUser(item.id).then(refreshAll)}>Eliminar</SmallButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </DataTable>
              </Panel>
            )}

            {activeTab === "works" && (
              <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
                <div className="space-y-5">
                  <Panel title={projectForm.id ? "Editar obra" : "Nova obra"}>
                    <ProjectForm
                      form={projectForm}
                      clients={clientUsers}
                      busy={busy}
                      onSubmit={handleProjectSubmit}
                      onChange={setProjectForm}
                      onReset={() => setProjectForm(emptyProject)}
                    />
                  </Panel>
                  <Panel title="Lista de obras">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                      <input className="w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm" placeholder="Pesquisar obra, cliente ou local" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <ProjectList projects={filteredProjects} selectedId={selectedProjectId} onSelect={setSelectedProjectId} />
                  </Panel>
                </div>

                <ProjectWorkspace
                  project={selectedProject}
                  client={selectedProjectClient}
                  tab={workspaceTab}
                  documents={documents}
                  images={siteImages}
                  messages={projectThread}
                  quotes={projectQuotes}
                  replySubject={replySubject}
                  replyContent={replyContent}
                  busy={busy}
                  documentForm={documentForm}
                  imageCaption={imageCaption}
                  onTab={setWorkspaceTab}
                  onEdit={(project) => setProjectForm(project)}
                  onDeleteProject={(id) => deleteProject(id).then(async () => { setSelectedProjectId(null); await refreshAll(); })}
                  onDocumentChange={setDocumentForm}
                  onDocumentFile={setDocumentFile}
                  onDocumentSubmit={handleDocumentSubmit}
                  onDeleteDocument={(id) => selectedProjectId && deleteProjectDocument(id).then(() => refreshProjectAssets(selectedProjectId))}
                  onImageCaption={setImageCaption}
                  onImageFile={setImageFile}
                  onImageSubmit={handleImageSubmit}
                  onDeleteImage={(id) => selectedProjectId && deleteProjectImage(id).then(() => refreshProjectAssets(selectedProjectId))}
                  onReplySubject={setReplySubject}
                  onReplyContent={setReplyContent}
                  onReplyFile={setReplyFile}
                  onReplySubmit={(event) => handleReply(event, selectedProjectClient?.id)}
                  onQuoteStatus={(id, status) => updateQuoteStatus(id, status).then(refreshAll)}
                />
              </div>
            )}

            {activeTab === "conversations" && (
              <Panel title="Conversas com clientes">
                <ConversationConsole
                  clients={clientUsers}
                  messages={activeThread}
                  allMessages={messages}
                  selectedId={activeClientId}
                  selectedClient={activeClient}
                  replySubject={replySubject}
                  replyContent={replyContent}
                  busy={busy}
                  onSelect={setSelectedClientId}
                  onRead={(id) => markMessageRead(id, true).then(refreshAll)}
                  onSubject={setReplySubject}
                  onContent={setReplyContent}
                  onFile={setReplyFile}
                  onSubmit={(event) => handleReply(event, activeClientId)}
                />
              </Panel>
            )}

            {activeTab === "quotes" && (
              <Panel title="Orcamentos">
                <select className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" value={quoteFilter} onChange={(e) => setQuoteFilter(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="analise">Em analise</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
                <QuotesTable quotes={quotes.filter((item) => (quoteFilter ? item.status === quoteFilter : true))} onStatus={(id, status) => updateQuoteStatus(id, status).then(refreshAll)} />
              </Panel>
            )}

            {activeTab === "content" && (
              <Panel title="Publicacoes do site">
                <form onSubmit={handlePublicationSubmit} className="grid gap-3 md:grid-cols-2">
                  <TextInput placeholder="Titulo" value={publicationForm.title || ""} onChange={(value) => setPublicationForm((form) => ({ ...form, title: value }))} required />
                  <select className="rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm" value={publicationForm.category || "noticia"} onChange={(e) => setPublicationForm((form) => ({ ...form, category: e.target.value as PublicationCategory }))}>
                    <option value="noticia">Noticia</option>
                    <option value="atividade">Atividade</option>
                    <option value="evento">Evento</option>
                    <option value="publicidade">Publicidade</option>
                    <option value="obra">Obra</option>
                    <option value="recrutamento">Recrutamento</option>
                  </select>
                  <textarea className="min-h-28 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm md:col-span-2" placeholder="Conteudo" value={publicationForm.content || ""} onChange={(e) => setPublicationForm((form) => ({ ...form, content: e.target.value }))} required />
                  <TextInput placeholder="URL da imagem" value={publicationForm.image_url || ""} onChange={(value) => setPublicationForm((form) => ({ ...form, image_url: value }))} />
                  <input className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" type="file" accept="image/*" onChange={(e) => setPublicationFile(e.target.files?.[0] || null)} />
                  <ActionButton icon={CheckCircle2} disabled={busy}>{busy ? "A guardar" : "Guardar publicacao"}</ActionButton>
                </form>
                <DataTable headers={["Titulo", "Categoria", "Ativa", "Acoes"]}>
                  {publications.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-100">
                      <td className="p-3 font-semibold">{item.title}</td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3">{item.is_active ? "Sim" : "Nao"}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <SmallButton onClick={() => setPublicationForm(item)}>Editar</SmallButton>
                          <SmallButton danger onClick={() => deletePublication(item.id).then(refreshAll)}>Eliminar</SmallButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </DataTable>
              </Panel>
            )}
          </div>
        </section>
      </main>
    </AdminDashboardGuard>
  );
}

function ProjectForm({ form, clients, busy, onSubmit, onChange, onReset }: {
  form: Partial<ProjectItem>;
  clients: AdminUser[];
  busy: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (form: Partial<ProjectItem>) => void;
  onReset: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <TextInput placeholder="Nome da obra" value={form.title || ""} onChange={(value) => onChange({ ...form, title: value })} required />
      <select className="rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm" value={form.client_id || ""} onChange={(e) => onChange({ ...form, client_id: e.target.value ? Number(e.target.value) : null })}>
        <option value="">Sem cliente associado</option>
        {clients.map((client) => <option key={client.id} value={client.id}>{client.username}</option>)}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm" value={form.category || "residencial"} onChange={(e) => onChange({ ...form, category: e.target.value })}>
          <option value="residencial">Residencial</option>
          <option value="comercial">Comercial</option>
          <option value="urbanismo">Urbanismo</option>
          <option value="remodelacao">Remodelacao</option>
        </select>
        <select className="rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm" value={form.status || "orcamento"} onChange={(e) => onChange({ ...form, status: e.target.value })}>
          <option value="orcamento">Orcamento</option>
          <option value="planeamento">Planeamento</option>
          <option value="em_progresso">Em progresso</option>
          <option value="pausado">Pausado</option>
          <option value="concluido">Concluido</option>
        </select>
      </div>
      <textarea className="min-h-24 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm" placeholder="Descricao tecnica" value={form.description || ""} onChange={(e) => onChange({ ...form, description: e.target.value })} />
      <TextInput placeholder="Localizacao" value={form.location || ""} onChange={(value) => onChange({ ...form, location: value })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput type="number" placeholder="Valor previsto" value={form.budget ?? ""} onChange={(value) => onChange({ ...form, budget: value ? Number(value) : null })} />
        <TextInput type="number" placeholder="Area m2" value={form.area_sqm ?? ""} onChange={(value) => onChange({ ...form, area_sqm: value ? Number(value) : null })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput type="date" value={form.start_date || ""} onChange={(value) => onChange({ ...form, start_date: value })} />
        <TextInput type="date" value={form.end_date || ""} onChange={(value) => onChange({ ...form, end_date: value })} />
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionButton icon={CheckCircle2} disabled={busy}>{busy ? "A guardar" : "Guardar obra"}</ActionButton>
        {form.id && <SmallButton onClick={onReset}>Nova obra</SmallButton>}
      </div>
    </form>
  );
}

function ProjectWorkspace(props: {
  project: ProjectItem | null;
  client?: AdminUser;
  tab: ProjectWorkspaceTab;
  documents: ProjectDocument[];
  images: ProjectSiteImage[];
  messages: MessageItem[];
  quotes: Quote[];
  replySubject: string;
  replyContent: string;
  busy: boolean;
  documentForm: { document_type: ProjectDocumentType; title: string; description: string; amount: string; status: string };
  imageCaption: string;
  onTab: (tab: ProjectWorkspaceTab) => void;
  onEdit: (project: ProjectItem) => void;
  onDeleteProject: (id: number) => void;
  onDocumentChange: (form: { document_type: ProjectDocumentType; title: string; description: string; amount: string; status: string }) => void;
  onDocumentFile: (file: File | null) => void;
  onDocumentSubmit: (event: React.FormEvent) => void;
  onDeleteDocument: (id: number) => void;
  onImageCaption: (value: string) => void;
  onImageFile: (file: File | null) => void;
  onImageSubmit: (event: React.FormEvent) => void;
  onDeleteImage: (id: number) => void;
  onReplySubject: (value: string) => void;
  onReplyContent: (value: string) => void;
  onReplyFile: (file: File | null) => void;
  onReplySubmit: (event: React.FormEvent) => void;
  onQuoteStatus: (id: number, status: string) => void;
}) {
  if (!props.project) {
    return (
      <Panel title="Area da obra">
        <EmptyState icon={Building2} text="Crie ou selecione uma obra para gerir documentos, conversas e imagens." />
      </Panel>
    );
  }

  const tabs: Array<{ id: ProjectWorkspaceTab; label: string; icon: LucideIcon }> = [
    { id: "summary", label: "Resumo", icon: LayoutDashboard },
    { id: "documents", label: "Documentos", icon: FileArchive },
    { id: "images", label: "Imagens", icon: Image },
    { id: "conversation", label: "Conversa", icon: MessageSquareText },
    { id: "quotes", label: "Orcamentos", icon: ReceiptText },
  ];

  return (
    <Panel title={props.project.title}>
      <div className="flex flex-col gap-3 border-b border-zinc-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-zinc-500">{props.client?.username || "Sem cliente"} {props.project.location ? `- ${props.project.location}` : ""}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{props.project.status}</Badge>
            <Badge>{props.project.category}</Badge>
            {props.project.budget ? <Badge>{money(props.project.budget)}</Badge> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <SmallButton onClick={() => props.onEdit(props.project)}>Editar</SmallButton>
          <SmallButton danger onClick={() => props.onDeleteProject(props.project.id)}>Eliminar</SmallButton>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => props.onTab(tab.id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${props.tab === tab.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {props.tab === "summary" && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Info label="Cliente" value={props.client?.username || "Nao associado"} />
          <Info label="Inicio" value={props.project.start_date || "Sem data"} />
          <Info label="Fim previsto" value={props.project.end_date || "Sem data"} />
          <Info label="Area" value={props.project.area_sqm ? `${props.project.area_sqm} m2` : "N/A"} />
          <Info label="Documentos" value={String(props.documents.length)} />
          <Info label="Imagens do local" value={String(props.images.length)} />
          <div className="rounded-lg border border-zinc-200 p-4 xl:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Descricao</p>
            <p className="mt-2 text-sm leading-6 text-zinc-700">{props.project.description || "Sem descricao registada."}</p>
          </div>
        </div>
      )}

      {props.tab === "documents" && (
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <form onSubmit={props.onDocumentSubmit} className="grid gap-3 rounded-lg border border-zinc-200 p-4">
            <select className="rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm" value={props.documentForm.document_type} onChange={(e) => props.onDocumentChange({ ...props.documentForm, document_type: e.target.value as ProjectDocumentType })}>
              {documentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            <TextInput placeholder="Titulo do documento" value={props.documentForm.title} onChange={(value) => props.onDocumentChange({ ...props.documentForm, title: value })} />
            <TextInput type="number" placeholder="Valor associado" value={props.documentForm.amount} onChange={(value) => props.onDocumentChange({ ...props.documentForm, amount: value })} />
            <textarea className="min-h-20 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm" placeholder="Notas" value={props.documentForm.description} onChange={(e) => props.onDocumentChange({ ...props.documentForm, description: e.target.value })} />
            <input className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" type="file" onChange={(e) => props.onDocumentFile(e.target.files?.[0] || null)} required />
            <ActionButton icon={Upload} disabled={props.busy}>Adicionar documento</ActionButton>
          </form>
          <div className="grid gap-3 md:grid-cols-2">
            {props.documents.map((item) => <DocumentCard key={item.id} item={item} onDelete={props.onDeleteDocument} />)}
            {!props.documents.length && <EmptyState icon={FileArchive} text="Ainda nao ha plantas, propostas, faturas ou orcamentos nesta obra." />}
          </div>
        </div>
      )}

      {props.tab === "images" && (
        <div className="space-y-4">
          <form onSubmit={props.onImageSubmit} className="grid gap-3 rounded-lg border border-zinc-200 p-4 md:grid-cols-[1fr_1fr_auto]">
            <TextInput placeholder="Legenda da imagem" value={props.imageCaption} onChange={props.onImageCaption} />
            <input className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" type="file" accept="image/*" onChange={(e) => props.onImageFile(e.target.files?.[0] || null)} required />
            <ActionButton icon={Upload} disabled={props.busy}>Adicionar</ActionButton>
          </form>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {props.images.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                <img className="h-44 w-full object-cover" src={resolveAssetUrl(item.image_url)} alt={item.caption || "Imagem da obra"} />
                <div className="flex items-center justify-between gap-3 p-3">
                  <p className="min-w-0 truncate text-sm font-semibold">{item.caption || "Imagem da obra"}</p>
                  <button type="button" onClick={() => props.onDeleteImage(item.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Eliminar imagem">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {!props.images.length && <EmptyState icon={Image} text="A area de imagens do local ainda esta vazia." />}
          </div>
        </div>
      )}

      {props.tab === "conversation" && (
        <ConversationThread
          messages={props.messages}
          selectedClient={props.client}
          replySubject={props.replySubject}
          replyContent={props.replyContent}
          busy={props.busy}
          onRead={() => undefined}
          onSubject={props.onReplySubject}
          onContent={props.onReplyContent}
          onFile={props.onReplyFile}
          onSubmit={props.onReplySubmit}
        />
      )}

      {props.tab === "quotes" && <QuotesTable quotes={props.quotes} onStatus={props.onQuoteStatus} />}
    </Panel>
  );
}

function ConversationConsole(props: {
  clients: AdminUser[];
  messages: MessageItem[];
  allMessages: MessageItem[];
  selectedId: number | "";
  selectedClient?: AdminUser;
  replySubject: string;
  replyContent: string;
  busy: boolean;
  onSelect: (id: number) => void;
  onRead: (id: number) => void;
  onSubject: (value: string) => void;
  onContent: (value: string) => void;
  onFile: (file: File | null) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
        {props.clients.map((client) => {
          const unread = props.allMessages.filter((message) => message.user_id === client.id && !message.is_read && message.sender_role !== "admin").length;
          return (
            <button key={client.id} onClick={() => props.onSelect(client.id)} type="button" className={`w-60 shrink-0 rounded-lg border px-3 py-3 text-left text-sm lg:w-full ${props.selectedId === client.id ? "border-amber-400 bg-amber-50" : "border-zinc-200 bg-white hover:bg-zinc-50"}`}>
              <span className="block truncate font-semibold">{client.username}</span>
              <span className="block truncate text-xs text-zinc-500">{client.email}</span>
              {unread > 0 && <Badge>{unread} nova(s)</Badge>}
            </button>
          );
        })}
      </div>
      <ConversationThread
        messages={props.messages}
        selectedClient={props.selectedClient}
        replySubject={props.replySubject}
        replyContent={props.replyContent}
        busy={props.busy}
        onRead={props.onRead}
        onSubject={props.onSubject}
        onContent={props.onContent}
        onFile={props.onFile}
        onSubmit={props.onSubmit}
      />
    </div>
  );
}

function ConversationThread(props: {
  messages: MessageItem[];
  selectedClient?: AdminUser;
  replySubject: string;
  replyContent: string;
  busy: boolean;
  onRead: (id: number) => void;
  onSubject: (value: string) => void;
  onContent: (value: string) => void;
  onFile: (file: File | null) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-4 border-b border-zinc-200 pb-3">
        <p className="font-bold">{props.selectedClient?.username || "Selecione um cliente"}</p>
        <p className="text-sm text-zinc-500">{props.selectedClient?.email}</p>
      </div>
      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
        {props.messages.map((item) => (
          <div key={item.id} className={`flex ${item.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[92%] rounded-lg p-4 text-sm shadow-sm md:max-w-[78%] ${item.sender_role === "admin" ? "bg-zinc-900 text-white" : "bg-white text-zinc-800"}`}>
              <div className="mb-1 flex flex-col gap-1 text-xs opacity-75 sm:flex-row sm:justify-between">
                <span>{item.sender_role === "admin" ? "Admin" : item.name}</span>
                <span>{new Date(item.created_at).toLocaleString()}</span>
              </div>
              {item.subject && <p className="font-semibold">{item.subject}</p>}
              <p className="mt-2 break-words leading-6">{item.content}</p>
              {item.attachment_url && (
                <a className="mt-3 inline-block rounded-lg bg-black/10 px-3 py-2 underline" href={resolveAssetUrl(item.attachment_url)} target="_blank" rel="noreferrer">
                  {item.attachment_name || "Abrir anexo"}
                </a>
              )}
              {item.sender_role !== "admin" && !item.is_read && (
                <button className="mt-3 block text-xs underline" type="button" onClick={() => props.onRead(item.id)}>Marcar lida</button>
              )}
            </div>
          </div>
        ))}
        {!props.messages.length && <EmptyState icon={MessageSquareText} text="Sem mensagens com este cliente." />}
      </div>
      <form onSubmit={props.onSubmit} className="mt-4 grid gap-3">
        <TextInput placeholder="Assunto" value={props.replySubject} onChange={props.onSubject} />
        <textarea className="min-h-24 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm" placeholder="Mensagem para o cliente" value={props.replyContent} onChange={(e) => props.onContent(e.target.value)} required />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm" type="file" onChange={(e) => props.onFile(e.target.files?.[0] || null)} />
          <ActionButton icon={Send} disabled={props.busy || !props.selectedClient}>Enviar</ActionButton>
        </div>
      </form>
    </div>
  );
}

function QuotesTable({ quotes, onStatus }: { quotes: Quote[]; onStatus: (id: number, status: string) => void }) {
  return (
    <DataTable headers={["Cliente", "Email", "Servico", "Local", "Estado", "Alterar"]}>
      {quotes.map((item) => (
        <tr key={item.id} className="border-b border-zinc-100">
          <td className="p-3 font-semibold">{item.client_name}</td>
          <td className="p-3">{item.client_email}</td>
          <td className="p-3">{item.service_type}</td>
          <td className="p-3">{item.location || "N/A"}</td>
          <td className="p-3">{item.status}</td>
          <td className="p-3">
            <select className="rounded-lg border border-zinc-200 px-3 py-2 text-sm" value={item.status} onChange={(e) => onStatus(item.id, e.target.value)}>
              <option value="pendente">Pendente</option>
              <option value="analise">Em analise</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </td>
        </tr>
      ))}
      {!quotes.length && (
        <tr>
          <td className="p-4 text-sm text-zinc-500" colSpan={6}>Sem orcamentos para apresentar.</td>
        </tr>
      )}
    </DataTable>
  );
}

function ProjectList({ projects, selectedId, onSelect }: { projects: ProjectItem[]; selectedId: number | null; onSelect: (id: number) => void }) {
  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <button key={project.id} type="button" onClick={() => onSelect(project.id)} className={`w-full rounded-lg border p-3 text-left transition ${selectedId === project.id ? "border-amber-400 bg-amber-50" : "border-zinc-200 bg-white hover:bg-zinc-50"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{project.title}</p>
              <p className="truncate text-sm text-zinc-500">{project.client_name || "Sem cliente"} {project.location ? `- ${project.location}` : ""}</p>
            </div>
            <Badge>{project.status}</Badge>
          </div>
          <div className="mt-3 flex gap-2 text-xs text-zinc-500">
            <span>{project.documents_count || 0} docs</span>
            <span>{project.images_count || 0} imagens</span>
          </div>
        </button>
      ))}
      {!projects.length && <EmptyState icon={FolderOpen} text="Ainda nao existem obras registadas." />}
    </div>
  );
}

function DocumentCard({ item, onDelete }: { item: ProjectDocument; onDelete: (id: number) => void }) {
  const type = documentTypes.find((doc) => doc.value === item.document_type);
  const Icon = type?.icon || FileText;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Icon className="h-4 w-4 text-amber-600" />
            <Badge>{type?.label || item.document_type}</Badge>
          </div>
          <p className="truncate font-semibold">{item.title}</p>
          <p className="truncate text-sm text-zinc-500">{item.file_name}</p>
          {item.amount ? <p className="mt-2 text-sm font-semibold">{money(item.amount)}</p> : null}
        </div>
        <button type="button" onClick={() => onDelete(item.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Eliminar documento">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <a className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white" href={resolveAssetUrl(item.file_url)} target="_blank" rel="noreferrer">
        <FileText className="h-4 w-4" />
        Abrir ficheiro
      </a>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 break-words text-lg font-bold text-zinc-950">{title}</h2>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  );
}

function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full min-w-[720px] bg-white text-sm">
        <thead className="bg-zinc-50 text-zinc-600">
          <tr>{headers.map((item) => <th key={item} className="whitespace-nowrap p-3 text-left font-semibold">{item}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 break-words font-semibold">{value}</p>
    </div>
  );
}

function TextInput({ value, onChange, type = "text", placeholder, required }: {
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      className="min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  );
}

function ActionButton({ icon: Icon, children, disabled }: { icon: LucideIcon; children: ReactNode; disabled?: boolean }) {
  return (
    <button type="submit" disabled={disabled} className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-3 text-sm font-bold text-zinc-950 disabled:opacity-60">
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function SmallButton({ children, onClick, danger }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-lg px-3 py-2 text-sm font-semibold ${danger ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"}`}>
      {children}
    </button>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">{children}</span>;
}

function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
      <Icon className="mx-auto mb-2 h-6 w-6 text-zinc-400" />
      {text}
    </div>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(value);
}
