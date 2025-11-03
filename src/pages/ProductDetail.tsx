import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { ArticleCard } from "@/components/ArticleCard";

const ProductDetail = () => {
  const { id } = useParams();

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: articles } = useQuery({
    queryKey: ["product-articles", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          profiles:author_id (name, photo_url)
        `)
        .eq("product_id", id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">المنتج غير موجود</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg p-8 mb-8 shadow-md">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-64 h-64 object-cover rounded-lg"
            />
            
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              {product.description && (
                <p className="text-lg text-muted-foreground">{product.description}</p>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center">المقالات المتعلقة</h2>
        
        {articles && articles.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                excerpt={article.excerpt}
                coverImage={article.cover_image_url}
                author={{
                  name: article.profiles.name,
                  photo: article.profiles.photo_url || undefined,
                }}
                date={article.created_at}
                type="article"
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">لا توجد مقالات متعلقة بهذا المنتج</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;