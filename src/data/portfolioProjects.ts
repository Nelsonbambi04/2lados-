export type PortfolioGalleryImage = { src: string; alt: string; caption: string };
export type LocalPortfolioProject = {
  id: number; title: string; description: string; category: "residencial" | "comercial" | "urbanismo";
  image_url: string; location: string; year: number; is_active: boolean; gallery: PortfolioGalleryImage[]; isLocalProject: true;
};

const root = "/projetos/dois-lados";
const presentationRoot = "/projetos/vivenda-residencial/otimizadas";
const pdfRoot = "/projetos/portfolio-real";
const photo = (file: string, alt: string, caption: string): PortfolioGalleryImage => ({ src: `${root}/${file}`, alt, caption });
const presentation = (file: string, alt: string, caption: string): PortfolioGalleryImage => ({ src: `${presentationRoot}/${file}`, alt, caption });
const pdf = (file: string, alt: string, caption: string): PortfolioGalleryImage => ({ src: `${pdfRoot}/${file}`, alt, caption });

export const localPortfolioProjects: LocalPortfolioProject[] = [
  {
    id: -11, title: "Design de Interiores Contemporâneo", category: "residencial", location: "Luanda, Angola", year: 2024, is_active: true, isLocalProject: true,
    description: "Concepção de interiores com ambientes funcionais, acabamentos elegantes e integração entre áreas sociais.", image_url: `${pdfRoot}/pdf-image-07.jpg`,
    gallery: [pdf("pdf-image-06.jpg", "Cozinha contemporânea", "Cozinha e área social"), pdf("pdf-image-07.jpg", "Sala de estar", "Ambiente social"), pdf("pdf-image-08.jpg", "Sala integrada", "Integração de espaços"), pdf("pdf-image-14.jpg", "Escadaria interior", "Detalhe arquitectónico"), pdf("pdf-image-18.jpg", "Cozinha com madeira", "Acabamentos interiores")],
  },
  {
    id: -10, title: "Empreendimento Arquitectónico", category: "comercial", location: "Luanda, Angola", year: 2024, is_active: true, isLocalProject: true,
    description: "Estudo arquitectónico com implantação, volumes contemporâneos e soluções para espaços colectivos.", image_url: `${pdfRoot}/pdf-image-25.jpg`,
    gallery: [pdf("pdf-image-25.jpg", "Implantação do empreendimento", "Estudo de implantação"), pdf("pdf-image-26.jpg", "Vista do empreendimento", "Perspectiva exterior"), pdf("pdf-image-27.jpg", "Espaço interior colectivo", "Ambiente de utilização"), pdf("pdf-image-28.jpg", "Estrutura comercial", "Volume arquitectónico"), pdf("pdf-image-31.jpg", "Vista geral do projecto", "Perspectiva urbana")],
  },
  {
    id: -9, title: "Construção Residencial e Fiscalização", category: "residencial", location: "Luanda, Angola", year: 2024, is_active: true, isLocalProject: true,
    description: "Acompanhamento técnico de construção residencial, da execução estrutural à entrega dos espaços exteriores.", image_url: `${pdfRoot}/pdf-image-36.jpg`,
    gallery: [pdf("pdf-image-36.jpg", "Fachada residencial", "Vista exterior"), pdf("pdf-image-37.jpg", "Fachada contemporânea", "Frente da residência"), pdf("pdf-image-38.jpg", "Moradia em obra", "Execução residencial"), pdf("pdf-image-41.jpg", "Estrutura em execução", "Progresso de obra"), pdf("pdf-image-46.jpg", "Fiscalização de laje", "Acompanhamento técnico"), pdf("pdf-image-48.jpg", "Inspecção de alvenaria", "Controlo de qualidade")],
  },
  {
    id: -8, title: "Vivenda Unifamiliar", category: "residencial", location: "Bairro Belo Horizonte, Luanda", year: 2023, is_active: true, isLocalProject: true,
    description: "Projecto residencial unifamiliar com fachada contemporânea, área de lazer e piscina.", image_url: `${presentationRoot}/image1.jpg`,
    gallery: [presentation("image1.jpg", "Fachada da vivenda", "Fachada principal"), presentation("image9.jpg", "Perspectiva lateral da vivenda", "Entrada e volume arquitectónico"), presentation("image10.jpg", "Piscina da vivenda", "Área de lazer com piscina"), presentation("image12.jpg", "Deck da piscina", "Espaço exterior de descanso")],
  },
  {
    id: -7, title: "Vivenda Unifamiliar — Marinela", category: "residencial", location: "Nova Vida, Viana", year: 2022, is_active: true, isLocalProject: true,
    description: "Estudo residencial com integração entre o interior, a piscina e a área de lazer.", image_url: `${presentationRoot}/image14.jpg`,
    gallery: [presentation("image14.jpg", "Fachada contemporânea", "Vista principal da vivenda"), presentation("image15.jpg", "Piscina e zona de estar", "Área de lazer"), presentation("image17.jpg", "Vista junto à piscina", "Integração exterior"), presentation("image18.jpg", "Entrada da vivenda", "Ambiente interior e acesso")],
  },
  {
    id: -1, title: "Construção residencial em execução", category: "residencial", location: "Luanda, Angola", year: 2026, is_active: true, isLocalProject: true,
    description: "Acompanhamento de uma residência desde a estrutura até aos acabamentos exteriores.", image_url: `${root}/fachada-em-execucao.jpeg`,
    gallery: [photo("fachada-em-execucao.jpeg", "Fachada residencial em execução", "Evolução da fachada"), photo("caixilharia.jpeg", "Instalação de caixilharia", "Acabamentos e caixilharia"), photo("acabamentos-exteriores.jpeg", "Área exterior em obra", "Preparação dos acabamentos exteriores")],
  },
  {
    id: -2, title: "Fiscalização e estrutura", category: "residencial", location: "Luanda, Angola", year: 2026, is_active: true, isLocalProject: true,
    description: "Fiscalização técnica de estruturas, lajes e alvenaria com acompanhamento em cada etapa.", image_url: `${root}/laje-fiscalizacao.jpeg`,
    gallery: [photo("laje-fiscalizacao.jpeg", "Fiscalização de laje", "Acompanhamento técnico de laje"), photo("estrutura.jpeg", "Estrutura em construção", "Verificação da estrutura"), photo("alvenaria.jpeg", "Execução de alvenaria", "Construção de alvenaria")],
  },
  {
    id: -3, title: "Planeamento e visita técnica", category: "comercial", location: "Luanda, Angola", year: 2026, is_active: true, isLocalProject: true,
    description: "Planeamento de projecto, análise no local e coordenação entre equipa e cliente.", image_url: `${root}/planeamento.jpeg`,
    gallery: [photo("planeamento.jpeg", "Análise de projecto", "Revisão técnica do projecto"), photo("visita-tecnica.jpeg", "Visita técnica ao terreno", "Levantamento e coordenação em obra"), photo("tecnico-em-obra.jpeg", "Técnico da Dois Lados em obra", "Presença técnica no local")],
  },
  {
    id: -4, title: "Instalações e equipa Dois Lados", category: "comercial", location: "Luanda, Angola", year: 2026, is_active: true, isLocalProject: true,
    description: "Execução e controlo de instalações técnicas por uma equipa especializada.", image_url: `${root}/instalacao-eletrica.jpeg`,
    gallery: [photo("instalacao-eletrica.jpeg", "Instalação elétrica", "Intervenção em quadro elétrico"), photo("equipa-obra.jpeg", "Equipa Dois Lados", "Equipa em obra"), photo("direcao.jpeg", "Direção Dois Lados", "Coordenação de projecto")],
  },
  {
    id: -5, title: "Residência: evolução da obra", category: "residencial", location: "Luanda, Angola", year: 2026, is_active: true, isLocalProject: true,
    description: "Registo da evolução de uma residência, desde a preparação estrutural até à execução em altura.", image_url: `${root}/residencia-em-obra.jpeg`,
    gallery: [photo("residencia-em-obra.jpeg", "Residência em evolução", "Estrutura residencial em execução"), photo("fachada-em-execucao.jpeg", "Fachada residencial", "Frente da obra"), photo("acabamentos-exteriores.jpeg", "Zona exterior", "Execução de acabamentos")],
  },
  {
    id: -6, title: "Coordenação de obra", category: "comercial", location: "Luanda, Angola", year: 2026, is_active: true, isLocalProject: true,
    description: "Planeamento, direcção e acompanhamento técnico para assegurar qualidade em cada fase.", image_url: `${root}/tecnico-em-obra.jpeg`,
    gallery: [photo("tecnico-em-obra.jpeg", "Técnico em obra", "Acompanhamento técnico"), photo("visita-tecnica.jpeg", "Visita ao local", "Coordenação de equipa"), photo("planeamento.jpeg", "Planeamento", "Análise de projecto")],
  },
];
