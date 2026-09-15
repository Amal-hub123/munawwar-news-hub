import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/motion/Reveal";

/* =========================================================
   INTERACTIVE TIMELINE
   ========================================================= */

const InteractiveTimeline = ({
  stops,
  color,
}: {
  stops: any[];
  color: string;
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [active, setActive] = useState<string | null>(
    stops[0]?.id || null
  );

  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1200);

  /* =========================================================
     DRAG STATE
     ========================================================= */

  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  /* =========================================================
     إعدادات المنحنى
     ========================================================= */

  /*
   * أبعاد الـ SVG الداخلية.
   *
   * شكل المنحنى يبقى ثابتًا دائمًا.
   */
  const VIEWBOX_WIDTH = 1200;
  const VIEWBOX_HEIGHT = 200;

  /*
   * مكان منتصف الخط.
   */
  const BASE_Y = 90;

  /*
   * قوة الانحناء.
   *
   * إذا أردت انحناء أكبر:
   * 65 أو 70
   *
   * إذا أردته أخف:
   * 45 أو 50
   */
  const AMPLITUDE = 55;

  /*
   * عدد الانحناءات الظاهرة داخل الشاشة.
   *
   * 1 = موجة كاملة
   * 1.5 = انحناءات أكثر
   * 2 = موجتان
   */
  const CURVE_WAVES = 1;

  /*
   * المسافة بين النقاط.
   *
   * هذه لا تغيّر الخط.
   * فقط تحدد المسافة الأفقية بين النقاط أثناء السحب.
   */
  const STOP_GAP = 240;

  /*
   * Padding حتى لا تكون أول وآخر نقطة مقصوصة.
   */
  const TRACK_PADDING = 120;

  /*
   * عرض المحتوى المتحرك.
   *
   * كلما زادت النقاط يزيد هذا العرض.
   * الخط نفسه لا يزيد.
   */
  const POINTS_TRACK_WIDTH = Math.max(
    viewportWidth,
    (Math.max(stops.length - 1, 0) * STOP_GAP) +
      TRACK_PADDING * 2
  );

  /* =========================================================
     معادلة المنحنى
     ========================================================= */

  const getCurveY = (progress: number) => {
    return (
      BASE_Y +
      Math.sin(
        progress *
          Math.PI *
          2 *
          CURVE_WAVES
      ) *
        AMPLITUDE
    );
  };

  /* =========================================================
     إنشاء الخط
     ========================================================= */

  const createCurvePath = () => {
    const segments = 300;

    let path = "";

    for (let i = 0; i <= segments; i++) {
      const progress = i / segments;

      const x =
        progress * VIEWBOX_WIDTH;

      const y =
        getCurveY(progress);

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }

    return path;
  };

  const curvePath = createCurvePath();

  /* =========================================================
     قياس عرض المنطقة الظاهرة
     ========================================================= */

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    const updateWidth = () => {
      setViewportWidth(
        element.clientWidth || 1200
      );
    };

    updateWidth();

    const observer =
      new ResizeObserver(updateWidth);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =========================================================
     عند تغيير Timeline
     ========================================================= */

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    element.scrollLeft = 0;
    setScrollLeft(0);

    setActive(
      stops[0]?.id || null
    );
  }, [stops]);

  /* =========================================================
     SCROLL
     ========================================================= */

  const handleScroll = () => {
    const element = scrollRef.current;

    if (!element) return;

    setScrollLeft(
      Math.abs(element.scrollLeft)
    );
  };

  /* =========================================================
     DRAG بالماوس
     ========================================================= */

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    const element = scrollRef.current;

    if (!element) return;

    dragging.current = true;

    dragStartX.current =
      e.clientX;

    dragStartScroll.current =
      element.scrollLeft;

    element.setPointerCapture(
      e.pointerId
    );
  };

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!dragging.current) {
      return;
    }

    const element = scrollRef.current;

    if (!element) return;

    const distance =
      e.clientX -
      dragStartX.current;

    element.scrollLeft =
      dragStartScroll.current -
      distance;
  };

  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    dragging.current = false;

    const element = scrollRef.current;

    if (!element) return;

    try {
      element.releasePointerCapture(
        e.pointerId
      );
    } catch {
      // لا شيء
    }
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div
      ref={scrollRef}
      dir="ltr"
      className="timeline-journey-wrap"
      onScroll={handleScroll}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={
        {
          "--timeline-color": color,
        } as React.CSSProperties
      }
    >
      {/* =====================================================
          المحتوى المتحرك
          ===================================================== */}

      <div
        className="timeline-scroll-content"
        style={{
          width: `${POINTS_TRACK_WIDTH}px`,
        }}
      >
        {/* ===================================================
            الخط الثابت
            =================================================== */}

        <div className="timeline-fixed-line-holder">
          <svg
            className="timeline-journey-line"
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={curvePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* ===================================================
            النقاط المتحركة
            =================================================== */}

        <div
          className="timeline-points-track"
          dir="rtl"
        >
          {stops.map(
            (stop, i) => {
              /*
               * موقع النقطة الحقيقي
               * داخل الـ Track المتحرك.
               */
              const pointX =
                TRACK_PADDING +
                i * STOP_GAP;

              /*
               * أين تظهر النقطة حاليًا
               * بالنسبة للشاشة بعد السحب.
               */
              const visibleX =
                pointX -
                scrollLeft;

              /*
               * تحويل X الظاهر إلى
               * progress من 0 إلى 1.
               */
              const rawProgress =
                viewportWidth > 0
                  ? visibleX /
                    viewportWidth
                  : 0;

              /*
               * نبقي القيمة داخل حدود الخط.
               */
              const progress =
                Math.max(
                  0,
                  Math.min(
                    1,
                    rawProgress
                  )
                );

              /*
               * أهم جزء:
               *
               * Y للنقطة يأتي من نفس
               * معادلة الخط بالضبط.
               *
               * لذلك أثناء السحب:
               *
               * تتحرك النقطة يمين/يسار
               * وترتفع وتنخفض مع المنحنى.
               */
              const curveY =
                getCurveY(progress);

              const stopY =
                (curveY /
                  VIEWBOX_HEIGHT) *
                100;

              const body = (
                <div
                  className={`timeline-stop ${
                    active === stop.id
                      ? "is-active"
                      : ""
                  }`}
                  style={
                    {
                      "--stop-x":
                        `${pointX}px`,

                      "--stop-y":
                        `${stopY}%`,
                    } as React.CSSProperties
                  }
                  onMouseEnter={() =>
                    setActive(stop.id)
                  }
                  onClick={() =>
                    setActive(stop.id)
                  }
                >
                  {/* ===============================
                      النقطة
                      =============================== */}

                  <span className="timeline-dot">
                    {String(i + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  {/* ===============================
                      الصورة
                      =============================== */}

                  {stop.image_url && (
                    <div className="timeline-stop-image">
                      <img
                        src={
                          stop.image_url
                        }
                        alt={
                          stop.title
                        }
                        loading="lazy"
                        draggable={
                          false
                        }
                      />
                    </div>
                  )}

                  {/* ===============================
                      النص
                      =============================== */}

                  <div className="timeline-stop-copy">
                    {stop.label && (
                      <h6>
                        {stop.label}
                      </h6>
                    )}

                    <h4>
                      {stop.title}
                    </h4>

                    {stop.description && (
                      <p>
                        {
                          stop.description
                        }
                      </p>
                    )}
                  </div>
                </div>
              );

              /* ===============================
                 المقال
                 =============================== */

              if (
                stop.article_id &&
                stop.articles
                  ?.status ===
                  "approved"
              ) {
                return (
                  <Link
                    key={stop.id}
                    to={`/articles/${stop.article_id}`}
                    draggable={false}
                  >
                    {body}
                  </Link>
                );
              }

              return (
                <div key={stop.id}>
                  {body}
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   IMAGE TIMELINE
   ========================================================= */

const ImageTimeline = ({
  timeline,
}: {
  timeline: any;
}) => {
  if (!timeline.image_url) {
    return null;
  }

  return (
    <div className="image-timeline-stage">
      <img
        src={timeline.image_url}
        alt={timeline.title}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
};

/* =========================================================
   HOME TIMELINES
   ========================================================= */

export const HomeTimelines = () => {
  const { data: timelines } =
    useQuery({
      queryKey: [
        "home-timelines",
      ],

      queryFn: async () => {
        const { data, error } =
          await supabase
            .from("timelines")
            .select(`
              *,
              timeline_stops (
                id,
                label,
                title,
                description,
                image_url,
                article_id,
                display_order,
                articles:article_id (
                  id,
                  status
                )
              )
            `)
            .eq(
              "is_active",
              true
            )
            .order(
              "display_order",
              {
                ascending: true,
              }
            );

        if (error) {
          throw error;
        }

        return data || [];
      },
    });

  const [
    activeId,
    setActiveId,
  ] = useState<
    string | null
  >(null);

  /* =========================================================
     إظهار الخطوط التي تحتوي على محتوى
     ========================================================= */

  const visible = (
    timelines || []
  ).filter((t: any) => {
    const stops =
      t.timeline_stops || [];

    return (
      t.timeline_type ===
      "image"
        ? !!t.image_url
        : stops.length > 0
    );
  });

  /* =========================================================
     اختيار أول Timeline
     ========================================================= */

  useEffect(() => {
    if (
      visible.length &&
      !visible.some(
        (t: any) =>
          t.id === activeId
      )
    ) {
      setActiveId(
        visible[0].id
      );
    }
  }, [visible, activeId]);

  if (!visible.length) {
    return null;
  }

  const active: any =
    visible.find(
      (t: any) =>
        t.id === activeId
    ) || visible[0];

  /* =========================================================
     ترتيب النقاط
     ========================================================= */

  const stops = [
    ...(active.timeline_stops ||
      []),
  ].sort(
    (a: any, b: any) =>
      (a.display_order ?? 0) -
      (b.display_order ?? 0)
  );

  const isImage =
    active.timeline_type ===
    "image";

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <section className="timelines-section">

      {/* =====================================================
          العنوان
          ===================================================== */}

      <div className="container mx-auto px-6">

        <Reveal
          variant="side"
          className="section-heading-row"
        >
          <div>
            <p className="editorial-kicker">
              ارسم طريقك
            </p>

            <h2 className="editorial-heading mt-2">
              خطوط المُنحنى
            </h2>
          </div>

          <p className="section-hint">
            اسحب لتتبع الخط
          </p>
        </Reveal>


        {/* ===================================================
            أزرار الخطوط
            =================================================== */}

        <Reveal
          variant="side"
          className="mt-6"
        >
          <div
            className="flex flex-wrap justify-start gap-2 md:gap-3"
            dir="rtl"
          >
            {visible.map(
              (t: any) => {
                const color =
                  t.color ||
                  "#00343A";

                const isActive =
                  t.id ===
                  active.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setActiveId(
                        t.id
                      )
                    }
                    aria-pressed={
                      isActive
                    }
                    style={{
                      borderRadius:
                        "1.5rem",

                      background:
                        color,

                      color:
                        "#fff",

                      borderColor:
                        color,

                      opacity:
                        isActive
                          ? 1
                          : 0.75,
                    }}
                    className={`rounded-lg border px-4 py-2 text-sm transition-all md:text-base ${
                      isActive
                        ? "ring-2 ring-white/40 shadow-lg"
                        : ""
                    }`}
                  >
                    {t.title}
                  </button>
                );
              }
            )}
          </div>
        </Reveal>

      </div>


      {/* =====================================================
          TIMELINE
          ===================================================== */}

      <Reveal
        key={active.id}
        variant="clip"
        className="mt-8 md:mt-12"
      >

        {active.description && (
          <div className="container mx-auto mb-7 px-6">
            <p className="max-w-2xl text-muted-foreground">
              {
                active.description
              }
            </p>
          </div>
        )}

        {isImage ? (

          <div className="px-6 md:px-[max(1.5rem,calc((100vw-1400px)/2+1.5rem))]">

            <ImageTimeline
              timeline={
                active
              }
            />

          </div>

        ) : (

          <InteractiveTimeline
            key={active.id}
            stops={stops}
            color={
              active.color ||
              "#00343A"
            }
          />

        )}

      </Reveal>

    </section>
  );
};

export default HomeTimelines;
