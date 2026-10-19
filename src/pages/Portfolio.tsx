import { useEffect, useState } from "react";
import { Search, MapPin, Calendar, ArrowUpRight, Images, X } from "lucide-react";
import MediaImage from "../components/MediaImage";
import { LocalPortfolioProject, localPortfolioProjects } from "../data/portfolioProjects";

type Category = "todos" | "residencial" | "comercial" | "urbanismo";

const categories: { id: Category; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "residencial", label: "Residencial" },
  { id: "comercial", label: "Comercial" },
  { id: "urbanismo", label: "Urbanismo" },
];
const resolveAssetUrl = (url: string) => url;

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<Category>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<LocalPortfolioProject | null>(null);
  const loading = false;
  const loadingMore = false;
  const error = "";
  const pagination = null;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const localItems = localPortfolioProjects.filter((project) => {
    const categoryMatches = activeCategory === "todos" || project.category === activeCategory;
    const searchable = `${project.title} ${project.description} ${project.location}`.toLowerCase();
    return categoryMatches && searchable.includes(debouncedSearch.toLowerCase());
  });
  // O portfólio público apresenta apenas os registos reais validados pela equipa.
  const visibleItems = localItems;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 py-12 text-white sm:py-16">
        <div className="container mx-auto px-4">
          <span className="inline-block px-4 py-1.5 bg-yellow-400/20 text-yellow-300 text-sm font-semibold rounded-full mb-4">
            Portfólio
          </span>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Os Nossos Projetos
          </h1>
          <p className="text-slate-300 max-w-3xl">
            Conheça alguns dos projetos desenvolvidos pela nossa equipa.
          </p>
        </div>
      </section>

      <section className="py-6 bg-white border-b border-slate-100">
        <div className="container mx-auto flex flex-col items-start justify-between gap-4 px-4 md:flex-row md:items-center">
          <div className="-mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === c.id
                    ? "bg-yellow-400 text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
        <div className="container mx-auto px-4 mt-2 text-sm text-slate-500">
          {localItems.length} projeto{localItems.length !== 1 ? "s" : ""} encontrado{localItems.length !== 1 ? "s" : ""}
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          {loading && visibleItems.length === 0 ? (
            <LoadingLogo label="A carregar portfólio..." />
          ) : visibleItems.length ? (
            <>
              {error && <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-center text-sm text-yellow-900">Alguns projetos não puderam ser atualizados agora. Tente novamente mais tarde.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleItems.map((project) => (
                <article
                  key={project.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition"
                >
                  <div className="relative">
                    {project.image_url ? (
                      <MediaImage src={"isLocalProject" in project ? project.image_url : resolveAssetUrl(project.image_url)} alt={project.title} className="h-56 w-full bg-slate-100 object-cover" style={{ objectPosition: project.coverPosition || "center" }} fallbackLabel="Imagem do projeto indisponível" />
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-slate-100 text-sm text-slate-500">Fotografia em preparação</div>
                    )}
                    <span className="absolute top-4 left-4 px-3 py-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full">
                      {project.category?.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-3 p-5 sm:p-6">
                    <h3 className="break-words text-xl font-bold text-slate-900">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {project.location || "—"}
                      </span>
                      {project.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {project.year}
                        </span>
                      )}
                    </div>
                    {"isLocalProject" in project ? (
                      <button onClick={() => setSelectedProject(project)} className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-700 transition hover:text-yellow-800">
                        Ver projeto <Images className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 text-sm font-semibold text-yellow-600">Ver detalhes <ArrowUpRight className="w-4 h-4" /></span>
                    )}
                  </div>
                </article>
              ))}
            </div>
            </>
          ) : (
            <div className="text-center text-slate-500">Nenhum projeto.</div>
          )}
          {!loading && pagination?.has_next && (
            <div className="mt-10 text-center">
              <button onClick={() => setPage((current) => current + 1)} disabled={loadingMore} className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {loadingMore ? "A carregar..." : "Carregar mais projetos"}
              </button>
            </div>
          )}
        </div>
      </section>
      {selectedProject && <ProjectGallery project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </main>
  );
}

function ProjectGallery({ project, onClose }: { project: LocalPortfolioProject; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Galeria do projeto ${project.title}`}>
      <div className="mx-auto max-w-6xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-2xl border-b border-slate-100 bg-white p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">Projeto residencial · {project.year}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">{project.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{project.location}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100" aria-label="Fechar galeria"><X className="h-6 w-6" /></button>
        </div>
        <div className="p-5 sm:p-7">
          <p className="max-w-3xl text-slate-600">{project.description}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {project.gallery.map((image, index) => (
              <figure key={image.src} className={index === 0 ? "sm:col-span-2" : ""}>
                <MediaImage src={image.src} alt={image.alt} className={`w-full rounded-xl bg-slate-100 object-cover ${index === 0 ? "max-h-[560px]" : "aspect-[4/3]"}`} fallbackLabel="Imagem do projeto indisponível" />
                <figcaption className="mt-2 text-sm text-slate-500">{image.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
