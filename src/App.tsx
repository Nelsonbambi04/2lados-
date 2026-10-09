// ============================================
// DOIS LADOS - Website Corporativo
// Escritório de Arquitectura e Construção
// ============================================

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';

const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Publications = lazy(() => import('./pages/Publications'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Contacts = lazy(() => import('./pages/Contacts'));
const PropertyList = lazy(() => import('./components/PropertyList'));

function PageLoader() {
  return <div className="min-h-[40vh] bg-slate-50" aria-busy="true" aria-label="A carregar página" />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Layout wrapper para todas as rotas */}
        <Route path="/" element={<Layout />}>
          {/* Página Principal */}
          <Route index element={<Home />} />
          
          {/* Página de Serviços */}
          <Route path="servicos" element={<Services />} />
          
          {/* Página de Portfólio */}
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="publicacoes" element={<Publications />} />
          
          {/* Área do Cliente (Login + Dashboard) */}
          <Route path="cliente" element={<ClientDashboard />} />
          <Route path="cliente/dashboard" element={<ClientDashboard />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Painel Admin (requer sessão admin) */}
          <Route path="admin" element={<AdminPanel />} />
          
          {/* Lista de Imóveis */}
          <Route path="imoveis" element={<PropertyList />} />
          
          {/* Página de Contactos */}
          <Route path="contactos" element={<Contacts />} />
        </Route>

        {/* Rota 404 - Página não encontrada */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-yellow-400 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Página Não Encontrada</h2>
                <p className="text-slate-600 mb-6">
                  A página que procura não existe ou foi movida.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-xl transition-colors"
                >
                  Voltar ao Início
                </a>
              </div>
            </div>
          }
        />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
