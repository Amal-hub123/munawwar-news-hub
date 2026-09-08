import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

const PHRASES = [
  "الاقتصاد ليس مجرد رقم، بل حكاية مجتمع.",
  "الإنسان يعيش نتيجة الرقم قبل أن يعرفه.",
  "ماذا لو بدأنا من الإنسان؟",
];

const Scene = ({ index, x, y }: { index: number; x: number; y: number }) => {
  const move = (depth: number) => ({ transform: `translate3d(${x * depth}px, ${y * depth}px, 0)` });
  return (
    <div className="hero-scene" aria-hidden="true">
      <div className="hero-scene-disc" style={move(9)} />
      <svg viewBox="0 0 620 720" className="absolute inset-0 h-full w-full overflow-visible">
        {index === 0 && (
          <>
            <g className="hero-lines" style={move(17)}>
              {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-30 ${570 - i * 70} C130 ${400 - i * 28} 330 ${650 - i * 62} 680 ${240 - i * 28}`} />)}
            </g>
            <g style={move(28)}><circle cx="425" cy="238" r="74" className="hero-solid" /><circle cx="425" cy="238" r="13" className="hero-gold ambient-pulse-slow" /></g>
          </>
        )}
        {index === 1 && (
          <>
            <g className="hero-bars" style={move(14)}>{Array.from({ length: 8 }).map((_, i) => <rect key={i} x={75 + i * 61} y={490 - (i % 4) * 65} width="30" height={90 + (i % 4) * 65} rx="15" />)}</g>
            <path className="hero-focus-line" style={move(24)} d="M72 530 C220 440 315 210 560 174" />
            <circle cx="344" cy="290" r="55" className="hero-ring" style={move(30)} />
          </>
        )}
        {index === 2 && (
          <>
            <g className="hero-orbits" style={move(14)}>{[90, 145, 205, 270].map((r) => <circle key={r} cx="315" cy="350" r={r} />)}</g>
            <path className="hero-focus-line" style={move(26)} d="M28 502 C220 525 250 315 365 342 C470 367 485 190 650 166" />
            <circle cx="315" cy="350" r="18" className="hero-gold ambient-pulse-slow" style={move(34)} />
          </>
        )}
      </svg>
      <span className="hero-scene-number">٠{index + 1}</span>
    </div>
  );
};

export const HomeHero = () => {
  const [index, setIndex] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setInterval(() => setIndex((value) => (value + 1) % PHRASES.length), 6500);
    return () => window.clearInterval(id);
  }, []);

  const move = (event: React.MouseEvent) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setPointer({ x: (event.clientX - box.left) / box.width - 0.5, y: (event.clientY - box.top) / box.height - 0.5 });
  };

  const start = () => document.getElementById("story-of-the-day")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section ref={ref} onMouseMove={move} onMouseLeave={() => setPointer({ x: 0, y: 0 })} className="editorial-hero">
      <div className="hero-ambient-line" aria-hidden="true" />
      <div className="container relative z-10 mx-auto grid min-h-[min(70svh,40rem)] items-center gap-8 px-6 pb-16 pt-8 lg:grid-cols-12 lg:gap-12 lg:py-10">
        <div className="relative z-20 lg:col-span-7">
          <div className="mb-7 flex items-center gap-4 text-brand/70">
            <span className="h-px w-12 bg-current" />
            <span className="text-xs font-semibold">تجربة معرفية تفاعلية</span>
          </div>
          <div className="relative min-h-[9rem] sm:min-h-[10rem] lg:min-h-[13rem]">
            {PHRASES.map((phrase, phraseIndex) => (
              <h1 key={phrase} aria-hidden={phraseIndex !== index} className={`hero-title ${phraseIndex === index ? "is-active" : ""}`}>{phrase}</h1>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3" aria-label="اختيار العبارة">
            {PHRASES.map((_, dotIndex) => (
              <button key={dotIndex} type="button" aria-label={`العبارة ${dotIndex + 1}`} onClick={() => setIndex(dotIndex)} className={`hero-dot ${dotIndex === index ? "is-active" : ""}`} />
            ))}
          </div>
        </div>
        <div key={index} className="hero-visual-enter relative z-10 h-[32vh] min-h-[240px] lg:col-span-5 lg:h-[46vh]">
          <Scene index={index} x={pointer.x} y={pointer.y} />
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