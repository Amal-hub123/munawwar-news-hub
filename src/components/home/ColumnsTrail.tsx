import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDragScroll } from "@/hooks/useDragScroll";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Horizontal exploration trail for the existing "الأعمدة" (products).
 * Admin management is untouched — this only changes how they are explored.
 */
export const ColumnsTrail = () => {
  const { ref, handlers } = useDragScroll<HTMLDivElement>();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="h-8 w-40 bg-muted animate-pulse rounded mb-6" />
          <div className="flex gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-48 h-48 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  const few = products.length <= 4;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-6">
        <Reveal className="flex items-baseline justify-between gap-4 mb-7">
          <h2 className="text-3xl md:text-4xl text-brand">الأعمدة</h2>
          {!few && <span className="text-xs text-muted-foreground">اسحب لاستكشاف المزيد</span>}
        </Reveal>
      </div>

      {few ? (
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.map((product: any) => (
              <Link key={product.id} to={`/products/${product.id}`} className="group zoom-media block">
                <div className="bg-card1 overflow-hidden rounded-2xl hover:shadow-xl transition-shadow">
                  <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={ref}
          {...handlers}
          dir="rtl"
          className="drag-scroll gap-5 px-6 md:px-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))] pb-2"
        >
          {products.map((product: any) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              draggable={false}
              className="group zoom-media shrink-0 w-[46vw] sm:w-[30vw] md:w-[19vw] lg:w-[15vw]"
            >
              <div className="bg-card1 overflow-hidden rounded-2xl hover:shadow-xl transition-shadow">
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  draggable={false}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          ))}
          {/* trailing spacer so the last item can breathe */}
          <span className="shrink-0 w-6" aria-hidden="true" />
        </div>
      )}
    </section>
  );
};

export default ColumnsTrail;
