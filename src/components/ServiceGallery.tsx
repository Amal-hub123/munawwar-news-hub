import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { ShareButton } from "@/components/ShareDialog";

interface Props {
  images: string[];
  title?: string | null;
  subtitle?: string;
  pdfUrl?: string | null;
  shareUrl: string;
  displayUrl: string;
}

export const ServiceGallery = ({ images, title, subtitle, pdfUrl, shareUrl, displayUrl }: Props) => {
  const [index, setIndex] = useState(0);
  const total = images.length;
  const go = useCallback((d: number) => setIndex((i) => (i + d + total) % total), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(1);
      if (e.key === "ArrowRight") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const [touchX, setTouchX] = useState<number | null>(null);

  if (!total) return null;

  return (
    <section className="service-gallery" dir="rtl">
      <div className="service-gallery-head">
        <div>
          {title && <h2 className="service-gallery-title">{title}</h2>}
          <p className="service-gallery-sub">{subtitle ? `${subtitle} · ` : ""}{total} صفحات</p>
        </div>
        <div className="service-gallery-actions">
          <span className="service-gallery-btn"><ShareButton url={shareUrl} displayUrl={displayUrl} title={title || ""} iconSize={16} /> </span>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer" download className="service-gallery-btn">
              <Download className="h-5 w-5" /> 
            </a>
          )}
        </div>
      </div>

      <div
        className="service-gallery-stage"
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return;
          const dx = e.changedTouches[0].clientX - touchX;
          if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1);
          setTouchX(null);
        }}
      >
        {total > 1 && (
          <button type="button" aria-label="السابق" className="service-gallery-arrow is-right" onClick={() => go(-1)}>
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        <div className="service-gallery-frame">
          <img key={images[index]} src={images[index]} alt={`صفحة ${index + 1}`} className="service-gallery-img" />
        </div>
        {total > 1 && (
          <button type="button" aria-label="التالي" className="service-gallery-arrow is-left" onClick={() => go(1)}>
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="service-gallery-counter">الصفحة {index + 1} من {total}</div>
      {total > 1 && (
        <div className="service-gallery-dots">
          {images.map((_, i) => (
            <button key={i} type="button" aria-label={`صفحة ${i + 1}`} className={i === index ? "is-active" : ""} onClick={() => setIndex(i)} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ServiceGallery;
