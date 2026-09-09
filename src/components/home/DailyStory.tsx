import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, User } from "lucide-react";

interface StoryStop { title: string; description?: string; anchor?: string; }
const pickActiveStory = (rows: any[]) => {
  const now = Date.now();
  return rows.filter((row) => (!row.starts_at || new Date(row.starts_at).getTime() <= now) && (!row.ends_at || new Date(row.ends_at).getTime() >= now))[0]
    || rows.filter((row) => !row.starts_at || new Date(row.starts_at).getTime() <= now)[0] || null;
};

export const DailyStory = () => {
  const [activeStop, setActiveStop] = useState(0);
  const { data: story } = useQuery({
    queryKey: ["daily-story"],
    queryFn: async () => {
      const { data, error } = await supabase.from("daily_stories").select(`*, articles:article_id (id, title, excerpt, cover_image_url, status, profiles:author_id (id, name, photo_url))`).eq("is_active", true).order("starts_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return pickActiveStory((data || []).filter((row: any) => row.articles?.status === "approved"));
    },
  });
  if (!story?.articles) return null;
  const article = story.articles;
  const stops: StoryStop[] = Array.isArray(story.stops) ? story.stops : [];
  return (
    <section id="story-of-the-day" className="daily-story-section">
      <div className="container mx-auto px-6">
        <Reveal variant="side" className="relative z-20 mb-8 flex items-end justify-between gap-6 md:mb-12">
          <div><p className="editorial-kicker">اليوم على المُنحنى</p><h2 className="editorial-heading mt-2">حكاية اليوم</h2></div>
          {story.badge && <span className="story-badge">{story.badge}</span>}
        </Reveal>
        <div className="daily-story-composition">

 {stops.length > 0 && (
            <Reveal delay={220} className="story-timeline">
              <svg viewBox="0 0 800 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M0 72 C180 10 330 95 480 45 C610 0 690 55 800 20" /></svg>
              <ol>
                {stops.map((stop, i) => (
                  <li key={`${stop.title}-${i}`} className={i === activeStop ? "is-active" : ""} onMouseEnter={() => setActiveStop(i)} onClick={() => setActiveStop(i)}>
                    <button type="button" aria-label={stop.title}><span>{String(i + 1).padStart(2, "0")}</span></button>
                    <div className="story-stop-copy"><p>{stop.title}</p>{stop.description && <small>{stop.description}</small>}</div>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
          
          <Reveal variant="clip" className="daily-story-media">
            <Link to={`/articles/${article.id}`} className="group zoom-media block h-full">
              <img src={article.cover_image_url} alt={article.title} loading="lazy" className="h-full w-full object-cover" />
              <span className="daily-story-shade" />
            </Link>
          </Reveal>
          <Reveal delay={130} variant="side" className="daily-story-copy">
            <span className="editorial-index">٠١</span>
            <h3>{article.title}</h3>
            <p>{article.excerpt}</p>
            <span className="inline-flex items-center gap-2 text-sm">
              {article.profiles?.photo_url ? <img src={article.profiles.photo_url} alt={article.profiles?.name} className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15"><User className="h-4 w-4" /></span>}
              {article.profiles?.name}
            </span>
            <Link to={`/articles/${article.id}`} className="editorial-link mt-7">اقرأ الحكاية <ArrowLeft className="h-4 w-4" /></Link>
          </Reveal>
         
        </div>
      </div>
    </section>
  );
};
export default DailyStory;
