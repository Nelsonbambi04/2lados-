// ============================================
// DOIS LADOS - Website Corporativo
// Escritório de Arquitectura e Construção
// ============================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Publications from './pages/Publications';
import ClientDashboard from './pages/ClientDashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import Contacts from './pages/Contacts';
import PropertyList from './components/PropertyList';

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
