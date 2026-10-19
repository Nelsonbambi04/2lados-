import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, HardHat, Sofa, Calculator, MapPin, Phone, CheckCircle, Play } from 'lucide-react';
import { services, contactInfo } from '../data/mockData';
import { realProjectMedia } from '../data/realProjectMedia';
import { localPortfolioProjects } from '../data/portfolioProjects';
import MediaImage from '../components/MediaImage';

// ============================================
// HOME PAGE - Página Principal
// Conteúdo: Hero, Stats, Serviços, Projetos em destaque, CTA
// ============================================

export default function Home() {
  const featuredProjects = localPortfolioProjects;
  const heroSlides = [
    { src: "/projetos/vivenda-residencial/otimizadas/image1.jpg", alt: "Fachada de vivenda contemporânea", position: "center 52%" },
    { src: "/projetos/vivenda-residencial/otimizadas/image15.jpg", alt: "Área de lazer com piscina", position: "center 50%" },
    { src: "/projetos/portfolio-real/pdf-image-07.jpg", alt: "Interior residencial contemporâneo", position: "center center" },
    { src: "/projetos/portfolio-real/pdf-image-36.jpg", alt: "Projecto residencial contemporâneo", position: "center 48%" },
    { src: "/projetos/dois-lados/residencia-em-obra.jpeg", alt: "Residência em execução pela equipa Dois Lados", position: "center 44%" },
    { src: "/projetos/dois-lados/instalacao-eletrica.jpeg", alt: "Técnico da Dois Lados em instalação eléctrica", position: "center 24%" },
  ];
  const [activeSlide, setActiveSlide] = useState(0);
  const videoCovers = [
    "/projetos/dois-lados/fachada-em-execucao.jpeg",
    "/projetos/dois-lados/laje-fiscalizacao.jpeg",
    "/projetos/dois-lados/instalacao-eletrica.jpeg",
  ];
  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);
  const changeSlide = (direction: number) => setActiveSlide((current) => (current + direction + heroSlides.length) % heroSlides.length);

  return (
    <main className="min-h-screen">
      {/* ============================================
          HERO SECTION
          Imagem de fundo + Título impactante + CTA
          ============================================ */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center py-16 sm:min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-142px)]">
        {/* Background Slideshow */}
        <div className="absolute inset-0 overflow-hidden bg-slate-900">
          <MediaImage
            key={heroSlides[activeSlide].src}
            src={heroSlides[activeSlide].src}
            alt={heroSlides[activeSlide].alt}
            fallbackLabel="Fotografia de obra em atualização"
            className="h-full w-full object-cover"
            style={{ objectPosition: heroSlides[activeSlide].position }}
            loading="eager"
          />
          {/* Overlay Gradiente */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>

        {/* Conteúdo Hero */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl border-l-2 border-yellow-400 pl-5 sm:pl-8">
            {/* Badge */}
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full bg-yellow-400/20 px-3 py-2 text-sm font-medium text-yellow-400 backdrop-blur-sm sm:mb-6 sm:px-4">
              <Building2 className="w-4 h-4" />
              Arquitectura & Construção em Angola
            </div>

            {/* Título Principal */}
            <h1 className="mb-5 text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl">
              Do <span className="text-yellow-400">Traço</span> à <br />
              <span className="text-yellow-400">Obra</span>: Construímos o seu Futuro
            </h1>

            {/* Descrição */}
            <p className="mb-7 max-w-xl text-base text-slate-300 sm:text-lg md:mb-8 md:text-xl">
              Transformamos visões em realidade através de projetos arquitetônicos inovadores, 
              gestão rigorosa de obras e design de interiores excepcional.
            </p>

          </div>
        </div>

        <div className="absolute bottom-6 right-4 z-20 flex items-center gap-3 sm:bottom-8 sm:right-8 lg:right-12">
          <button onClick={() => changeSlide(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-slate-950/55 text-white backdrop-blur transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-slate-950" aria-label="Imagem anterior"><ArrowLeft className="h-4 w-4" /></button>
          <div className="flex gap-2" aria-label="Seleccionar imagem da capa">
            {heroSlides.map((slide, index) => <button key={slide.src} onClick={() => setActiveSlide(index)} aria-label={`Ver imagem ${index + 1}`} className={`h-2 rounded-full transition-all ${activeSlide === index ? "w-7 bg-yellow-400" : "w-2 bg-white/60 hover:bg-white"}`} />)}
          </div>
          <button onClick={() => changeSlide(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-slate-950/55 text-white backdrop-blur transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-slate-950" aria-label="Próxima imagem"><ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      {/* ============================================
          STATS SECTION
          Números que transmitem credibilidade
          ============================================ */}
      <section className="bg-white py-16 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-5 sm:gap-8 md:grid-cols-4">
            {[
              { value: '150+', label: 'Projetos Concluídos' },
              { value: '5', label: 'Anos de Experiência' },
              { value: '98%', label: 'Clientes Satisfeitos' },
              { value: '40+', label: 'Profissionais' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SERVIÇOS SECTION
          Cards dos 4 serviços principais
          ============================================ */}
      <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-yellow-400/10 text-yellow-600 text-sm font-semibold rounded-full mb-4">
              NOSSOS SERVIÇOS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Soluções Completas em Arquitectura
            </h2>
            <p className="text-slate-600">
              Oferecemos uma gama completa de serviços para transformar o seu projeto 
              numa realidade construída com excelência.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.id}
                to="/servicos"
                className="group rounded-2xl border border-slate-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400 hover:shadow-xl hover:shadow-yellow-400/10 sm:p-8"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-yellow-400/10 group-hover:bg-yellow-400 rounded-xl flex items-center justify-center mb-6 transition-colors">
                  {service.icon === 'Building2' && <Building2 className="w-7 h-7 text-yellow-600 group-hover:text-slate-900 transition-colors" />}
                  {service.icon === 'HardHat' && <HardHat className="w-7 h-7 text-yellow-600 group-hover:text-slate-900 transition-colors" />}
                  {service.icon === 'Sofa' && <Sofa className="w-7 h-7 text-yellow-600 group-hover:text-slate-900 transition-colors" />}
                  {service.icon === 'Calculator' && <Calculator className="w-7 h-7 text-yellow-600 group-hover:text-slate-900 transition-colors" />}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-yellow-600 transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {service.description}
                </p>

                {/* Learn More Link */}
                <div className="flex items-center text-yellow-600 font-semibold text-sm group-hover:text-yellow-700">
                  Saiba mais
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PROJETOS EM DESTAQUE
          Grid com 3 projetos recentes
          ============================================ */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-16 md:flex-row md:items-end">
            <div>
              <span className="inline-block px-4 py-1.5 bg-yellow-400/10 text-yellow-600 text-sm font-semibold rounded-full mb-4">
                PORTFÓLIO
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Projetos em Destaque
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-yellow-600 font-semibold hover:text-yellow-700 transition-colors"
            >
              Ver todos os projetos
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Projects Grid */}
          {featuredProjects.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {featuredProjects.map((project, index) => (
              <Link
                key={project.id}
                to="/portfolio"
                className="group relative overflow-hidden rounded-2xl"
              >
                {/* Image */}
                <MediaImage
                  src={project.image_url}
                  alt={project.title}
                  className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ objectPosition: project.coverPosition || "center" }}
                  fallbackLabel="Imagem do projeto indisponível"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full mb-3">
                    {project.category.toUpperCase()}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    {project.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
                    {project.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {project.location}
                      </span>
                    )}
                    {project.year && <span>{project.year}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Ainda não existem projetos publicados.
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-950 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 max-w-2xl sm:mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400/15 px-4 py-1.5 text-sm font-semibold text-yellow-300"><Play className="h-4 w-4" /> EM OBRA</span>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Veja o nosso trabalho no terreno</h2>
            <p className="mt-3 text-slate-300">Registos reais que mostram o rigor da execução e o acompanhamento da equipa.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {realProjectMedia.videos.map((video, index) => (
              <div key={video} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl">
                <video className="aspect-[9/16] w-full bg-black object-cover" controls preload="none" playsInline poster={videoCovers[index]} aria-label={`Vídeo de progresso de obra ${index + 1}`}>
                  <source src={video} type="video/mp4" />
                  O seu navegador não suporta vídeo HTML5.
                </video>
                <p className="px-4 py-3 text-sm font-medium text-slate-200">Progresso de obra {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          Chamada para ação final
          ============================================ */}
      <section className="relative overflow-hidden bg-slate-900 py-16 sm:py-20 lg:py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pronto para iniciar o seu projeto?
            </h2>
            <p className="text-lg text-slate-300 mb-8">
              Entre em contacto connosco para uma consulta gratuita. 
              Nossa equipe está pronta para transformar a sua visão em realidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contactos"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 font-bold text-slate-900 transition-all hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-400/30 sm:px-8 sm:py-4"
              >
                Agendar Consulta Gratuita
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 font-semibold text-white transition-all hover:bg-white/20 sm:px-8 sm:py-4"
              >
                <Phone className="w-5 h-5" />
                {contactInfo.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          WHY CHOOSE US
          Diferenciais da empresa
          ============================================ */}
      <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <MediaImage
                src={realProjectMedia.team}
                fallbackLabel="Fotografia da equipa em atualização"
                alt="Equipa Dois Lados em ação"
                className="h-full min-h-72 w-full rounded-2xl object-cover shadow-2xl"
              />
              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">5+</div>
                    <div className="text-sm text-slate-500">Anos de Excelência</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-yellow-400/10 text-yellow-600 text-sm font-semibold rounded-full mb-4">
                PORQUE NOS ESCOLHER
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Excelência em Cada Detalhe
              </h2>
              <p className="text-slate-600 mb-8">
                Na Dois Lados, combinamos experiência, inovação e compromisso para 
                entregar projetos que superam as expectativas dos nossos clientes.
              </p>

              {/* Features List */}
              <div className="space-y-4">
                {[
                  'Equipa técnica certificado e experiente',
                  'Projetos personalizados para cada cliente',
                  'Gestão transparente de orçamentos e prazos',
                  'Materiais de alta qualidade e sustentáveis',
                  'Acompanhamento completo da obra'
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-slate-900" />
                    </div>
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/servicos"
                className="inline-flex items-center gap-2 mt-8 text-yellow-600 font-semibold hover:text-yellow-700 transition-colors"
              >
                Conhecer todos os serviços
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
