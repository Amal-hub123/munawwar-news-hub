import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";


const ProductsSlider = () => {
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
        <h2 className="text-3xl font-bold mb-8 text-start text-primary">منتجات المنحنى</h2>
        
        <div className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              direction: "rtl",
            }}
            className="w-full"
          >
            
            <CarouselContent className="-mr-4">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pr-4 basis-1/2 md:basis-1/3 lg:basis-1/6">
                  <Link to={`/products/${product.id}`}>
                    <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          
          <CarouselNext className="-left-12 right-auto" />
          <CarouselPrevious className="-right-12 left-auto" />
        </div>
      </div>
    </section>
  );
};

export default ProductsSlider;
