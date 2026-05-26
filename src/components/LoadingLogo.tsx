import logo from "../assets/dois-lados-logo.png";

type LoadingLogoProps = {
  label?: string;
  fullScreen?: boolean;
};

export default function LoadingLogo({
  label = "A carregar...",
  fullScreen = false,
}: LoadingLogoProps) {
  return (
    <div
      className={`flex items-center justify-center bg-slate-50 px-4 ${
        fullScreen ? "min-h-screen" : "min-h-[260px]"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
          <span className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 border-r-yellow-400 animate-spin" />
          <span className="absolute inset-3 rounded-full bg-white shadow-lg shadow-slate-200/80" />
          <img
            src={logo}
            alt="Dois Lados"
            className="relative h-16 w-16 animate-pulse object-contain sm:h-20 sm:w-20"
          />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-600">
          {label}
        </p>
      </div>
    </div>
  );
}
