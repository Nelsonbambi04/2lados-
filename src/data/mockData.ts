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
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    location: 'Luanda, Maianga',
    year: 2024,
    description: 'Moradia unifamiliar T3 com áreas sociais amplas, piscina e jardim paisagístico. Design contemporâneo com materiais locais.',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'
    ]
  },
  {
    id: 'edificio-comercial-11-setembro',
    title: 'Edifício Comercial 11 de Setembro',
    category: 'comercial',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    location: 'Luanda, Centro',
    year: 2023,
    description: 'Edifício de 8 andares com espaços comerciais no rés-do-chão e escritórios nas plantas superiores. Fachada em vidro e betão.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
    ]
  },
  {
    id: 'urbanismo-cacuaco',
    title: 'Projeto Urbano Cacuaco',
    category: 'urbanismo',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
    location: 'Cacuaco, Luanda',
    year: 2023,
    description: 'Projeto de urbanização para 150 lotes com zonas verdes, equipamentos sociais e infraestrutura moderna.',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      'https://images.unsplash.com/photo-1518308326024-8ea4ac7c5c0a?w=800'
    ]
  },
  {
    id: 'apartamento-t5-talatona',
    title: 'Apartamento T5 Talatona',
    category: 'residencial',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    location: 'Talatona, Luanda',
    year: 2024,
    description: 'Apartamento de luxo com vista panorâmica, acabamentos premium e integração de tecnologia smart home.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ]
  },
  {
    id: 'sede-empresa-petroleo',
    title: 'Sede Empresa Petrolífera',
    category: 'comercial',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    location: 'Luanda, Ingombota',
    year: 2022,
    description: 'Sede corporativa com 12.000m², espaços colaborativos, auditorium e rooftop garden. Certificação LEED白银.',
    images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800'
    ]
  },
  {
    id: 'centro-comercial-viana',
    title: 'Centro Comercial Viana',
    category: 'urbanismo',
    image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800',
    location: 'Viana, Luanda',
    year: 2024,
    description: 'Complexo comercial com 200 lojas, praça de alimentação, cinema e parque de estacionamento para 500 viaturas.',
    images: [
      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800',
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800'
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
  phone: '+244 928 035 347',
  email: 'doislados08@gmail.com',
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
  { label: 'Publicacoes', path: '/publicacoes' },
  { label: 'Contactos', path: '/contactos' }
];
