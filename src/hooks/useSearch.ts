// ============================================
// HOOK: useSearch
// Filtra conteúdo do site em tempo real
// Utiliza debounce para otimizar performance
// ============================================

import { useState, useMemo } from 'react';
import { services, projects } from '../data/mockData';

interface SearchResult {
  type: 'servico' | 'projeto' | 'pagina';
  id: string;
  title: string;
  description: string;
  path: string;
}

export function useSearch(query: string): SearchResult[] {
  // Resultados瞬間 retornados
  const results = useMemo(() => {
    if (query.length < 2) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const searchResults: SearchResult[] = [];

    // Filtrar serviços
    services.forEach((service) => {
      const matchesTitle = service.title.toLowerCase().includes(normalizedQuery);
      const matchesDescription = service.description.toLowerCase().includes(normalizedQuery);
      const matchesFeatures = service.features.some(f => f.toLowerCase().includes(normalizedQuery));

      if (matchesTitle || matchesDescription || matchesFeatures) {
        searchResults.push({
          type: 'servico',
          id: service.id,
          title: service.title,
          description: service.description,
          path: '/servicos'
        });
      }
    });

    // Filtrar projetos
    projects.forEach((project) => {
      const matchesTitle = project.title.toLowerCase().includes(normalizedQuery);
      const matchesLocation = project.location.toLowerCase().includes(normalizedQuery);
      const matchesCategory = project.category.toLowerCase().includes(normalizedQuery);

      if (matchesTitle || matchesLocation || matchesCategory) {
        searchResults.push({
          type: 'projeto',
          id: project.id,
          title: project.title,
          description: `${project.category} • ${project.location} • ${project.year}`,
          path: '/portfolio'
        });
      }
    });

    // Páginas estáticas
    const pages: { title: string; path: string }[] = [
      { title: 'Home', path: '/' },
      { title: 'Serviços', path: '/servicos' },
      { title: 'Portfólio', path: '/portfolio' },
      { title: 'Área do Cliente', path: '/cliente' },
      { title: 'Contactos', path: '/contactos' }
    ];

    pages.forEach(page => {
      if (page.title.toLowerCase().includes(normalizedQuery)) {
        searchResults.push({
          type: 'pagina',
          id: page.path,
          title: page.title,
          description: `Navegar para ${page.title}`,
          path: page.path
        });
      }
    });

    return searchResults;
  }, [query]);

  return results;
}

// Hook para controlar expansão da barra de pesquisa
export function useSearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');

  // Contrair quando detectar clique fora (implementado no componente)

  const expand = () => setIsExpanded(true);
  const collapse = () => {
    setIsExpanded(false);
    setQuery('');
  };

  return {
    isExpanded,
    query,
    setQuery,
    expand,
    collapse
  };
}
