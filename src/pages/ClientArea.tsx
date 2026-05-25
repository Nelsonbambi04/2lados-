import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LogIn,
  User,
  FileText,
  MessageSquare,
  Calendar,
  Download,
  Bell,
  Settings,
  LogOut,
  Home,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
} from "lucide-react";
import { mockClients, clientProjects, ClientProject } from "../data/mockData";
import logo from "../assets/dois-lados-logo.png";

// ============================================
// CLIENT AREA PAGE - Login + Dashboard
// Sistema de autenticação simulado
// Dashboard com acompanhamento de obras
// ============================================

interface User {
  email: string;
  name: string;
}

export default function ClientArea() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "documents" | "messages" | "schedule"
  >("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados do formulário de login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Efeito: Verificar se há sessão (localStorage simulado)
  useEffect(() => {
    const savedUser = localStorage.getItem("dl_user") || localStorage.getItem("doislados_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsLoggedIn(true);
      navigate(parsedUser.is_admin ? "/admin" : "/cliente/dashboard");
    }
  }, [navigate]);

  // Handler de login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // mantém o cookie de sessão do Flask
        body: JSON.stringify({
          email,
          password,
          remember: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message =
          data?.error ||
          (response.status === 401
            ? "Email ou palavra-passe incorretos."
            : "Não foi possível iniciar sessão.");
        setError(message);
        return;
      }

      const userData = {
        email: data.user.email,
        name: data.user.username || data.user.email,
      };

      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem("doislados_user", JSON.stringify(userData));
      localStorage.setItem("dl_user", JSON.stringify(data.user));
      setError("");
      navigate(data.user.is_admin ? "/admin" : "/cliente/dashboard");
    } catch (err) {
      setError(
        "Erro de ligação ao servidor. Confirme se o backend está a correr em http://127.0.0.1:5000.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handler de logout
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("doislados_user");
    localStorage.removeItem("dl_user");
    setEmail("");
    setPassword("");
    navigate("/");
  };

  if (isLoggedIn) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-slate-600">A redirecionar...</div>
      </main>
    );
  }

  // ============================================
  // RENDER: LOGIN FORM
  // ============================================
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <img
                src={logo}
                alt="Dois Lados"
                className="h-12 w-auto flex-shrink-0 object-contain"
              />
              <span className="font-bold text-xl leading-tight text-slate-900">
                Dois Lados
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Área do Cliente
            </h1>
            <p className="text-slate-600">
              Aceda à sua conta para acompanhar o seu projeto.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Palavra-passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    A processar...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Entrar
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 text-center mb-2">
                Credenciais de demonstração:
              </p>
              <div className="text-xs text-slate-600 font-mono text-center">
                <p>Email: cliente@exemplo.com</p>
                <p>Senha: cliente123</p>
              </div>
            </div>
          </div>

          {/* Help Link */}
          <div className="text-center mt-6">
            <p className="text-slate-600 text-sm">
              Não tem conta?{" "}
              <Link
                to="/contactos"
                className="text-yellow-600 font-semibold hover:text-yellow-700"
              >
                Contacte-nos
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // RENDER: DASHBOARD
  // ============================================
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Dashboard Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Bem-vindo, {user?.name}!
                </h1>
                <p className="text-sm text-slate-500">
                  Acompanhe o seu projeto em tempo real
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
                <nav className="space-y-1">
                  {[
                    { id: "overview", label: "Visão Geral", icon: Home },
                    { id: "documents", label: "Documentos", icon: FileText },
                    { id: "messages", label: "Mensagens", icon: MessageSquare },
                    { id: "schedule", label: "Cronograma", icon: Calendar },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-yellow-400 text-slate-900"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Project Cards */}
                  {clientProjects.map((project) => (
                    <ProjectOverviewCard key={project.id} project={project} />
                  ))}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        65%
                      </div>
                      <div className="text-sm text-slate-500">
                        Progresso Médio
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">3</div>
                      <div className="text-sm text-slate-500">Documentos</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">2</div>
                      <div className="text-sm text-slate-500">Mensagens</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        90
                      </div>
                      <div className="text-sm text-slate-500">
                        Dias Restantes
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === "documents" && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">
                    Documentos do Projeto
                  </h2>
                  <div className="space-y-3">
                    {clientProjects[0].documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {doc.name}
                            </p>
                            <p className="text-sm text-slate-500">{doc.date}</p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-white rounded-lg transition-colors">
                          <Download className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === "messages" && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">
                    Mensagens
                  </h2>
                  <div className="space-y-4">
                    {clientProjects[0].messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl ${
                          msg.from === "João Santos"
                            ? "bg-yellow-400/10 ml-8"
                            : "bg-slate-50 mr-8"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              msg.from === "João Santos"
                                ? "bg-yellow-400"
                                : "bg-slate-300"
                            }`}
                          >
                            <User className="w-4 h-4 text-slate-900" />
                          </div>
                          <span className="font-medium text-slate-900">
                            {msg.from}
                          </span>
                          <span className="text-sm text-slate-500">
                            {msg.date}
                          </span>
                        </div>
                        <p className="text-slate-700">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                  {/* Reply Box */}
                  <div className="mt-6 flex gap-3">
                    <input
                      type="text"
                      placeholder="Escreva uma mensagem..."
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-xl transition-colors">
                      Enviar
                    </button>
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === "schedule" && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">
                    Cronograma do Projeto
                  </h2>

                  {/* Timeline */}
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                    <div
                      className="absolute left-4 top-0 w-0.5 bg-yellow-400"
                      style={{ height: "65%" }}
                    />

                    <div className="space-y-6">
                      {[
                        {
                          label: "Fundações",
                          status: "complete",
                          date: "15 Mar 2024",
                        },
                        {
                          label: "Estrutura",
                          status: "complete",
                          date: "20 Mai 2024",
                        },
                        {
                          label: "Alvenarias",
                          status: "complete",
                          date: "10 Jul 2024",
                        },
                        {
                          label: "Cobertura",
                          status: "current",
                          date: "Em progresso",
                        },
                        {
                          label: "Acabamentos",
                          status: "pending",
                          date: "Previsto: Set 2024",
                        },
                        {
                          label: "Entrega",
                          status: "pending",
                          date: "Previsto: Nov 2024",
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="relative flex items-start gap-4 pl-10"
                        >
                          {/* Icon */}
                          <div
                            className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              item.status === "complete"
                                ? "bg-green-500 text-white"
                                : item.status === "current"
                                  ? "bg-yellow-400 text-slate-900"
                                  : "bg-slate-200 text-slate-400"
                            }`}
                          >
                            {item.status === "complete" && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {item.status === "current" && (
                              <Clock className="w-4 h-4" />
                            )}
                            {item.status === "pending" && (
                              <AlertCircle className="w-4 h-4" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pt-1">
                            <p
                              className={`font-medium ${
                                item.status === "pending"
                                  ? "text-slate-400"
                                  : "text-slate-900"
                              }`}
                            >
                              {item.label}
                            </p>
                            <p className="text-sm text-slate-500">
                              {item.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ============================================
// PROJECT OVERVIEW CARD COMPONENT
// ============================================
function ProjectOverviewCard({ project }: { project: ClientProject }) {
  const statusConfig = {
    "em-planeamento": {
      label: "Em Planeamento",
      color: "bg-blue-100 text-blue-700",
      icon: AlertCircle,
    },
    "em-obra": {
      label: "Em Obra",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    concluido: {
      label: "Concluído",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
  };

  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {project.name}
              </h3>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <span className="w-4 h-4">📍</span>
                {project.address}
              </p>
            </div>
          </div>
          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}
          >
            <StatusIcon className="w-4 h-4" />
            {status.label}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            Progresso Global
          </span>
          <span className="text-sm font-bold text-slate-900">
            {project.progress}%
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">Data de Início</p>
            <p className="font-medium text-slate-900">
              {new Date(project.startDate).toLocaleDateString("pt-AO")}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Data Prevista</p>
            <p className="font-medium text-slate-900">
              {new Date(project.endDate).toLocaleDateString("pt-AO")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
