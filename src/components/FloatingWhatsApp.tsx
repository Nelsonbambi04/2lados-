import { FaWhatsapp } from 'react-icons/fa';

const whatsappUrl =
  'https://wa.me/244954473365?text=Ol%C3%A1%2C%20preciso%20de%20assist%C3%AAncia.';

export default function FloatingWhatsApp() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-slate-950 shadow-xl shadow-yellow-600/30 transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-500 hover:shadow-2xl hover:shadow-yellow-600/40 focus:outline-none focus:ring-4 focus:ring-yellow-300 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      aria-label="Abrir assistência no WhatsApp"
      title="Assistência pelo WhatsApp"
    >
      <FaWhatsapp className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true" />
      <span className="sr-only">Assistência pelo WhatsApp</span>
    </a>
  );
}
