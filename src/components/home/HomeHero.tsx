import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Phrase { lead: string; mark: string; mid: string; mark2?: string; tail: string; }

const PHRASES: Phrase[] = [
  { lead: "", mark: "الاقتصاد", mid: " ليس مُجرّد رقم، بل حكاية ", mark2: "مُجتمع", tail: "، نرويها بسرديّة مُختلفة." },
  { lead: "", mark: "الإنسان", mid: " يعيش نتيجة ", mark2: "الرقم", tail: " قبل أن يعرفه." },
  { lead: "ماذا لو بدأنا من ", mark: "الإنسان", mid: "", tail: "؟" },
];

export const HomeHero = () => {
  const [index, setIndex] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setInterval(() => setIndex((value) => (value + 1) % PHRASES.length), 12000);
    return () => window.clearInterval(id);
  }, []);

  const move = (event: React.MouseEvent) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setPointer({ x: (event.clientX - box.left) / box.width - 0.5, y: (event.clientY - box.top) / box.height - 0.5 });
  };

  const start = () => document.getElementById("story-of-the-day")?.scrollIntoView({ behavior: "smooth" });
  const shift = (depth: number) => ({ transform: `translate3d(${pointer.x * depth}px, ${pointer.y * depth}px, 0)` });

  return (
    <section ref={ref} onMouseMove={move} onMouseLeave={() => setPointer({ x: 0, y: 0 })} className="calm-hero">
      <div className="calm-hero-orbs" aria-hidden="true">
        <span className="orb orb-gold" style={shift(10)} />
        <span className="orb orb-teal" style={shift(16)} />
      </div>
      <div className="calm-hero-dots" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ top: `${(i * 37) % 70 + 6}%`, insetInlineStart: `${(i * 61) % 92 + 3}%`, animationDelay: `${i * 0.4}s` }} />)}
      </div>

      <div className="calm-hero-stage">
        {PHRASES.map((phrase, i) => (
          <h1 key={i} aria-hidden={i !== index} className={`calm-hero-phrase ${i === index ? "is-active" : ""}`}>
            {phrase.lead}
            <em className="mark">{phrase.mark}</em>
            {phrase.mid}
            {phrase.mark2 && <em className="mark">{phrase.mark2}</em>}
            {phrase.tail}
          </h1>
        ))}
      </div>

      <div className="calm-hero-dotsnav" aria-label="اختيار العبارة">
        {PHRASES.map((_, i) => (
          <button key={i} type="button" aria-label={`العبارة ${i + 1}`} onClick={() => setIndex(i)} className={`hero-dot ${i === index ? "is-active" : ""}`} />
        ))}
      </div>

      <svg className="calm-hero-wave" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
        <path className="wave-back" d="M0 190 C260 120 470 250 760 190 C1030 135 1230 205 1440 150 L1440 320 L0 320 Z" />
        <path className="wave-mid" d="M0 220 C280 155 500 275 780 215 C1050 160 1250 232 1440 182 L1440 320 L0 320 Z" />
        <path className="wave-front" d="M0 252 C300 195 520 300 800 245 C1070 195 1260 262 1440 218 L1440 320 L0 320 Z" />
      </svg>

      {/* <button type="button" onClick={start} className="calm-hero-cue" aria-label="انزل لتقرأ الحكاية">
        <span>انزل لتقرأ الحكاية</span>
        <ChevronDown className="h-5 w-5" />
      </button> */}
    </section>
  );
};

export default HomeHero;
