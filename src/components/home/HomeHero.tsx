import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroArticleSlider from "./HeroArticleSlider";

interface Phrase {
  lead: string;
  mark: string;
  mid: string;
  mark2?: string;
  tail: string;
}

const PHRASES: Phrase[] = [
  {
    lead: "",
    mark: "الاقتصاد",
    mid: " ليس مُجرّد رقم، بل حكاية ",
    mark2: "مُجتمع",
    tail: "، نرويها بسرديّة مُختلفة",
  },
  {
    lead: "",
    mark: "الإنسان",
    mid: " يعيش نتيجة ",
    mark2: "الرقـــــــم",
    tail: " قبل أن يعرفه",
  },
  {
    lead: "ماذا لو بدأنا من ",
    mark: "الإنسان",
    mid: "",
    tail: "؟",
  },
];

export const HomeHero = () => {
  const [index, setIndex] = useState(0);

  const [pointer, setPointer] = useState({
    x: 0,
    y: 0,
  });

  const [isLeaving, setIsLeaving] = useState(false);

  const ref = useRef<HTMLElement | null>(null);

  /* =====================================================
     تبديل جمل الهيرو
  ===================================================== */

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (media.matches) return;

    const id = window.setInterval(() => {
      setIndex(
        (value) => (value + 1) % PHRASES.length
      );
    }, 12000);

    return () => {
      window.clearInterval(id);
    };
  }, []);


  /* =====================================================
     ابدأ الحكاية
     ينزل مباشرة إلى السكشن التالي
  ===================================================== */

  const start = useCallback(() => {
    const story = document.getElementById(
      "story-of-the-day"
    );

    if (!story) return;

    story.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);


  /* =====================================================
     Scroll / Wheel
  ===================================================== */

  useEffect(() => {
    const hero = ref.current;

    if (!hero) return;

    /* -----------------------------
       Wheel من الهيرو
    ----------------------------- */

    const onWheel = (event: WheelEvent) => {
      if (
        event.deltaY <= 10 ||
        window.scrollY > 16
      ) {
        return;
      }

      event.preventDefault();

      start();
    };


    /* -----------------------------
       Scroll animation
    ----------------------------- */

    let frame = 0;

    const onScroll = () => {
      window.cancelAnimationFrame(frame);

      frame = window.requestAnimationFrame(() => {
        const progress = Math.min(
          1,
          Math.max(
            0,
            window.scrollY /
              Math.max(
                hero.offsetHeight * 0.72,
                1
              )
          )
        );

        /* حركة واختفاء الهيرو */

        hero.style.setProperty(
          "--hero-scroll",
          String(progress)
        );

        hero.style.setProperty(
          "--hero-opacity",
          String(1 - progress)
        );


        /* دخول Story of the Day */

        const story =
          document.getElementById(
            "story-of-the-day"
          );

        story?.style.setProperty(
          "--story-enter",
          String(progress)
        );

        story?.style.setProperty(
          "--story-opacity",
          String(
            0.18 + progress * 0.82
          )
        );


        /* حالة خروج الهيرو */

        if (window.scrollY > 24) {
          setIsLeaving(true);
        } else if (window.scrollY <= 2) {
          setIsLeaving(false);
        }
      });
    };


    /* أول حساب */

    onScroll();


    /* Listeners */

    hero.addEventListener(
      "wheel",
      onWheel,
      { passive: false }
    );

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );


    /* Cleanup */

    return () => {
      hero.removeEventListener(
        "wheel",
        onWheel
      );

      window.removeEventListener(
        "scroll",
        onScroll
      );

      window.cancelAnimationFrame(frame);
    };
  }, [start]);


  /* =====================================================
     حركة الماوس
  ===================================================== */

  const move = (
    event: React.MouseEvent
  ) => {
    const box =
      ref.current?.getBoundingClientRect();

    if (!box) return;

    setPointer({
      x:
        (event.clientX - box.left) /
          box.width -
        0.5,

      y:
        (event.clientY - box.top) /
          box.height -
        0.5,
    });
  };


  /* =====================================================
     Parallax
  ===================================================== */

  const shift = (depth: number) => ({
    transform: `translate3d(
      ${pointer.x * depth}px,
      ${pointer.y * depth}px,
      0
    )`,
  });


  /* =====================================================
     JSX
  ===================================================== */

  return (
    <section
      ref={ref}
      onMouseMove={move}
      onMouseLeave={() =>
        setPointer({
          x: 0,
          y: 0,
        })
      }
      className={`calm-hero ${
        isLeaving ? "is-leaving" : ""
      }`}
    >

      {/* ================================================
          Decorative Orbs
      ================================================= */}

      <div
        className="calm-hero-orbs"
        aria-hidden="true"
      >
        <span
          className="orb orb-gold"
          style={shift(10)}
        />

        <span
          className="orb orb-teal"
          style={shift(16)}
        />
      </div>


      {/* ================================================
          Decorative Dots
      ================================================= */}

      <div
        className="calm-hero-dots hide"
        aria-hidden="true"
        style={{ display: "none" }}
      >
        {Array.from({
          length: 14,
        }).map((_, i) => (
          <i
            key={i}
            style={{
              top: `${
                (i * 37) % 70 + 6
              }%`,

              insetInlineStart: `${
                (i * 61) % 92 + 3
              }%`,

              animationDelay: `${
                i * 0.4
              }s`,
            }}
          />
        ))}
      </div>


      {/* ================================================
          Hero Content
      ================================================= */}

      <div className="calm-hero-content">

        {/* ==========================
            النص
        =========================== */}

        <div className="calm-hero-stage">

          {PHRASES.map(
            (phrase, i) => (
              <h1
                key={i}
                aria-hidden={
                  i !== index
                }
                className={`calm-hero-phrase phrase-${
                  i + 1
                } ${
                  i === index
                    ? "is-active"
                    : ""
                }`}
              >
                {phrase.lead}

                <em className="mark">
                  {phrase.mark}
                </em>

                {phrase.mid}

                {phrase.mark2 && (
                  <em className="mark">
                    {phrase.mark2}
                  </em>
                )}

                {phrase.tail}
              </h1>
            )
          )}

        </div>


        {/* ==========================
            صور المقالات
        =========================== */}

        <HeroArticleSlider />

      </div>


      {/* ================================================
          Waves
      ================================================= */}

      <svg
        className="calm-hero-wave"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        aria-hidden="true"
      >

        <path
          className="wave-air"
          d="M-120 174 C130 50 390 210 650 122 C930 28 1175 177 1560 70 L1560 420 L-120 420 Z"
        />

        <path
          className="wave-back"
          d="M-120 225 C170 98 390 275 700 170 C970 78 1240 220 1560 122 L1560 420 L-120 420 Z"
        />

        <path
          className="wave-mid"
          d="M-120 292 C180 156 480 330 760 231 C1035 135 1260 280 1560 185 L1560 420 L-120 420 Z"
        />

        <path
          className="wave-front"
          d="M-120 345 C190 235 500 372 820 290 C1100 217 1320 330 1560 255 L1560 420 L-120 420 Z"
        />

      </svg>


      {/* ================================================
          Start Story Button
      ================================================= */}

      <Button
        type="button"
        variant="ghost"
        onClick={start}
        className="calm-hero-cue"
        aria-label="ابدأ الحكاية"
      >
        <span>
          ابدأ الحكاية
        </span>

        <ChevronDown className="h-5 w-5" />
      </Button>

    </section>
  );
};

export default HomeHero;
