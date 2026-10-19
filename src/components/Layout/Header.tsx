import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MapPin } from 'lucide-react';
import { navLinks, contactInfo } from '../../data/mockData';
import logo from '../../assets/dois-lados-logo.png';

// ============================================
// HEADER COMPONENT - NavegaÃ§Ã£o Principal
// ContÃ©m: Logo, Links, Pesquisa, CTA
// Responsivo: Menu hambÃºrguer no mobile
// ============================================

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Efeito: Detectar scroll para mudar estilo do header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efeito: Fechar menu mobile ao mudar de pÃ¡gina
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Efeito: Bloquear scroll quando menu mobile estÃ¡ aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Header Principal */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm'
            : 'border-b border-slate-100 bg-white/95 backdrop-blur-sm'
        }`}
      >
        {/* NavegaÃ§Ã£o Principal */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between md:h-24">
            {/* Logo */}
            <Link to="/" className="flex min-w-0 items-center gap-2.5 group">
              <img
                src={logo}
                alt="Dois Lados"
                className="h-10 w-auto flex-shrink-0 object-contain sm:h-12"
              />
              <div className="min-w-0 leading-none">
                <span className="block truncate text-base font-bold leading-tight tracking-tight text-slate-900 sm:text-xl">Dois Lados</span>
                <span className="block truncate text-[10px] leading-tight text-slate-500 sm:text-xs">Arquitetura & Construção</span>
              </div>
            </Link>

            {/* NavegaÃ§Ã£o Desktop */}
            <nav className="hidden items-center gap-6 min-[900px]:flex lg:gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative py-9 text-[10px] font-extrabold uppercase tracking-[0.15em] transition-colors lg:text-[11px] ${
                      isActive
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                    {/* Indicador de pÃ¡gina ativa */}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 w-full bg-yellow-500 transition-transform origin-left ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      } group-hover:scale-x-100`}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/contactos" className="hidden items-center bg-slate-950 px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white transition hover:bg-yellow-400 hover:text-slate-950 min-[900px]:inline-flex">
                Pedir Orçamento
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors min-[900px]:hidden"
                aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-700" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile Overlay */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="fixed inset-0 z-[60] min-[900px]:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl">
            {/* Header do Menu */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <Link to="/" className="flex items-center gap-2.5">
                <img
                  src={logo}
                  alt="Dois Lados"
                  className="h-10 w-auto flex-shrink-0 object-contain"
                />
                <div className="leading-none">
                  <span className="font-bold text-lg leading-tight text-slate-900">Dois Lados</span>
                  <span className="block text-[11px] leading-tight text-slate-500">Arquitetura & Construção</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Links de NavegaÃ§Ã£o */}
            <nav className="flex-1 p-4">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-yellow-400/10 text-yellow-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-yellow-400' : 'bg-slate-300'
                      }`} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <Link to="/contactos" className="mt-6 flex items-center justify-center bg-slate-950 px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-yellow-400 hover:text-slate-950">
                Pedir Orçamento
              </Link>

              {/* Contactos */}
              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900">Contacte-nos</h4>
                <div className="space-y-3 text-sm text-slate-600">
                  <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:text-yellow-700">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-yellow-600 shadow-sm">
                      <Phone className="h-4 w-4" />
                    </span>
                    <span className="font-medium leading-5">{contactInfo.phone}</span>
                  </a>
                  <p className="flex items-start gap-3 rounded-lg p-1">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-yellow-600 shadow-sm">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="whitespace-pre-line leading-5">{contactInfo.address}</span>
                  </p>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Spacer para compensar header fixo */}
      <div className="h-20 md:h-24" />
    </>
  );
}
