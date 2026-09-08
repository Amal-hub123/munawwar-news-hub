import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDragScroll } from "@/hooks/useDragScroll";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, User } from "lucide-react";
import EditorialCurve from "./EditorialCurve";

interface Writer { id: string; name: string; photo_url: string | null; bio: string | null; articles: number; topics: string[]; }
export const WritersTrail = () => {
  const { ref, handlers } = useDragScroll<HTMLDivElement>();
  const { data: writers } = useQuery({ queryKey: ["writers-trail"], queryFn: async (): Promise<Writer[]> => { const [{ data: profiles, error: pErr }, { data: articles, error: aErr }, { data: links, error: lErr }] = await Promise.all([supabase.from("profiles").select("id, name, photo_url, bio").eq("status", "approved"), supabase.from("articles").select("id, author_id").eq("status", "approved"), supabase.from("article_categories").select("article_id, categories:category_id (name)")]); if (pErr) throw pErr; if (aErr) throw aErr; if (lErr) throw lErr; const byAuthor = new Map<string, string[]>(); (articles || []).forEach((article: any) => byAuthor.set(article.author_id, [...(byAuthor.get(article.author_id) || []), article.id])); const byArticle = new Map<string, string[]>(); (links || []).forEach((link: any) => { if (link.categories?.name) byArticle.set(link.article_id, [...(byArticle.get(link.article_id) || []), link.categories.name]); }); return (profiles || []).map((profile: any) => { const ids = byAuthor.get(profile.id) || []; return { ...profile, articles: ids.length, topics: Array.from(new Set(ids.flatMap((id) => byArticle.get(id) || []))).slice(0, 3) }; }).filter((writer) => writer.articles > 0).sort((a, b) => b.articles - a.articles); } });
  if (!writers?.length) return null;
  return (
    <section className="writers-section">
      <div className="container mx-auto px-6"><Reveal variant="side" className="section-heading-row"><div><p className="editorial-kicker">أصوات على المسار</p><h2 className="editorial-heading mt-2">كُتّاب المُنحنى</h2></div><Link to="/writers" className="editorial-link">كل الكُتّاب <ArrowLeft className="h-4 w-4" /></Link></Reveal></div>
      <div className="writers-track-wrap"><EditorialCurve className="writers-curve" flip />
        <div ref={ref} {...handlers} dir="rtl" className="drag-scroll writers-track">
          {writers.map((writer, i) => <Reveal key={writer.id} delay={i * 75} variant="scale" className={`writer-point writer-point-${i % 4}`}><Link to={`/writers/${writer.id}`} draggable={false} className="group block"><div className="writer-portrait">{writer.photo_url ? <img src={writer.photo_url} alt={writer.name} draggable={false} /> : <User />}</div><div className="writer-info"><span>{String(i + 1).padStart(2, "0")}</span><h3>{writer.name}</h3><p>{writer.bio}</p><small>{writer.articles} مقال{writer.topics.length ? ` · ${writer.topics.join("، ")}` : ""}</small></div></Link></Reveal>)}
          <span className="w-[10vw] shrink-0" />
        </div>
      </div>
    </section>
  );
};
export default WritersTrail;