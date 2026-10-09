// ============================================
// DOIS LADOS - Dados Mock para Desenvolvimento
// Preparado para integração com backend Flask
// ============================================

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  details: string;
}

export interface Project {
  id: string;
  title: string;
  category: 'residencial' | 'comercial' | 'urbanismo';
  image: string;
  location: string;
  year: number;
  description: string;
  images: string[];
}

export interface ClientProject {
  id: string;
  name: string;
  address: string;
  status: 'em-planeamento' | 'em-obra' | 'concluido';
  progress: number;
  startDate: string;
  endDate: string;
  documents: { name: string; date: string }[];
  messages: { from: string; content: string; date: string }[];
}

// ============================================
// SERVIÇOS
// ============================================
export const services: Service[] = [
  {
    id: 'projeto-arquitetonico',
    title: 'Projeto Arquitetônico',
    description: 'Desenvolvemos projetos residenciais e comerciais que combinam funcionalidade, estética e inovação.',
    icon: 'Building2',
    features: [
      'Anteprojeto e estudo prévio',
      'Projeto Executivo completo',
      'Modelagem 3D e visualizações',
      'Compatibilização de projetos',
      'Aprovação em entidades competentes'
    ],
    details: 'Our architectural projects follow international standards, adapting to the Angolan context while incorporating sustainable practices and modern design principles.'
  },
  {
    id: 'fiscalizacao-obras',
    title: 'Fiscalização de Obras',
    description: 'Acompanhamento técnico rigoroso para garantir qualidade, prazo e orçamento em cada fase da construção.',
    icon: 'HardHat',
    features: [
      'Controlo de qualidade de materiais',
      'Gestão de cronograma de obras',
      'Coordenação de equipes',
      'Relatórios periódicos',
      'Conformidade com normas técnicas'
    ],
    details: 'Our site supervision team ensures that every construction phase meets the highest standards, providing transparent reporting to our clients.'
  },
  {
    id: 'design-interiores',
    title: 'Design de Interiores',
    description: 'Criamos espaços interiores funcionais e sofisticados, desde a conceptualização até à execução.',
    icon: 'Sofa',
    features: [
      'Conceito e direção artística',
      'Materiais e acabamentos',
      'Iluminação técnica',
      'Mobiliário sob medida',
      'Decoração e styling'
    ],
    details: 'We transform interior spaces into functional works of art, paying attention to every detail from lighting to furniture selection.'
  },
  {
    id: 'consultoria-orcamentacao',
    title: 'Consultoria e Orçamentação',
    description: 'Análise técnica e financeira detalhada para apoiar decisões de investimento em construção e remodelação.',
    icon: 'Calculator',
    features: [
      'Orçamentos detalhados',
      'Análise de viabilidade',
      'Estudo de mercado imobiliário',
      'Consultoria técnica independente',
      'Due diligence para investimentos'
    ],
    details: 'Our technical consulting services provide comprehensive analysis for informed decision-making in construction investments.'
  }
];

// ============================================
// PROJETOS / PORTFÓLIO
// ============================================
export const projects: Project[] = [
  {
    id: 'residência-t3-mirante',
    title: 'Residência T3 Mirante',
    category: 'residencial',
    image: '/projetos/obra-estrutura.jpg',
    location: 'Luanda, Maianga',
    year: 2024,
    description: 'Moradia unifamiliar T3 com áreas sociais amplas, piscina e jardim paisagístico. Design contemporâneo com materiais locais.',
    images: [
      '/projetos/obra-estrutura.jpg'
    ]
  },
  {
    id: 'edificio-comercial-11-setembro',
    title: 'Edifício Comercial 11 de Setembro',
    category: 'comercial',
    image: '/projetos/fiscalizacao-em-obra.jpg',
    location: 'Luanda, Centro',
    year: 2023,
    description: 'Edifício de 8 andares com espaços comerciais no rés-do-chão e escritórios nas plantas superiores. Fachada em vidro e betão.',
    images: [
      '/projetos/fiscalizacao-em-obra.jpg'
    ]
  },
  {
    id: 'urbanismo-cacuaco',
    title: 'Projeto Urbano Cacuaco',
    category: 'urbanismo',
    image: '/projetos/visita-tecnica.jpg',
    location: 'Cacuaco, Luanda',
    year: 2023,
    description: 'Projeto de urbanização para 150 lotes com zonas verdes, equipamentos sociais e infraestrutura moderna.',
    images: [
      '/projetos/visita-tecnica.jpg'
    ]
  },
  {
    id: 'apartamento-t5-talatona',
    title: 'Apartamento T5 Talatona',
    category: 'residencial',
    image: '/projetos/acabamentos-interior.jpg',
    location: 'Talatona, Luanda',
    year: 2024,
    description: 'Apartamento de luxo com vista panorâmica, acabamentos premium e integração de tecnologia smart home.',
    images: [
      '/projetos/acabamentos-interior.jpg'
    ]
  },
  {
    id: 'sede-empresa-petroleo',
    title: 'Sede Empresa Petrolífera',
    category: 'comercial',
    image: '/projetos/equipa-capacetes.jpg',
    location: 'Luanda, Ingombota',
    year: 2022,
    description: 'Sede corporativa com 12.000m², espaços colaborativos, auditorium e rooftop garden. Certificação LEED白银.',
    images: [
      '/projetos/equipa-capacetes.jpg'
    ]
  },
  {
    id: 'centro-comercial-viana',
    title: 'Centro Comercial Viana',
    category: 'urbanismo',
    image: '/projetos/equipa-em-obra.jpg',
    location: 'Viana, Luanda',
    year: 2024,
    description: 'Complexo comercial com 200 lojas, praça de alimentação, cinema e parque de estacionamento para 500 viaturas.',
    images: [
      '/projetos/equipa-em-obra.jpg'
    ]
  }
];

// ============================================
// DADOS DO CLIENTE (Simulação)
// ============================================
export const mockClients = [
  { email: 'cliente@exemplo.com', password: 'cliente123', name: 'João Santos' },
  { email: 'admin@doislados.com', password: 'admin123', name: 'Administrador' }
];

export const clientProjects: ClientProject[] = [
  {
    id: 'proj-001',
    name: "Moradia Santos' Residence",
    address: 'Rua Comandante Gika, Maianga, Luanda',
    status: 'em-obra',
    progress: 65,
    startDate: '2024-03-15',
    endDate: '2024-11-30',
    documents: [
      { name: 'Alvará de Construção', date: '2024-03-10' },
      { name: 'Projeto Executivo', date: '2024-03-14' },
      { name: 'Relatório Mensal - Agosto', date: '2024-08-31' }
    ],
    messages: [
      { from: 'Equipo Técnica', content: 'Fundações concluídas. Início da estrutura previsto para próxima semana.', date: '2024-08-15' },
      { from: 'João Santos', content: 'Confirmado. Por favor enviem fotos do progresso.', date: '2024-08-16' }
    ]
  }
];

// ============================================
// INFORMAÇÕES DE CONTACTO
// ============================================
export const contactInfo = {
  address: 'Ngola Kiluanje\nLuanda, Angola',
  phone: '+244 939 876 700',
  email: 'geral@doislados.ao',
  workingHours: 'Segunda a Sexta: 8h00 - 18h00\nSábado: 9h00 - 13h00',
  coordinates: { lat: -8.8383, lng: 13.2344 }
};

// ============================================
// REDES SOCIAIS
// ============================================
export const socialLinks = [
  { name: 'Facebook', url: 'https://facebook.com/doislados', icon: 'Facebook' },
  { name: 'Instagram', url: 'https://instagram.com/doislados', icon: 'Instagram' },
  { name: 'LinkedIn', url: 'https://linkedin.com/company/doislados', icon: 'Linkedin' }
];

// ============================================
// NAVIGATION LINKS
// ============================================
export const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Serviços', path: '/servicos' },
  { label: 'Portfólio', path: '/portfolio' },
  { label: 'Área do Cliente', path: '/cliente' },
  { label: 'Publicações', path: '/publicacoes' },
  { label: 'Contactos', path: '/contactos' }
];
