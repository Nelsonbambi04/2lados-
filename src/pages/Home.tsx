import { Link } from 'react-router-dom';
import { ArrowRight, Building2, HardHat, Sofa, Calculator, MapPin, Phone, CheckCircle } from 'lucide-react';
import { services, projects, contactInfo } from '../data/mockData';

// ============================================
// HOME PAGE - Página Principal
// Conteúdo: Hero, Stats, Serviços, Projetos em destaque, CTA
// ============================================

export default function Home() {
  // Projetos em destaque (3 mais recentes)
  const featuredProjects = projects.slice(0, 3);

  return (
    <main className="min-h-screen">
      {/* ============================================
          HERO SECTION
          Imagem de fundo + Título impactante + CTA
          ============================================ */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center py-16 sm:min-h-[calc(100vh-5rem)] lg:min-h-[90vh]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')`
          }}
        >
          {/* Overlay Gradiente */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>

        {/* Conteúdo Hero */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full bg-yellow-400/20 px-3 py-2 text-sm font-medium text-yellow-400 backdrop-blur-sm sm:mb-6 sm:px-4">
              <Building2 className="w-4 h-4" />
              Arquitectura & Construção em Angola
            </div>

            {/* Título Principal */}
            <h1 className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
              Do <span className="text-yellow-400">Traço</span> à <br />
              <span className="text-yellow-400">Obra</span>: Construímos o seu Futuro
            </h1>

            {/* Descrição */}
            <p className="mb-7 max-w-xl text-base text-slate-300 sm:text-lg md:mb-8 md:text-xl">
              Transformamos visões em realidade através de projetos arquitetônicos inovadores, 
              gestão rigorosa de obras e design de interiores excepcional.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contactos"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 font-bold text-slate-900 transition-all hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-400/30 sm:px-8 sm:py-4"
              >
                Solicitar Orçamento
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:px-8 sm:py-4"
              >
                Ver Portfólio
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce sm:block">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <Link
                key={project.id}
                to="/portfolio"
                className={`group relative overflow-hidden rounded-2xl ${
                  index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                {/* Image */}
                <img
                  src={project.image}
                  alt={project.title}
                  className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                    index === 0 ? 'h-80 md:h-96' : 'h-64'
                  }`}
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
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {project.location}
                    </span>
                    <span>{project.year}</span>
                  </div>
                </div>
              </Link>
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
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80"
                alt="Equipa Dois Lados em ação"
                className="rounded-2xl shadow-2xl"
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
