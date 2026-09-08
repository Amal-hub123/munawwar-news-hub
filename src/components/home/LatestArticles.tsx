import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, User } from "lucide-react";

const asSequence = (value: unknown): string[] =>
  Array.isArray(value) ? (value as any[]).map((v) => (typeof v === "string" ? v : v?.title)).filter(Boolean) : [];

const SequenceChips = ({ points, compact }: { points: string[]; compact?: boolean }) => {
  if (!points.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${compact ? "mt-2" : "mt-4"}`}>
      {points.slice(0, 5).map((p, i) => (
        <span key={i} className="inline-flex items-center gap-2 text-[11px] md:text-xs text-muted-foreground">
          {i > 0 && <span className="opacity-50">←</span>}
          <span className="px-2 py-0.5 rounded-full bg-primary/15">{p}</span>
        </span>
      ))}
    </div>
  );
};

export const LatestArticles = () => {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["home-latest-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          id, title, excerpt, cover_image_url, created_at, approved_at, sequence_points,
          profiles:author_id ( id, name, photo_url )
        `)
        .eq("status", "approved")
        .order("approved_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <section className="py-14">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-6">
          <div className="h-[420px] bg-muted animate-pulse rounded-3xl" />
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) return null;

  const [lead, ...rest] = articles as any[];

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-6">
        <Reveal className="flex items-baseline justify-between gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl text-brand">أحدث المقالات</h2>
          <Link to="/articles" className="inline-flex items-center gap-2 text-sm md:text-base text-brand font-semibold hover:gap-3 transition-all">
            اكتشف أحدث المقالات <ArrowLeft className="w-4 h-4" />
          </Link>
        </Reveal>

        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-6 md:gap-8">
          {/* Lead story */}
          <Reveal>
            <Link to={`/articles/${lead.id}`} className="group zoom-media block h-full">
              <div className="relative overflow-hidden rounded-[26px] h-[300px] md:h-[420px]">
                <img src={lead.cover_image_url} alt={lead.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 text-white">
                  <h3 className="text-2xl md:text-3xl leading-snug">{lead.title}</h3>
                  <p className="text-sm opacity-85 line-clamp-2 mt-2">{lead.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-xs mt-4 opacity-90">
                    {lead.profiles?.photo_url ? (
                      <img src={lead.profiles.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><User className="w-3 h-3" /></span>
                    )}
                    {lead.profiles?.name}
                  </span>
                </div>
              </div>
              <SequenceChips points={asSequence(lead.sequence_points)} />
            </Link>
          </Reveal>

          {/* Editorial mix */}
          <div className="grid gap-5">
            {rest.map((article: any, i: number) => {
              const wide = i === 0;
              return (
                <Reveal key={article.id} delay={80 * (i + 1)}>
                  <Link
                    to={`/articles/${article.id}`}
                    className={`group zoom-media flex gap-4 rounded-2xl overflow-hidden surface-alt p-3 hover:shadow-lg transition-shadow ${wide ? "flex-col sm:flex-row" : ""}`}
                  >
                    <div className={`overflow-hidden rounded-xl shrink-0 ${wide ? "w-full sm:w-40 h-36 sm:h-28" : "w-24 h-24"}`}>
                      <img src={article.cover_image_url} alt={article.title} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`${wide ? "text-lg" : "text-base"} leading-snug line-clamp-2 text-brand`}>{article.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{article.profiles?.name}</p>
                      <SequenceChips points={asSequence(article.sequence_points)} compact />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestArticles;
