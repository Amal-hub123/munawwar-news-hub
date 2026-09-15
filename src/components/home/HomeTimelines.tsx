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

  /*
   * نحافظ على نظام السحب الأصلي الموجود عندك.
   */
  const { ref, handlers } =
    useDragScroll<HTMLDivElement>();


  /*
   * النقطة النشطة.
   */
  const [active, setActive] =
    useState<string | null>(
      stops[0]?.id || null
    );


  /*
   * مقدار حركة الـTrack.
   */
  const [scrollX, setScrollX] =
    useState(0);


  /*
   * عرض الجزء الظاهر من الصفحة.
   */
  const [
    viewportWidth,
    setViewportWidth,
  ] = useState(1200);



  /* =========================================================
     إعدادات المنحنى
     ========================================================= */

  /*
   * أبعاد SVG الداخلية.
   *
   * هذه ثابتة ولا تتغير
   * مهما زاد عدد النقاط.
   */
  const VIEWBOX_WIDTH = 1200;
  const VIEWBOX_HEIGHT = 200;


  /*
   * منتصف المنحنى رأسيًا.
   */
  const BASE_Y = 90;


  /*
   * قوة الانحناء.
   *
   * 55 = الانحناء الحالي.
   *
   * إذا أردت انحناء أكبر لاحقًا:
   * 65 أو 70.
   */
  const AMPLITUDE = 55;


  /*
   * عدد الموجات داخل عرض الصفحة.
   *
   * 1 = موجة كاملة.
   */
  const WAVES = 1;


  /*
   * المسافة بين كل نقطة والثانية.
   *
   * زيادة النقاط لا تضغطها.
   * الـTrack يتمدد بدل ذلك.
   */
  const STOP_GAP = 240;


  /*
   * مساحة من بداية ونهاية Track.
   */
  const SIDE_PADDING = 50;



  /* =========================================================
     معادلة المنحنى
     ========================================================= */

  /*
   * هذه المعادلة تستخدم مرتين:
   *
   * 1. لرسم الخط.
   * 2. لتحديد Y لكل نقطة.
   *
   * لذلك الخط والنقاط
   * يستخدمون نفس المنحنى.
   */
  const getCurveY = (
    progress: number
  ) => {

    return (
      BASE_Y +
      Math.sin(
        progress *
          Math.PI *
          2 *
          WAVES
      ) *
        AMPLITUDE
    );
  };



  /* =========================================================
     إنشاء PATH الخط
     ========================================================= */

  const createCurvePath = () => {

    /*
     * كلما زادت segments
     * يصبح الخط أنعم.
     */
    const segments = 300;

    let path = "";


    for (
      let i = 0;
      i <= segments;
      i++
    ) {

      const progress =
        i / segments;


      const x =
        progress *
        VIEWBOX_WIDTH;


      const y =
        getCurveY(
          progress
        );


      if (i === 0) {

        path +=
          `M ${x} ${y}`;

      } else {

        path +=
          ` L ${x} ${y}`;

      }
    }


    return path;
  };


  const curvePath =
    createCurvePath();



  /* =========================================================
     عرض Track النقاط
     ========================================================= */

  /*
   * الخط لا يستخدم هذا العرض.
   *
   * هذا العرض للنقاط فقط.
   *
   * كلما زادت النقاط:
   * يزيد Track
   * ويمكن سحبه.
   */
  const trackWidth =
    Math.max(

      viewportWidth,

      SIDE_PADDING * 2 +

        Math.max(
          stops.length - 1,
          0
        ) *

        STOP_GAP

    );



  /* =========================================================
     مراقبة عرض الصفحة + السحب
     ========================================================= */

  useEffect(() => {

    const element =
      ref.current;


    if (!element) {
      return;
    }


    /*
     * معرفة العرض الحقيقي
     * للجزء الظاهر.
     */
    const updateViewport =
      () => {

        setViewportWidth(
          element.clientWidth ||
            1200
        );

      };


    /*
     * معرفة مقدار السحب.
     *
     * الموقع RTL لذلك scrollLeft
     * قد يكون سالبًا حسب المتصفح.
     *
     * Math.abs يعطينا مقدار
     * الحركة الفعلي.
     */
    const updateScroll =
      () => {

        setScrollX(
          Math.abs(
            element.scrollLeft
          )
        );

      };


    updateViewport();
    updateScroll();


    /*
     * إذا تغير عرض الشاشة.
     */
    const observer =
      new ResizeObserver(
        updateViewport
      );


    observer.observe(
      element
    );


    /*
     * تحديث النقاط أثناء السحب.
     */
    element.addEventListener(
      "scroll",
      updateScroll,
      {
        passive: true,
      }
    );


    return () => {

      observer.disconnect();


      element.removeEventListener(
        "scroll",
        updateScroll
      );

    };

  }, [ref]);



  /* =========================================================
     عند تغيير Timeline
     ========================================================= */

  useEffect(() => {

    setActive(
      stops[0]?.id ||
        null
    );

  }, [stops]);



  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <div
      className="timeline-fixed-shell"
      style={
        {
          "--timeline-color":
            color,
        } as React.CSSProperties
      }
    >


      {/* =====================================================
          الخط المنحني

          مهم:
          الخط خارج منطقة السحب.
          لذلك يبقى ثابتًا.
          ===================================================== */}

      <svg

        className="timeline-journey-line"

        viewBox={
          `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`
        }

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



      {/* =====================================================
          منطقة السحب

          النقاط فقط موجودة هنا.
          ===================================================== */}

      <div

        ref={ref}

        {...handlers}

        dir="rtl"

        className="
          drag-scroll
          timeline-journey-wrap
        "

      >


        {/* ===================================================
            Track المتحرك
            =================================================== */}

        <div

          className="
            timeline-journey-stage
          "

          style={{
            width:
              `${trackWidth}px`,
          }}

        >


          <div
            className="
              timeline-journey
            "
          >


            {stops.map(
              (
                stop,
                i
              ) => {


                /* ===========================================
                   X النقطة داخل Track
                   =========================================== */

                /*
                 * لأن الموقع RTL:
                 *
                 * النقطة الأولى تبدأ
                 * من جهة اليمين.
                 */
                const pointFromRight =

                  SIDE_PADDING +

                  i *
                    STOP_GAP;



                /* ===========================================
                   X الحالي بعد السحب
                   =========================================== */

                /*
                 * عند السحب:
                 *
                 * scrollX يزيد.
                 *
                 * وبالتالي النقطة تتحرك
                 * داخل الشاشة.
                 */
                const visibleFromRight =

                  pointFromRight -

                  scrollX;



                /*
                 * SVG يحسب X
                 * من اليسار.
                 *
                 * لذلك نحول:
                 *
                 * Right → Left
                 */
                const visibleX =

                  viewportWidth -

                  visibleFromRight;



                /* ===========================================
                   تحويل X إلى Progress
                   =========================================== */

                /*
                 * 0 = أول الخط.
                 * 1 = آخر الخط.
                 */
                const rawProgress =

                  viewportWidth > 0

                    ? visibleX /
                      viewportWidth

                    : 0.5;



                /*
                 * النقاط الموجودة خارج
                 * الشاشة لا نسمح لها
                 * بتغيير المعادلة
                 * خارج 0 → 1.
                 */
                const progress =

                  Math.max(

                    0,

                    Math.min(
                      1,
                      rawProgress
                    )

                  );



                /* ===========================================
                   Y النقطة من نفس الخط
                   =========================================== */

                const curveY =

                  getCurveY(
                    progress
                  );



                /*
                 * الخط ظاهر بارتفاع 10rem.
                 *
                 * 10rem ≈ 160px
                 * على الحجم الافتراضي.
                 *
                 * لذلك نحول إحداثية
                 * SVG إلى مساحة الخط.
                 */
                const dotY =

                  (
                    curveY /
                    VIEWBOX_HEIGHT
                  ) *

                  160;



                /* ===========================================
                   محتوى النقطة
                   =========================================== */

                const body = (

                  <div

                    className={
                      `timeline-stop ${
                        active ===
                        stop.id

                          ? "is-active"

                          : ""
                      }`
                    }

                    style={
                      {
                        "--dot-y":
                          `${dotY}px`,
                      } as React.CSSProperties
                    }

                    onMouseEnter={
                      () =>
                        setActive(
                          stop.id
                        )
                    }

                    onClick={
                      () =>
                        setActive(
                          stop.id
                        )
                    }

                  >


                    {/* ===============================
                        الدائرة
                        =============================== */}

                    <span
                      className="
                        timeline-dot
                      "
                    >

                      {String(
                        i + 1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </span>



                    {/* ===============================
                        الصورة
                        =============================== */}

                    {
                      stop.image_url &&
                      (

                        <div
                          className="
                            timeline-stop-image
                          "
                        >

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

                      )
                    }



                    {/* ===============================
                        النص
                        =============================== */}

                    <div
                      className="
                        timeline-stop-copy
                      "
                    >


                      {
                        stop.label &&
                        (

                          <h6>
                            {
                              stop.label
                            }
                          </h6>

                        )
                      }


                      <h4>
                        {
                          stop.title
                        }
                      </h4>


                      {
                        stop.description &&
                        (

                          <p>
                            {
                              stop.description
                            }
                          </p>

                        )
                      }


                    </div>

                  </div>

                );



                /* ===========================================
                   إذا مرتبطة بمقال
                   =========================================== */

                if (

                  stop.article_id &&

                  stop.articles
                    ?.status ===
                    "approved"

                ) {

                  return (

                    <Link

                      key={
                        stop.id
                      }

                      to={
                        `/articles/${stop.article_id}`
                      }

                      draggable={
                        false
                      }

                    >

                      {body}

                    </Link>

                  );

                }



                /* ===========================================
                   نقطة بدون مقال
                   =========================================== */

                return (

                  <div
                    key={
                      stop.id
                    }
                  >

                    {body}

                  </div>

                );

              }
            )}


          </div>

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


  if (
    !timeline.image_url
  ) {

    return null;

  }


  return (

    <div

      ref={ref}

      {...handlers}

      className="
        drag-scroll
        image-timeline-stage
      "

    >

      <img

        src={
          timeline.image_url
        }

        alt={
          timeline.title
        }

        loading="lazy"

        draggable={
          false
        }

      />

    </div>

  );
};



/* =========================================================
   HOME TIMELINES
   ========================================================= */

export const HomeTimelines =
  () => {


    /* =======================================================
       جلب Timelines
       ======================================================= */

    const {
      data: timelines,
    } = useQuery({

      queryKey: [
        "home-timelines",
      ],


      queryFn:
        async () => {


          const {
            data,
            error,
          } =

            await supabase

              .from(
                "timelines"
              )

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
                  ascending:
                    true,
                }
              );


          if (error) {

            throw error;

          }


          return (
            data || []
          );

        },

    });



    /* =======================================================
       Active Timeline
       ======================================================= */

    const [
      activeId,
      setActiveId,
    ] =

      useState<
        string | null
      >(null);



    /* =======================================================
       Timelines التي فيها محتوى
       ======================================================= */

    const visible =

      (
        timelines || []
      ).filter(
        (t: any) => {


          const stops =

            t.timeline_stops ||
            [];


          return (

            t.timeline_type ===
            "image"

              ? !!t.image_url

              : stops.length >
                0

          );

        }
      );



    /* =======================================================
       اختيار أول Timeline
       ======================================================= */

    useEffect(
      () => {


        if (

          visible.length &&

          !visible.some(
            (t: any) =>
              t.id ===
              activeId
          )

        ) {

          setActiveId(
            visible[0].id
          );

        }


      },
      [
        visible,
        activeId,
      ]
    );



    /* =======================================================
       لا يوجد محتوى
       ======================================================= */

    if (
      !visible.length
    ) {

      return null;

    }



    /* =======================================================
       Timeline الحالي
       ======================================================= */

    const active: any =

      visible.find(
        (t: any) =>
          t.id ===
          activeId
      ) ||

      visible[0];



    /* =======================================================
       ترتيب النقاط
       ======================================================= */

    const stops = [

      ...(
        active.timeline_stops ||
        []
      ),

    ].sort(

      (
        a: any,
        b: any
      ) =>

        (
          a.display_order ??
          0
        ) -

        (
          b.display_order ??
          0
        )

    );



    const isImage =

      active.timeline_type ===
      "image";



    /* =======================================================
       PAGE
       ======================================================= */

    return (

      <section
        className="
          timelines-section
        "
      >


        {/* ===================================================
            العنوان
            =================================================== */}

        <div
          className="
            container
            mx-auto
            px-6
          "
        >


          <Reveal

            variant="side"

            className="
              section-heading-row
            "

          >


            <div>


              <p
                className="
                  editorial-kicker
                "
              >

                ارسم طريقك

              </p>


              <h2
                className="
                  editorial-heading
                  mt-2
                "
              >

                خطوط المُنحنى

              </h2>


            </div>



            <p
              className="
                section-hint
              "
            >

              اسحب لتتبع الخط

            </p>


          </Reveal>



          {/* =================================================
              أزرار Timelines
              ================================================= */}

          <Reveal

            variant="side"

            className="
              mt-6
            "

          >


            <div

              className="
                flex
                flex-wrap
                justify-start
                gap-2
                md:gap-3
              "

              dir="rtl"

            >


              {
                visible.map(
                  (
                    t: any
                  ) => {


                    const color =

                      t.color ||

                      "#00343A";


                    const isActive =

                      t.id ===
                      active.id;


                    return (

                      <button

                        key={
                          t.id
                        }

                        type="button"

                        onClick={
                          () =>
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

                        className={
                          `rounded-lg border px-4 py-2 text-sm transition-all md:text-base ${
                            isActive

                              ? "ring-2 ring-white/40 shadow-lg"

                              : ""
                          }`
                        }

                      >

                        {
                          t.title
                        }

                      </button>

                    );

                  }
                )
              }


            </div>


          </Reveal>


        </div>



        {/* ===================================================
            TIMELINE
            =================================================== */}

        <Reveal

          key={
            active.id
          }

          variant="clip"

          className="
            mt-8
            md:mt-12
          "

        >


          {/* =================================================
              الوصف
              ================================================= */}

          {
            active.description &&
            (

              <div
                className="
                  container
                  mx-auto
                  mb-7
                  px-6
                "
              >

                <p
                  className="
                    max-w-2xl
                    text-muted-foreground
                  "
                >

                  {
                    active.description
                  }

                </p>

              </div>

            )
          }



          {/* =================================================
              CONTENT
              ================================================= */}

          {
            isImage

              ? (

                <div
                  className="
                    px-6
                    md:px-[max(1.5rem,calc((100vw-1400px)/2+1.5rem))]
                  "
                >

                  <ImageTimeline
                    timeline={
                      active
                    }
                  />

                </div>

              )

              : (

                <InteractiveTimeline

                  key={
                    active.id
                  }

                  stops={
                    stops
                  }

                  color={
                    active.color ||
                    "#00343A"
                  }

                />

              )
          }


        </Reveal>


      </section>

    );

  };


export default HomeTimelines;
