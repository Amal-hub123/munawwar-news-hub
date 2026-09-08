import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft } from "lucide-react";

const sequence = (value: unknown): string[] => Array.isArray(value) ? (value as any[]).map((item) => typeof item === "string" ? item : item?.title).filter(Boolean) : [];
const SequenceLine = ({ points }: { points: string[] }) => points.length ? <div className="article-sequence-mini" aria-label="تسلسل المقال">{points.slice(0, 3).map((point, i) => <span key={`${point}-${i}`} title={point} />)}</div> : null;

export const LatestArticles = () => {
  const { data: articles, isLoading } = useQuery({ queryKey: ["home-latest-articles"], queryFn: async () => { const { data, error } = await supabase.from("articles").select(`id, title, excerpt, cover_image_url, created_at, approved_at, sequence_points, profiles:author_id (id, name, photo_url)`).eq("status", "approved").order("approved_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(5); if (error) throw error; return data || []; } });
  if (isLoading) return <section className="latest-editorial"><div className="container mx-auto h-[34rem] animate-pulse bg-muted/30 px-6" /></section>;
  if (!articles?.length) return null;
  const [lead, ...rest] = articles as any[];
  return (
    <section className="latest-editorial">
      <div className="container mx-auto px-6">
        <Reveal variant="side" className="section-heading-row"><div><p className="editorial-kicker">يُقرأ الآن</p><h2 className="editorial-heading mt-2">أحدث المقالات</h2></div><Link to="/articles" className="editorial-link">كل المقالات <ArrowLeft className="h-4 w-4" /></Link></Reveal>
        <div className="latest-composition">
          <Reveal variant="clip" className="latest-lead">
            <Link to={`/articles/${lead.id}`} className="group block h-full">
              <div className="latest-lead-media zoom-media"><img src={lead.cover_image_url} alt={lead.title} loading="lazy" /></div>
              <div className="latest-lead-copy"><span className="editorial-index">٠١</span><h3>{lead.title}</h3><p>{lead.excerpt}</p><div className="flex items-center justify-between gap-3"><small>{lead.profiles?.name}</small><SequenceLine points={sequence(lead.sequence_points)} /></div></div>
            </Link>
          </Reveal>
          <div className="latest-secondary">
            {rest.map((article: any, i: number) => (
              <Reveal key={article.id} delay={100 + i * 90} variant={i % 2 ? "side" : "clip"} className={`latest-item latest-item-${i + 2}`}>
                <Link to={`/articles/${article.id}`} className="group">
                  <div className="latest-item-media zoom-media"><img src={article.cover_image_url} alt={article.title} loading="lazy" /></div>
                  <div className="latest-item-copy"><span>{String(i + 2).padStart(2, "0")}</span><h3>{article.title}</h3><small>{article.profiles?.name}</small><SequenceLine points={sequence(article.sequence_points)} /></div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default LatestArticles;