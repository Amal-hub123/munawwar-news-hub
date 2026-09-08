import { useEffect, useRef, useState } from "react";

const PHRASES = [
  "الاقتصاد ليس مجرد رقم، بل حكاية مجتمع، نرويها بسردية مختلفة.",
  "الإنسان يعيش نتيجة الرقم قبل أن يعرفه.",
  "ماذا لو بدأنا من الإنسان؟",
];

const DURATION = 6000;

/** Each phrase gets its own quiet visual scene. */
const Scene = ({ index, mx, my }: { index: number; mx: number; my: number }) => {
  const t = (depth: number) => ({
    transform: `translate3d(${mx * depth}px, ${my * depth}px, 0)`,
  });

  if (index === 0) {
    return (
      <svg viewBox="0 0 600 600" className="w-full h-full" aria-hidden="true">
        <g style={t(18)} opacity="0.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M -40 ${420 - i * 34} C 140 ${330 - i * 40}, 300 ${470 - i * 26}, 640 ${250 - i * 34}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={i === 2 ? 2.2 : 1}
              opacity={i === 2 ? 0.9 : 0.32}
            />
          ))}
        </g>
        <circle cx="430" cy="215" r="7" fill="currentColor" style={t(30)} className="ambient-pulse-slow" />
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg viewBox="0 0 600 600" className="w-full h-full" aria-hidden="true">
        <g style={t(12)} opacity="0.35">
          {Array.from({ length: 11 }).map((_, i) => (
            <rect
              key={i}
              x={60 + i * 44}
              y={430 - (i % 4) * 46 - 40}
              width="20"
              height={(i % 4) * 46 + 70}
              rx="10"
              fill="currentColor"
              opacity={i === 6 ? 0.95 : 0.25}
            />
          ))}
        </g>
        <g style={t(26)}>
          <circle cx="345" cy="245" r="26" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
          <circle cx="345" cy="245" r="9" fill="currentColor" className="ambient-pulse-slow" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 600 600" className="w-full h-full" aria-hidden="true">
      <g style={t(14)} opacity="0.4">
        {Array.from({ length: 5 }).map((_, i) => (
          <circle key={i} cx="300" cy="300" r={70 + i * 52} fill="none" stroke="currentColor" strokeWidth="1" opacity={0.5 - i * 0.07} />
        ))}
      </g>
      <g style={t(30)}>
        <path d="M 300 300 C 380 240, 430 300, 520 210" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.85" />
        <circle cx="300" cy="300" r="10" fill="currentColor" className="ambient-pulse-slow" />
      </g>
    </svg>
  );
};

export const HomeHero = () => {
  const [index, setIndex] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % PHRASES.length), DURATION);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPointer({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const startStory = () => {
    const target = document.getElementById("story-of-the-day") || document.getElementById("home-flow");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setPointer({ x: 0, y: 0 })}
      className="relative min-h-[72vh] md:min-h-[80vh] flex items-center overflow-hidden surface-alt"
    >
      {/* ambient visual scene */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-full md:w-[58%] text-brand opacity-70"
        style={{ transform: `translateY(${scrollY * -0.06}px)` }}
      >
        <div key={index} className="w-full h-full hero-phrase-enter">
          <Scene index={index} mx={pointer.x * 1.6} my={pointer.y * 1.6} />
        </div>
      </div>

      <div className="container mx-auto px-6 relative">
        <div
          className="max-w-3xl"
          style={{ transform: `translateY(${scrollY * -0.02}px)` }}
        >
          <span className="inline-block text-sm tracking-[0.3em] text-brand/70 mb-6">المُنحنى</span>

          <div className="relative min-h-[190px] sm:min-h-[210px] md:min-h-[260px]">
            {PHRASES.map((phrase, i) => (
              <h1
                key={phrase}
                aria-hidden={i !== index}
                className="absolute inset-0 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.5] text-brand transition-opacity duration-1000"
                style={{
                  opacity: i === index ? 1 : 0,
                  transform: i === index ? "translateY(0)" : "translateY(10px)",
                  transitionProperty: "opacity, transform",
                }}
              >
                {phrase}
              </h1>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={startStory}
          className="group mt-10 md:mt-14 inline-flex flex-col items-start gap-3 text-brand"
        >
          <span className="text-lg font-semibold group-hover:opacity-80 transition-opacity">ابدأ الحكاية</span>
          <span className="relative block h-14 w-[2px] bg-brand/25 overflow-hidden rounded-full">
            <span className="absolute inset-x-0 top-0 h-6 bg-brand ambient-float rounded-full" />
          </span>
        </button>

      </div>
    </section>
  );
};

export default HomeHero;
