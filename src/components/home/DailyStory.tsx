import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, User } from "lucide-react";

export interface StoryStop {
  title: string;
  description?: string;
  anchor?: string;
}

const pickActiveStory = (rows: any[]) => {
  if (!rows.length) return null;
  const now = Date.now();
  const inWindow = rows.filter((r) => {
    const startsOk = !r.starts_at || new Date(r.starts_at).getTime() <= now;
    const endsOk = !r.ends_at || new Date(r.ends_at).getTime() >= now;
    return startsOk && endsOk;
  });
  if (inWindow.length) return inWindow[0];
  // Nothing scheduled right now: keep the most recent story visible.
  const past = rows.filter((r) => !r.starts_at || new Date(r.starts_at).getTime() <= now);
  return past[0] || null;
};

export const DailyStory = () => {
  const { data: story } = useQuery({
    queryKey: ["daily-story"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_stories")
        .select(`
          *,
          articles:article_id (
            id, title, excerpt, cover_image_url, status,
            profiles:author_id ( id, name, photo_url )
          )
        `)
        .eq("is_active", true)
        .order("starts_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      const usable = (data || []).filter((r: any) => r.articles && r.articles.status === "approved");
      return pickActiveStory(usable);
    },
  });

  if (!story || !story.articles) return null;

  const article = story.articles;
  const stops: StoryStop[] = Array.isArray(story.stops) ? (story.stops as StoryStop[]) : [];

  return (
    <section id="story-of-the-day" className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <Reveal className="flex items-end justify-between gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl text-brand">حكاية اليوم</h2>
          {story.badge && (
            <span className="text-xs md:text-sm px-4 py-2 rounded-full border border-primary text-brand ambient-pulse-slow">
              {story.badge}
            </span>
          )}
        </Reveal>

        <Reveal className="grid lg:grid-cols-[1.15fr_1fr] gap-8 items-stretch">
          <Link
            to={`/articles/${article.id}`}
            className="group zoom-media block relative overflow-hidden rounded-[26px] min-h-[320px] md:min-h-[440px]"
          >
            <img
              src={article.cover_image_url}
              alt={article.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 text-white">
              <h3 className="text-2xl md:text-3xl leading-snug mb-3">{article.title}</h3>
              <p className="text-sm md:text-base opacity-85 line-clamp-2 mb-4">{article.excerpt}</p>
              <span className="inline-flex items-center gap-2 text-sm">
                {article.profiles?.photo_url ? (
                  <img src={article.profiles.photo_url} alt={article.profiles?.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><User className="w-4 h-4" /></span>
                )}
                {article.profiles?.name}
              </span>
            </div>
          </Link>

          {stops.length > 0 && (
            <div className="surface-alt rounded-[26px] p-6 md:p-8">
              <p className="text-sm text-muted-foreground mb-6">محطات الحكاية</p>
              <ol className="relative pr-6">
                <span className="absolute right-[7px] top-2 bottom-2 w-px bg-primary/40" aria-hidden="true" />
                {stops.map((stop, i) => (
                  <li key={i} className="relative mb-6 last:mb-0 group">
                    <span className="absolute -right-[23px] top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-background transition-transform duration-300 group-hover:scale-125" />
                    {stop.anchor ? (
                      <Link to={`/articles/${article.id}#${stop.anchor}`} className="block">
                        <p className="font-semibold text-brand">{stop.title}</p>
                        {stop.description && <p className="text-sm text-muted-foreground mt-1">{stop.description}</p>}
                      </Link>
                    ) : (
                      <>
                        <p className="font-semibold text-brand">{stop.title}</p>
                        {stop.description && <p className="text-sm text-muted-foreground mt-1">{stop.description}</p>}
                      </>
                    )}
                  </li>
                ))}
              </ol>
              <Link
                to={`/articles/${article.id}`}
                className="inline-flex items-center gap-2 mt-6 text-brand font-semibold hover:gap-3 transition-all"
              >
                اقرأ الحكاية كاملة <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
};

export default DailyStory;
