import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, Phone, MapPin } from 'lucide-react';
import { navLinks, contactInfo } from '../../data/mockData';
import { useSearch, useSearchBar } from '../../hooks/useSearch';
import logo from '../../assets/dois-lados-logo.png';

// ============================================
// HEADER COMPONENT - NavegaÃ§Ã£o Principal
// ContÃ©m: Logo, Links, Pesquisa, CTA
// Responsivo: Menu hambÃºrguer no mobile
// ============================================

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { isExpanded, query, setQuery, expand, collapse } = useSearchBar();
  const searchResults = useSearch(query);

  // Efeito: Detectar scroll para mudar estilo do header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efeito: Fechar pesquisa ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        collapse();
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [collapse]);

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

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleSearchSelect = () => {
    collapse();
    setShowSearchResults(false);
  };

  return (
    <>
      {/* Header Principal */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        {/* NavegaÃ§Ã£o Principal */}
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex h-16 items-center justify-between sm:h-20 xl:h-24">
            {/* Logo */}
            <Link to="/" className="flex min-w-0 items-center gap-2.5 group">
              <img
                src={logo}
                alt="Dois Lados"
                className="h-9 w-auto flex-shrink-0 object-contain sm:h-12 xl:h-16"
              />
              <div className="min-w-0 leading-none">
                <span className="block truncate text-base font-bold leading-tight tracking-tight text-slate-900 sm:text-xl xl:text-2xl">Dois Lados</span>
                <span className="block truncate text-[10px] leading-tight text-slate-500 sm:text-xs xl:text-sm">Arquitetura & Construção</span>
              </div>
            </Link>

            {/* NavegaÃ§Ã£o Desktop */}
            <nav className="hidden xl:flex items-center gap-8 2xl:gap-10">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative font-medium text-base transition-colors ${
                      isActive
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                    {/* Indicador de pÃ¡gina ativa */}
                    <span
                      className={`absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 transition-transform origin-left ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      } group-hover:scale-x-100`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* AÃ§Ãµes: Pesquisa + CTA */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3 lg:gap-4">
              {/* Barra de Pesquisa */}
              <div ref={searchRef} className="relative hidden sm:block">
                <div
                  className={`flex items-center transition-all duration-300 ${
                    isExpanded ? 'w-44 md:w-56 xl:w-64' : 'w-10'
                  }`}
                >
                  {isExpanded ? (
                    <input
                      type="text"
                      placeholder="Pesquisar..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={handleSearchFocus}
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={expand}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                      aria-label="Abrir pesquisa"
                    >
                      <Search className="w-5 h-5 text-slate-600" />
                    </button>
                  )}
                  {isExpanded && (
                    <button
                      onClick={collapse}
                      className="absolute left-3 p-1 hover:bg-slate-200 rounded-full transition-colors"
                      aria-label="Fechar pesquisa"
                    >
                      <Search className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>

                {/* Dropdown de Resultados */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-3 border-b border-slate-100">
                      <span className="text-xs font-medium text-slate-500">
                        {searchResults.length} resultado{searchResults.length > 1 ? 's' : ''} encontrado{searchResults.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((result) => (
                        <Link
                          key={`${result.type}-${result.id}`}
                          to={result.path}
                          onClick={handleSearchSelect}
                          className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            result.type === 'servico' ? 'bg-yellow-100 text-yellow-600' :
                            result.type === 'projeto' ? 'bg-blue-100 text-blue-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {result.type === 'servico' && <Search className="w-4 h-4" />}
                            {result.type === 'projeto' && <Search className="w-4 h-4" />}
                            {result.type === 'pagina' && <Search className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">{result.title}</p>
                            <p className="text-xs text-slate-500 truncate">{result.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sem resultados */}
                {showSearchResults && query.length >= 2 && searchResults.length === 0 && (
                  <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 bg-white rounded-xl shadow-2xl border border-slate-100 p-6 text-center">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm">Nenhum resultado para "{query}"</p>
                    <p className="text-slate-400 text-xs mt-1">Tente outro termo de pesquisa</p>
                  </div>
                )}
              </div>

              {/* BotÃ£o Ãrea do Cliente */}
              <Link
                to="/cliente"
                className="hidden lg:flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold text-base rounded-full transition-all hover:shadow-lg hover:shadow-yellow-400/30"
              >
                <User className="w-4 h-4" />
                Área do Cliente
              </Link>

              {/* Menu HambÃºrguer (Mobile) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
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
        <div id="mobile-menu" className="fixed inset-0 z-[60] xl:hidden">
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

              {/* BotÃ£o CTA Mobile */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <Link
                  to="/cliente"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-xl transition-colors"
                >
                  <User className="w-5 h-5" />
                  Área do Cliente
                </Link>
              </div>

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
      <div className="h-16 sm:h-20 xl:h-24" />
    </>
  );
}
