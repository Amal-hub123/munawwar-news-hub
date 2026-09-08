import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/motion/Reveal";

interface Cell { id: string; name: string; slug: string; count: number; }
const shape = (i: number) => ["mosaic-xl", "mosaic-tall", "mosaic-wide", "mosaic-small", "mosaic-medium", "mosaic-small"][i % 6];
export const CategoryMosaic = () => {
  const [active, setActive] = useState<string | null>(null);
  const { data: cells } = useQuery({ queryKey: ["category-mosaic"], queryFn: async (): Promise<Cell[]> => { const [{ data: categories, error: categoryError }, { data: links, error: linkError }] = await Promise.all([supabase.from("categories").select("id, name, slug, display_order").order("display_order"), supabase.from("article_categories").select("category_id, articles:article_id (status)")]); if (categoryError) throw categoryError; if (linkError) throw linkError; const counts = new Map<string, number>(); (links || []).forEach((row: any) => { if (row.articles?.status === "approved") counts.set(row.category_id, (counts.get(row.category_id) || 0) + 1); }); return (categories || []).map((item: any) => ({ ...item, count: counts.get(item.id) || 0 })).filter((item) => item.count > 0).sort((a, b) => b.count - a.count); } });
  if (!cells?.length) return null;
  return (
    <section className="mosaic-section">
      <div className="container mx-auto px-6"><Reveal variant="side" className="section-heading-row"><div><p className="editorial-kicker">اختر مدخلك</p><h2 className="editorial-heading mt-2">مربع المُنحنى</h2></div><span className="editorial-index">٠٤</span></Reveal>
        <div className={`mosaic-layout ${active ? "has-active" : ""}`} onMouseLeave={() => setActive(null)}>
          {cells.map((cell, i) => <Reveal key={cell.id} delay={i * 55} variant="scale" className={`${shape(i)} mosaic-reveal`}><Link to={`/articles?category=${encodeURIComponent(cell.slug)}`} onMouseEnter={() => setActive(cell.id)} className={`mosaic-cell ${active === cell.id ? "is-active" : ""}`}><span className="mosaic-order">{String(i + 1).padStart(2, "0")}</span><strong>{cell.name}</strong><span className="mosaic-count">{cell.count} مقال</span></Link></Reveal>)}
        </div>
      </div>
    </section>
  );
};
export default CategoryMosaic;