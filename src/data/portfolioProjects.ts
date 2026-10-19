import type { PortfolioItem } from "../services/api";

export type PortfolioGalleryImage = {
  src: string;
  alt: string;
  caption: string;
};

export type LocalPortfolioProject = PortfolioItem & {
  gallery: PortfolioGalleryImage[];
  isLocalProject: true;
};

const projectPath = "/projetos/nelson-neto-belo-horizonte";

export const nelsonNetoProject: LocalPortfolioProject = {
  id: -7,
  title: "Vivenda Unifamiliar — Nelson Neto",
  description: "Estudo residencial contemporâneo para uma vivenda unifamiliar, com integração entre fachada, jardim, garagem e área de lazer com piscina.",
  category: "residencial",
  image_url: `${projectPath}/fachada-principal.jpg`,
  location: "Bairro Belo Horizonte, Luanda",
  year: 2023,
  is_active: true,
  isLocalProject: true,
  gallery: [
    { src: `${projectPath}/fachada-principal.jpg`, alt: "Fachada principal da Vivenda Nelson Neto", caption: "Fachada principal e entrada" },
    { src: `${projectPath}/fachada-perspetiva.jpg`, alt: "Perspetiva da fachada da Vivenda Nelson Neto", caption: "Perspetiva da fachada e garagem" },
    { src: `${projectPath}/piscina.jpg`, alt: "Piscina e jardim da Vivenda Nelson Neto", caption: "Área de lazer com piscina" },
    { src: `${projectPath}/area-lazer.jpg`, alt: "Espaço exterior junto à piscina da Vivenda Nelson Neto", caption: "Deck e zona de descanso" },
    { src: `${projectPath}/terreno-01.jpg`, alt: "Terreno do projeto no Bairro Belo Horizonte", caption: "Contexto inicial do terreno" },
    { src: `${projectPath}/terreno-02.jpg`, alt: "Envolvente do terreno do projeto", caption: "Envolvente urbana" },
    { src: `${projectPath}/terreno-03.jpg`, alt: "Acesso ao terreno do projeto", caption: "Acesso ao lote" },
  ],
};

export const localPortfolioProjects = [nelsonNetoProject];
