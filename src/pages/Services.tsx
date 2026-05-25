import { Link } from 'react-router-dom';
import { ArrowRight, Building2, HardHat, Sofa, Calculator, CheckCircle, Phone } from 'lucide-react';
import { services, contactInfo } from '../data/mockData';

// ============================================
// SERVIÇOS PAGE - Página de Serviços
// Lista completa dos 4 serviços com detalhes
// ============================================

export default function Services() {
  return (
    <main className="min-h-screen">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative py-24 bg-slate-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-yellow-400/20 text-yellow-400 text-sm font-semibold rounded-full mb-4">
              NOSSOS SERVIÇOS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Soluções Completas em Arquitectura e Construção
            </h1>
            <p className="text-xl text-slate-300">
              Oferecemos serviços especializados para todas as fases do seu projeto, 
              desde a conceção até à entrega final.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          SERVIÇOS DETALHADOS
          ============================================ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {services.map((service, index) => {
              const IconComponent = 
                service.icon === 'Building2' ? Building2 :
                service.icon === 'HardHat' ? HardHat :
                service.icon === 'Sofa' ? Sofa :
                Calculator;
              
              const isEven = index % 2 === 0;

              return (
                <div
                  key={service.id}
                  id={service.id}
                  className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                    !isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Content */}
                  <div className={!isEven ? 'lg:order-2' : ''}>
                    {/* Icon */}
                    <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mb-6">
                      <IconComponent className="w-8 h-8 text-slate-900" />
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                      {service.title}
                    </h2>

                    {/* Description */}
                    <p className="text-lg text-slate-600 mb-6">
                      {service.description}
                    </p>

                    {/* Detailed Description */}
                    <p className="text-slate-500 mb-8">
                      {service.details}
                    </p>

                    {/* Features List */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100">
                      <h4 className="font-semibold text-slate-900 mb-4">
                        O que inclui:
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-yellow-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle className="w-3 h-3 text-yellow-600" />
                            </div>
                            <span className="text-sm text-slate-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Link
                        to="/contactos"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-xl transition-all"
                      >
                        Solicitar Orçamento
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                      <Link
                        to="/portfolio"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                      >
                        Ver Projetos Relacionados
                      </Link>
                    </div>
                  </div>

                  {/* Image */}
                  <div className={!isEven ? 'lg:order-1' : ''}>
                    <div className="relative">
                      <img
                        src={
                          service.icon === 'Building2' 
                            ? 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80'
                            : service.icon === 'HardHat'
                            ? 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
                            : service.icon === 'Sofa'
                            ? 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80'
                            : 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80'
                        }
                        alt={service.title}
                        className="w-full h-80 lg:h-96 object-cover rounded-2xl shadow-2xl"
                      />
                      {/* Decorative Element */}
                      <div className={`absolute -z-10 w-full h-full bg-yellow-400/20 rounded-2xl ${
                        isEven ? '-bottom-4 -right-4' : '-top-4 -left-4'
                      }`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Pronto para iniciar o seu projeto?
              </h2>
              <p className="text-lg text-slate-800 mb-8">
                A nossa equipa está pronta para ajudá-lo a transformar a sua visão em realidade. 
                Entre em contacto para uma consulta gratuita.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contactos"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Solicitar Orçamento
                </Link>
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-slate-900 font-semibold rounded-xl transition-all"
                >
                  <Phone className="w-5 h-5" />
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ SECTION (Simplificado)
          ============================================ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-slate-600">
                Encontre respostas para as questões mais comuns sobre os nossos serviços.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: 'Quanto tempo demora um projeto arquitectónico?',
                  answer: 'O tempo varia conforme a complexidade. Um projeto residencial pode levar 2-4 meses, enquanto projetos comerciais podem requerer 6-12 meses.'
                },
                {
                  question: 'Vocês trabalham em todo Angola?',
                  answer: 'Sim, temos capacidade para desenvolver projetos em todo o território nacional, com ênfase em Luanda e provinces voisinhas.'
                },
                {
                  question: 'Como funciona o processo de fiscalização de obras?',
                  answer: 'A nossa equipa faz acompanhamento semanal da obra, com relatórios fotográficos e reuniões de progresso consigo.'
                },
                {
                  question: 'Oferecem garantias nos projetos?',
                  answer: 'Sim, todos os nossos projetos incluem garantia técnica e suporte pós-construção.'
                }
              ].map((faq, index) => (
                <details
                  key={index}
                  className="bg-white rounded-xl border border-slate-100 overflow-hidden group"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                    <span className="font-semibold text-slate-900">{faq.question}</span>
                    <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 group-open:rotate-180 transition-transform">
                      <ArrowRight className="w-4 h-4 text-slate-900 rotate-90" />
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-600">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
