import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDragScroll } from "@/hooks/useDragScroll";
import { Reveal } from "@/components/motion/Reveal";

const InteractiveTimeline = ({ stops, color }: { stops: any[]; color: string }) => {
  const { ref, handlers } = useDragScroll<HTMLDivElement>(); const [active, setActive] = useState<string | null>(stops[0]?.id || null);
  return <div className="timeline-journey-wrap" style={{ ["--timeline-color" as any]: color }}><svg className="timeline-journey-line" viewBox="0 0 1200 180" preserveAspectRatio="none"><path pathLength="1" d="M0 125 C190 15 320 155 505 80 C710 -5 835 170 1200 36" /></svg><div ref={ref} {...handlers} dir="rtl" className="drag-scroll timeline-journey">{stops.map((stop, i) => { const body = <div className={`timeline-stop timeline-stop-${i % 4} ${active === stop.id ? "is-active" : ""}`} onMouseEnter={() => setActive(stop.id)} onClick={() => setActive(stop.id)}><span className="timeline-dot">{String(i + 1).padStart(2, "0")}</span>{stop.image_url && <div className="timeline-stop-image"><img src={stop.image_url} alt={stop.title} loading="lazy" draggable={false} /></div>}<div className="timeline-stop-copy">{stop.label && <small>{stop.label}</small>}<h4>{stop.title}</h4>{stop.description && <p>{stop.description}</p>}</div></div>; return stop.article_id && stop.articles?.status === "approved" ? <Link key={stop.id} to={`/articles/${stop.article_id}`} draggable={false}>{body}</Link> : <div key={stop.id}>{body}</div>; })}<span className="w-12 shrink-0" /></div></div>;
};
const ImageTimeline = ({ timeline }: { timeline: any }) => { const { ref, handlers } = useDragScroll<HTMLDivElement>(); if (!timeline.image_url) return null; return <div ref={ref} {...handlers} className="drag-scroll image-timeline-stage"><img src={timeline.image_url} alt={timeline.title} loading="lazy" draggable={false} /></div>; };

export const HomeTimelines = () => {
  const { data: timelines } = useQuery({ queryKey: ["home-timelines"], queryFn: async () => { const { data, error } = await supabase.from("timelines").select(`*, timeline_stops (id, label, title, description, image_url, article_id, display_order, articles:article_id (id, status))`).eq("is_active", true).order("display_order", { ascending: true }); if (error) throw error; return data || []; } });
  const [activeId, setActiveId] = useState<string | null>(null);

  const visible = (timelines || []).filter((t: any) => {
    const stops = t.timeline_stops || [];
    return t.timeline_type === "image" ? !!t.image_url : stops.length > 0;
  });

  useEffect(() => {
    if (visible.length && !visible.some((t: any) => t.id === activeId)) setActiveId(visible[0].id);
  }, [visible, activeId]);

  if (!visible.length) return null;
  const active: any = visible.find((t: any) => t.id === activeId) || visible[0];
  const stops = (active.timeline_stops || []).sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const isImage = active.timeline_type === "image";

  return (
    <section className="timelines-section">
      <div className="container mx-auto px-6">
        <Reveal variant="side" className="section-heading-row">
          <div>
            <p className="editorial-kicker">ارسم طريقك</p>
            <h2 className="editorial-heading mt-2">خطوط المُنحنى</h2>
          </div>
          <p className="section-hint">اسحب لتتبع الخط</p>
        </Reveal>

        <Reveal variant="side" className="mt-6 flex flex-wrap justify-start gap-2 md:gap-3" dir="rtl">
          {visible.map((t: any) => {
            const color = t.color || "#00343A";
            const isActive = t.id === active.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                aria-pressed={isActive}
                style={{ background: color, color: "#fff", borderColor: color, opacity: isActive ? 1 : 0.75 }}
                className={`rounded-lg border px-4 py-2 text-sm transition-all md:text-base ${isActive ? "ring-2 ring-white/40 shadow-lg" : ""}`}
              >
                {t.title}
              </button>
            );
          })}
        </Reveal>
      </div>

      <Reveal key={active.id} variant="clip" className="mt-8 md:mt-12">
        {active.description && (
          <div className="container mx-auto mb-7 px-6">
            <p className="max-w-2xl text-muted-foreground">{active.description}</p>
          </div>
        )}
        {isImage ? (
          <div className="px-6 md:px-[max(1.5rem,calc((100vw-1400px)/2+1.5rem))]">
            <ImageTimeline timeline={active} />
          </div>
        ) : (
          <InteractiveTimeline key={active.id} stops={stops} color={active.color || "#00343A"} />
        )}
      </Reveal>
    </section>
  );
};
export default HomeTimelines;
