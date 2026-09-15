import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDragScroll } from "@/hooks/useDragScroll";
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
  const { ref, handlers } = useDragScroll<HTMLDivElement>();

  const [active, setActive] = useState<string | null>(
    stops[0]?.id || null
  );

  /* =========================================================
     إعدادات المنحنى
     ========================================================= */

  const VIEWBOX_HEIGHT = 180;
  const BASE_Y = 90;
  const AMPLITUDE = 22;

  /*
   * المسافة الأساسية لكل نقطة.
   * عند زيادة عدد النقاط، يزيد عرض الخط معها.
   */
  const STOP_WIDTH = 180;

  /*
   * الحد الأدنى للعرض يبقى 1200px
   * وإذا زادت النقاط يزيد عرض الـ timeline تلقائيًا.
   */
  const TIMELINE_WIDTH = Math.max(
    1250,
    stops.length * STOP_WIDTH
  );

  /*
   * نفس المعادلة المستخدمة للخط وللنقاط
   * حتى تبقى الدوائر على الخط تمامًا.
   */
  const getCurveY = (progress: number) => {
    return (
      BASE_Y +
      Math.sin(progress * Math.PI * 2) * AMPLITUDE
    );
  };

  /*
   * إنشاء مسار SVG للخط المنحني.
   *
   * المسار الآن يستخدم TIMELINE_WIDTH
   * بدل عرض ثابت 1200px.
   */
  const createCurvePath = () => {
    const segments = 200;

    let path = "";

    for (let i = 0; i <= segments; i++) {
      const progress = i / segments;

      const x = progress * TIMELINE_WIDTH;
      const y = getCurveY(progress);

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }

    return path;
  };

  const curvePath = createCurvePath();

  return (
    <div
      ref={ref}
      {...handlers}
      dir="rtl"
      className="drag-scroll timeline-journey-wrap"
      style={
        {
          "--timeline-color": color,
        } as React.CSSProperties
      }
    >
      <div
        className="timeline-journey-stage"
        style={
          {
            "--timeline-stop-count": Math.max(
              stops.length,
              1
            ),

            /*
             * الـ stage والـ SVG والـ path
             * أصبحوا جميعًا بنفس العرض.
             */
            width: `${TIMELINE_WIDTH}px`,
          } as React.CSSProperties
        }
      >
        {/* =================================================
            الخط المنحني
            ================================================= */}

        <svg
          className="timeline-journey-line"
          viewBox={`0 0 ${TIMELINE_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            pathLength="1"
            d={curvePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* =================================================
            نقاط الخط الزمني
            ================================================= */}

        <div className="timeline-journey">
          {stops.map((stop, i) => {
            /*
             * توزيع النقاط من بداية الخط إلى نهايته.
             */
            const progress =
              stops.length > 1
                ? i / (stops.length - 1)
                : 0.5;

            /*
             * حساب Y للنقطة من نفس معادلة الخط.
             */
            const curveY = getCurveY(progress);

            /*
             * تحويل Y من SVG إلى نسبة مئوية.
             */
            const stopY =
              (curveY / VIEWBOX_HEIGHT) * 100;

            const body = (
              <div
                style={
                  {
                    "--stop-progress": progress,
                    "--stop-y": `${stopY}%`,
                  } as React.CSSProperties
                }
                className={`timeline-stop ${
                  active === stop.id
                    ? "is-active"
                    : ""
                }`}
                onMouseEnter={() =>
                  setActive(stop.id)
                }
                onClick={() =>
                  setActive(stop.id)
                }
              >
                {/* رقم النقطة */}

                <span className="timeline-dot">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* الصورة */}

                {stop.image_url && (
                  <div className="timeline-stop-image">
                    <img
                      src={stop.image_url}
                      alt={stop.title}
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                )}

                {/* النص */}

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
                      {stop.description}
                    </p>
                  )}
                </div>
              </div>
            );

            /*
             * إذا النقطة مرتبطة بمقال معتمد.
             */
            if (
              stop.article_id &&
              stop.articles?.status === "approved"
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
          })}
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
  const { ref, handlers } =
    useDragScroll<HTMLDivElement>();

  if (!timeline.image_url) {
    return null;
  }

  return (
    <div
      ref={ref}
      {...handlers}
      className="drag-scroll image-timeline-stage"
    >
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
      queryKey: ["home-timelines"],

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
            .eq("is_active", true)
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

  const [activeId, setActiveId] =
    useState<string | null>(null);

  /*
   * إظهار الخطوط التي تحتوي
   * على محتوى فقط.
   */
  const visible = (
    timelines || []
  ).filter((t: any) => {
    const stops =
      t.timeline_stops || [];

    return t.timeline_type ===
      "image"
      ? !!t.image_url
      : stops.length > 0;
  });

  /*
   * اختيار أول Timeline تلقائيًا.
   */
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

  /*
   * ترتيب النقاط.
   */
  const stops = [
    ...(active.timeline_stops || []),
  ].sort(
    (a: any, b: any) =>
      (a.display_order ?? 0) -
      (b.display_order ?? 0)
  );

  const isImage =
    active.timeline_type ===
    "image";

  return (
    <section className="timelines-section">

      {/* =================================================
          العنوان
          ================================================= */}

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

        {/* =================================================
            أزرار الخطوط
            ================================================= */}

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

      {/* =================================================
          TIMELINE
          ================================================= */}

      <Reveal
        key={active.id}
        variant="clip"
        className="mt-8 md:mt-12"
      >

        {active.description && (
          <div className="container mx-auto mb-7 px-6">

            <p className="max-w-2xl text-muted-foreground">
              {active.description}
            </p>

          </div>
        )}

        {isImage ? (

          <div className="px-6 md:px-[max(1.5rem,calc((100vw-1400px)/2+1.5rem))]">

            <ImageTimeline
              timeline={active}
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
