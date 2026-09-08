import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/motion/Reveal";

interface MosaicCell {
  id: string;
  name: string;
  slug: string;
  count: number;
}

/** Deterministic mosaic weights so the grid stays balanced, driven by real counts. */
const spanFor = (index: number, count: number, max: number) => {
  const ratio = max > 0 ? count / max : 0;
  if (index === 0 || ratio > 0.75) return "md:col-span-3 md:row-span-2";
  if (ratio > 0.45) return "md:col-span-2 md:row-span-1";
  if (index % 5 === 0) return "md:col-span-2 md:row-span-2";
  return "md:col-span-1 md:row-span-1";
};

export const CategoryMosaic = () => {
  const { data: cells } = useQuery({
    queryKey: ["category-mosaic"],
    queryFn: async (): Promise<MosaicCell[]> => {
      const [{ data: categories, error: catErr }, { data: links, error: linkErr }] = await Promise.all([
        supabase.from("categories").select("id, name, slug, display_order").order("display_order"),
        supabase.from("article_categories").select("category_id, articles:article_id ( status )"),
      ]);
      if (catErr) throw catErr;
      if (linkErr) throw linkErr;

      const counts = new Map<string, number>();
      (links || []).forEach((row: any) => {
        if (row.articles?.status === "approved") {
          counts.set(row.category_id, (counts.get(row.category_id) || 0) + 1);
        }
      });

      return (categories || [])
        .map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, count: counts.get(c.id) || 0 }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count);
    },
  });

  if (!cells || cells.length === 0) return null;

  const max = Math.max(...cells.map((c) => c.count));

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-6">
        <Reveal className="mb-8">
          <h2 className="text-3xl md:text-4xl text-brand">مربع المُنحنى</h2>
          <p className="text-muted-foreground mt-2">ادخل من الموضوع الذي يشبه سؤالك.</p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-6 auto-rows-[130px] md:auto-rows-[120px] gap-3 md:gap-4">
          {cells.map((cell, i) => (
            <Reveal key={cell.id} delay={i * 60} className={spanFor(i, cell.count, max)}>
              <Link
                to={`/articles?category=${encodeURIComponent(cell.slug)}`}
                className="group relative h-full w-full rounded-2xl overflow-hidden surface-alt border border-border/60 flex flex-col justify-end p-4 md:p-5 transition-all duration-500 hover:border-primary hover:-translate-y-1"
              >
                <span className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />
                <span className="relative text-lg md:text-xl font-semibold text-brand leading-snug">{cell.name}</span>
                <span className="relative text-xs text-muted-foreground mt-1">{cell.count} مقال</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryMosaic;
