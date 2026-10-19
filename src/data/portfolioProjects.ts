import type { PortfolioItem } from "../services/api";

export type PortfolioGalleryImage = { src: string; alt: string; caption: string };
export type LocalPortfolioProject = PortfolioItem & { gallery: PortfolioGalleryImage[]; isLocalProject: true };

const root = "/projetos/dois-lados";
const photo = (file: string, alt: string, caption: string): PortfolioGalleryImage => ({ src: `${root}/${file}`, alt, caption });

export const localPortfolioProjects: LocalPortfolioProject[] = [
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
];
