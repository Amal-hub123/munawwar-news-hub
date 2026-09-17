import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/motion/Reveal";
import { User } from "lucide-react";


/* =========================================================
   TYPES
========================================================= */

interface StoryStop {
  title: string;
  description?: string;
  anchor?: string;
}


/* =========================================================
   PICK ACTIVE STORY
========================================================= */

const pickActiveStory = (rows: any[]) => {
  const now = Date.now();

  return (
    rows.filter(
      (row) =>
        (!row.starts_at ||
          new Date(row.starts_at).getTime() <= now) &&
        (!row.ends_at ||
          new Date(row.ends_at).getTime() >= now)
    )[0] ||
    rows.filter(
      (row) =>
        !row.starts_at ||
        new Date(row.starts_at).getTime() <= now
    )[0] ||
    null
  );
};


/* =========================================================
   TIMELINE CURVE SETTINGS

   الخط والدوائر يستخدمون نفس الدالة.
========================================================= */

const TIMELINE_WIDTH = 1000;
const TIMELINE_HEIGHT = 180;

const TIMELINE_CENTER_Y = 72;
const TIMELINE_AMPLITUDE = 30;

const TIMELINE_SEGMENTS = 180;


/*
 * موقع Y على المنحنى.
 */
const getTimelineY = (progress: number) => {
  return (
    TIMELINE_CENTER_Y -
    Math.sin(progress * Math.PI * 2) *
      TIMELINE_AMPLITUDE
  );
};


/*
 * إنشاء الخط من نفس المعادلة
 * المستخدمة لوضع الدوائر.
 */
const createTimelinePath = () => {
  let path = "";

  for (
    let i = 0;
    i <= TIMELINE_SEGMENTS;
    i++
  ) {
    const progress =
      i / TIMELINE_SEGMENTS;

    const x =
      progress * TIMELINE_WIDTH;

    const y =
      getTimelineY(progress);

    if (i === 0) {
      path = `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }

  return path;
};


/* =========================================================
   COMPONENT
========================================================= */

export const DailyStory = () => {

  const [activeStop, setActiveStop] =
    useState(0);


  /* =======================================================
     LOAD STORY
  ======================================================= */

  const { data: story } = useQuery({
    queryKey: ["daily-story"],

    queryFn: async () => {

      const { data, error } =
        await supabase
          .from("daily_stories")
          .select(`
            *,
            articles:article_id (
              id,
              title,
              excerpt,
              cover_image_url,
              status,
              profiles:author_id (
                id,
                name,
                photo_url
              )
            )
          `)
          .eq("is_active", true)
          .order(
            "starts_at",
            {
              ascending: false,
              nullsFirst: false,
            }
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );


      if (error) {
        throw error;
      }


      return pickActiveStory(
        (data || []).filter(
          (row: any) =>
            row.articles?.status ===
            "approved"
        )
      );
    },
  });


  /* =======================================================
     EMPTY
  ======================================================= */

  if (!story?.articles) {
    return null;
  }


  /* =======================================================
     DATA
  ======================================================= */

  const article = story.articles;

  const stops: StoryStop[] =
    Array.isArray(story.stops)
      ? story.stops
      : [];


  /* =======================================================
     JSX
  ======================================================= */

  return (

    <section
      id="story-of-the-day"
      className="daily-story-section pb-5"
    >

      <div className="container mx-auto px-6">


        {/* =================================================
            HEADER
        ================================================= */}

        <Reveal
          variant="side"
          className="
            relative
            z-20
            mb-8
            -translate-y-4
            flex
            items-end
            justify-between
            gap-6
            md:mb-12
          "
        >

          <div>

            <h4 className="editorial-kicker">
              على المُنحنى
            </h4>

            <h2 className="editorial-heading mt-2">
              مقال اليوم
            </h2>

          </div>


          {story.badge && (

            <span className="story-badge">
              {story.badge}
            </span>

          )}

        </Reveal>


        {/* =================================================
            CURVED TIMELINE
        ================================================= */}

        {stops.length > 0 && (

          <Reveal
            delay={220}
            className="story-timeline mb-10"
            style={
              {
                "--stop-count":
                  stops.length,
              } as React.CSSProperties
            }
          >

            <div className="story-timeline-scroll">

              <div className="story-timeline-track">


                {/* =========================================
                    CURVED LINE
                ========================================= */}

                <svg
                  className="story-timeline-curve"
                  viewBox={`0 0 ${TIMELINE_WIDTH} ${TIMELINE_HEIGHT}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >

                  <path
                    pathLength="1"
                    d={createTimelinePath()}
                  />

                </svg>


                {/* =========================================
                    TIMELINE STOPS
                ========================================= */}

                <ol>

                  {stops.map(
                    (stop, i) => {

                      /*
                       * نترك مساحة بسيطة من
                       * بداية ونهاية الخط حتى
                       * الدائرة ما تنقص.
                       */

                      const start = 0.07;
                      const end = 0.93;


                      /*
                       * توزيع النقاط بالتساوي.
                       */

                      const progress =
                        stops.length === 1
                          ? 0.5
                          : start +
                            (i /
                              (stops.length -
                                1)) *
                              (end -
                                start);


                      /*
                       * X
                       */

                      const x =
                        progress *
                        TIMELINE_WIDTH;


                      /*
                       * Y
                       *
                       * مهم:
                       * نفس الدالة المستخدمة
                       * لرسم الخط.
                       */

                      const y =
                        getTimelineY(
                          progress
                        );


                      /*
                       * تحويل X/Y إلى %
                       * حتى تبقى Responsive.
                       */

                      const xPercent =
                        (x /
                          TIMELINE_WIDTH) *
                        100;

                      const yPercent =
                        (y /
                          TIMELINE_HEIGHT) *
                        100;


                      return (

                        <li
                          key={`${stop.title}-${i}`}

                          className={
                            i === activeStop
                              ? "is-active"
                              : ""
                          }

                          style={
                            {
                              "--stop-x":
                                `${xPercent}%`,

                              "--stop-y":
                                `${yPercent}%`,
                            } as React.CSSProperties
                          }

                          onMouseEnter={() =>
                            setActiveStop(i)
                          }

                          onClick={() =>
                            setActiveStop(i)
                          }
                        >


                          {/* =============================
                              CIRCLE
                          ============================= */}

                          <button
                            type="button"
                            aria-label={
                              stop.title
                            }
                          >

                            <span>
                              {String(
                                i + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                          </button>


                          {/* =============================
                              TEXT
                          ============================= */}

                          <div className="story-stop-copy">

                            <p>
                              {stop.title}
                            </p>


                            {stop.description && (

                              <small>
                                {
                                  stop.description
                                }
                              </small>

                            )}

                          </div>

                        </li>

                      );
                    }
                  )}

                </ol>

              </div>

            </div>

          </Reveal>

        )}


        {/* =================================================
            ARTICLE
        ================================================= */}

        <div className="daily-story-composition">


          {/* ===============================================
              ARTICLE COPY
          =============================================== */}

          <Reveal
            delay={130}
            variant="side"
            className="daily-story-copy"
          >

            <span className="editorial-index">
              ٠١
            </span>


            <h3>
              {article.title}
            </h3>


            <p>
              {article.excerpt}
            </p>


            <span className="inline-flex items-center gap-2 text-sm">

              {article.profiles?.photo_url ? (

                <img
                  src={
                    article.profiles
                      .photo_url
                  }
                  alt={
                    article.profiles
                      ?.name
                  }
                  className="
                    h-8
                    w-8
                    rounded-full
                    object-cover
                  "
                />

              ) : (

                <span
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-primary/15
                  "
                >

                  <User className="h-4 w-4" />

                </span>

              )}


              {article.profiles?.name}

            </span>


            <button type="button">

              <Link
                to={`/articles/${article.id}`}
                className="editorial-link mt-7"
              >
                اقرأ المقال
              </Link>

            </button>

          </Reveal>


          {/* ===============================================
              ARTICLE IMAGE
          =============================================== */}

          <Reveal
            variant="clip"
            className="p-5 daily-story-media"
          >

            <Link
              to={`/articles/${article.id}`}
              className="group zoom-media block h-full"
            >

              <img
                src={
                  article.cover_image_url
                }
                alt={article.title}
                loading="lazy"
                className="
                  h-full
                  w-full
                  object-cover
                "
              />

              <span className="daily-story-shade" />

            </Link>

          </Reveal>

        </div>

      </div>

    </section>

  );
};


export default DailyStory;
