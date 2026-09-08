import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import heroImage from "@/assets/home-editorial-hero.jpg";

const PHRASES = [
  <>الاقتصاد ليس مُجرّد رقم، بل حكاية <em>مُجتمع</em>، نرويها بسرديّة مُختلفة.</>,
  <>الإنسان يعيش نتيجة <em>الرقم</em> قبل أن يعرفه.</>,
  <>ماذا لو بدأنا من <em>الإنسان؟</em></>,
];

export const HomeHero = () => {
  const [index, setIndex] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [scrollShift, setScrollShift] = useState(0);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const phraseTimer = window.setInterval(() => setIndex((value) => (value + 1) % PHRASES.length), 6500);
    let frame = 0;
    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const height = ref.current?.offsetHeight || window.innerHeight;
        setScrollShift(Math.min(window.scrollY / height, 1));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearInterval(phraseTimer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const move = (event: React.MouseEvent) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setPointer({ x: (event.clientX - box.left) / box.width - 0.5, y: (event.clientY - box.top) / box.height - 0.5 });
  };

  const start = () => document.getElementById("story-of-the-day")?.scrollIntoView({ behavior: "smooth" });
  const imageTransform = `translate3d(${pointer.x * -10}px, ${pointer.y * -7 + scrollShift * 34}px, 0) scale(${1.045 + scrollShift * 0.025})`;

  return (
    <section ref={ref} onMouseMove={move} onMouseLeave={() => setPointer({ x: 0, y: 0 })} className="editorial-hero">
      <div className="hero-photo" aria-hidden="true">
        <img src={heroImage} alt="" width={1920} height={1080} style={{ transform: imageTransform }} />
      </div>
      <div className="hero-photo-wash" aria-hidden="true" />
      <div className="hero-fine-line" aria-hidden="true" />
      <div className="container relative z-10 mx-auto flex min-h-[calc(100svh-7rem)] items-center px-6 pb-28 pt-16">
        <div className="hero-copy">
          <div className="hero-eyebrow"><span /><p>وراء الأرقام، مُجتمع</p></div>
          <div className="hero-phrases">
            {PHRASES.map((phrase, phraseIndex) => (
              <h1 key={phraseIndex} aria-hidden={phraseIndex !== index} className={`hero-title ${phraseIndex === index ? "is-active" : ""}`}>{phrase}</h1>
            ))}
          </div>
          <div className="hero-pagination" aria-label="اختيار العبارة">
            {PHRASES.map((_, dotIndex) => (
              <button key={dotIndex} type="button" aria-label={`العبارة ${dotIndex + 1}`} onClick={() => setIndex(dotIndex)} className={`hero-dot ${dotIndex === index ? "is-active" : ""}`} />
            ))}
          </div>
        </div>
      </div>
      <button type="button" onClick={start} className="hero-scroll-cue" aria-label="ابدأ الحكاية">
        <span>ابدأ الحكاية</span><span className="hero-scroll-circle"><ArrowDown className="h-4 w-4" /></span>
      </button>
      <div className="hero-bottom-curve" aria-hidden="true" />
    </section>
  );
};

export default HomeHero;