import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const ProductsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const itemsPerView = 6;
  const maxIndex = Math.max(0, (products?.length || 0) - itemsPerView);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (isLoading) {
    return (
      <div className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">منتجات منحنى</h2>
          <div className="flex gap-4 justify-center">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-48 h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">منتجات منحنى</h2>
        
        <div className="relative">
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
              aria-label="السابق"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 208}px)`,
              }}
            >
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="flex-shrink-0 w-48"
                >
                  <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {currentIndex < maxIndex && (
            <button
              onClick={handleNext}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
              aria-label="التالي"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsSlider;