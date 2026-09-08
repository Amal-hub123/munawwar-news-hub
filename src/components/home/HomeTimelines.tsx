import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDragScroll } from "@/hooks/useDragScroll";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft } from "lucide-react";

const InteractiveTimeline = ({ stops }: { stops: any[] }) => {
  const { ref, handlers } = useDragScroll<HTMLDivElement>();
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="relative">
      <div ref={ref} {...handlers} dir="rtl" className="drag-scroll gap-0 pt-10 pb-4">
        {stops.map((stop, i) => {
          const isActive = active === stop.id;
          const body = (
            <div
              className={`relative shrink-0 w-[72vw] sm:w-[46vw] md:w-[27vw] lg:w-[22vw] pl-6 transition-all duration-500 ${isActive ? "-translate-y-1" : ""}`}
              onMouseEnter={() => setActive(stop.id)}
              onMouseLeave={() => setActive(null)}
            >
              {/* connector */}
              <span className="absolute top-3 right-0 left-0 h-px bg-primary/40" aria-hidden="true" />
              <span
                className={`absolute top-[3px] right-0 w-[18px] h-[18px] rounded-full border-2 border-primary bg-background transition-transform duration-500 ${isActive ? "scale-125" : ""}`}
                aria-hidden="true"
              />
              <div className="pt-10 pr-1">
                {stop.label && <p className="text-sm font-semibold text-brand/70 mb-1">{stop.label}</p>}
                <p className="text-lg font-semibold text-brand leading-snug">{stop.title}</p>
                {stop.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-4">{stop.description}</p>
                )}
                {stop.image_url && (
                  <div className="mt-3 overflow-hidden rounded-xl zoom-media">
                    <img src={stop.image_url} alt={stop.title} loading="lazy" draggable={false} className="w-full object-cover max-h-40" />
                  </div>
                )}
              </div>
            </div>
          );

          return stop.article_id && stop.articles?.status === "approved" ? (
            <Link key={stop.id} to={`/articles/${stop.article_id}`} draggable={false} className="group">
              {body}
            </Link>
          ) : (
            <div key={stop.id}>{body}</div>
          );
        })}
        <span className="shrink-0 w-6" aria-hidden="true" />
      </div>
    </div>
  );
};

const ImageTimeline = ({ timeline }: { timeline: any }) => {
  const { ref, handlers } = useDragScroll<HTMLDivElement>();
  if (!timeline.image_url) return null;
  return (
    <div ref={ref} {...handlers} className="drag-scroll rounded-2xl surface-alt p-3">
      {/* No forced aspect ratio: the designed image keeps its own proportions. */}
      <img
        src={timeline.image_url}
        alt={timeline.title}
        loading="lazy"
        draggable={false}
        className="max-w-none h-auto rounded-xl"
        style={{ maxHeight: "70vh" }}
      />
    </div>
  );
};

export const HomeTimelines = () => {
  const { data: timelines } = useQuery({
    queryKey: ["home-timelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timelines")
        .select(`
          *,
          timeline_stops (
            id, label, title, description, image_url, article_id, display_order,
            articles:article_id ( id, status )
          )
        `)
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  if (!timelines || timelines.length === 0) return null;

  return (
    <section className="py-14 md:py-20 surface-alt">
      <div className="container mx-auto px-6">
        <Reveal className="mb-8">
          <h2 className="text-3xl md:text-4xl text-brand">خطوط المُنحنى</h2>
          <p className="text-muted-foreground mt-2">اسحب لتتبع الخط من بدايته.</p>
        </Reveal>
      </div>

      <div className="space-y-14">
        {timelines.map((timeline: any) => {
          const stops = (timeline.timeline_stops || []).sort(
            (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0),
          );
          const isImage = timeline.timeline_type === "image";
          if (isImage ? !timeline.image_url : stops.length === 0) return null;

          return (
            <Reveal key={timeline.id}>
              <div className="container mx-auto px-6 mb-4">
                <h3 className="text-2xl text-brand">{timeline.title}</h3>
                {timeline.description && <p className="text-muted-foreground mt-1">{timeline.description}</p>}
              </div>
              <div className="px-6 md:px-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))]">
                {isImage ? <ImageTimeline timeline={timeline} /> : <InteractiveTimeline stops={stops} />}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};

export default HomeTimelines;
