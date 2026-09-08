import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDragScroll } from "@/hooks/useDragScroll";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, User } from "lucide-react";

interface WriterCard {
  id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  articles: number;
  topics: string[];
}

export const WritersTrail = () => {
  const { ref, handlers } = useDragScroll<HTMLDivElement>();

  const { data: writers } = useQuery({
    queryKey: ["writers-trail"],
    queryFn: async (): Promise<WriterCard[]> => {
      const [{ data: profiles, error: pErr }, { data: articles, error: aErr }, { data: links, error: lErr }] =
        await Promise.all([
          supabase.from("profiles").select("id, name, photo_url, bio").eq("status", "approved"),
          supabase.from("articles").select("id, author_id").eq("status", "approved"),
          supabase
            .from("article_categories")
            .select("article_id, categories:category_id ( name )"),
        ]);
      if (pErr) throw pErr;
      if (aErr) throw aErr;
      if (lErr) throw lErr;

      const articlesByAuthor = new Map<string, string[]>();
      (articles || []).forEach((a: any) => {
        const list = articlesByAuthor.get(a.author_id) || [];
        list.push(a.id);
        articlesByAuthor.set(a.author_id, list);
      });

      const topicsByArticle = new Map<string, string[]>();
      (links || []).forEach((l: any) => {
        if (!l.categories?.name) return;
        const list = topicsByArticle.get(l.article_id) || [];
        list.push(l.categories.name);
        topicsByArticle.set(l.article_id, list);
      });

      return (profiles || [])
        .map((p: any) => {
          const ids = articlesByAuthor.get(p.id) || [];
          const topics = Array.from(new Set(ids.flatMap((id) => topicsByArticle.get(id) || []))).slice(0, 3);
          return { id: p.id, name: p.name, photo_url: p.photo_url, bio: p.bio, articles: ids.length, topics };
        })
        .filter((w) => w.articles > 0)
        .sort((a, b) => b.articles - a.articles);
    },
  });

  if (!writers || writers.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-6">
        <Reveal className="flex items-baseline justify-between gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl text-brand">كُتّاب المُنحنى</h2>
          <Link to="/writers" className="inline-flex items-center gap-2 text-sm text-brand font-semibold hover:gap-3 transition-all">
            كل الكُتّاب <ArrowLeft className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>

      <div
        ref={ref}
        {...handlers}
        dir="rtl"
        className="drag-scroll gap-5 px-6 md:px-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))] pb-2"
      >
        {writers.map((writer) => (
          <Link
            key={writer.id}
            to={`/writers/${writer.id}`}
            draggable={false}
            className="group shrink-0 w-[75vw] sm:w-[45vw] md:w-[30vw] lg:w-[23vw] rounded-2xl surface-alt border border-border/60 p-6 transition-all duration-500 hover:border-primary hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              {writer.photo_url ? (
                <img src={writer.photo_url} alt={writer.name} draggable={false} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <span className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
                  <User className="w-7 h-7 text-brand" />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-lg font-semibold text-brand truncate">{writer.name}</p>
                <p className="text-xs text-muted-foreground">{writer.articles} مقال</p>
              </div>
            </div>

            {writer.bio && <p className="text-sm text-muted-foreground mt-4 line-clamp-3 leading-relaxed">{writer.bio}</p>}

            {writer.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {writer.topics.map((t) => (
                  <span key={t} className="text-[11px] px-3 py-1 rounded-full bg-primary/15 text-brand">{t}</span>
                ))}
              </div>
            )}
          </Link>
        ))}
        <span className="shrink-0 w-6" aria-hidden="true" />
      </div>
    </section>
  );
};

export default WritersTrail;
