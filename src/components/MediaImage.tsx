import { ImgHTMLAttributes, useEffect, useState } from "react";

type MediaImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  fallbackLabel?: string;
};

/** Renders a clear fallback only when a media address is unavailable. */
export default function MediaImage({
  src,
  alt,
  fallbackSrc,
  fallbackLabel = "Imagem indisponível",
  className = "",
  loading = "lazy",
  decoding = "async",
  onError,
  ...props
}: MediaImageProps) {
  const [currentSource, setCurrentSource] = useState(src || fallbackSrc || "");
  const [unavailable, setUnavailable] = useState(!src && !fallbackSrc);

  useEffect(() => {
    setCurrentSource(src || fallbackSrc || "");
    setUnavailable(!src && !fallbackSrc);
  }, [src, fallbackSrc]);

  if (unavailable || !currentSource) {
    return <div role="img" aria-label={alt} className={`flex items-center justify-center bg-slate-900 px-5 text-center text-sm font-medium text-slate-300 ${className}`}>{fallbackLabel}</div>;
  }

  return <img {...props} src={currentSource} alt={alt} className={className} loading={loading} decoding={decoding} onError={(event) => {
    onError?.(event);
    if (fallbackSrc && currentSource !== fallbackSrc) setCurrentSource(fallbackSrc);
    else setUnavailable(true);
  }} />;
}
