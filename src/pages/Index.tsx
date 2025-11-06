import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { NewsSlider } from "@/components/NewsSlider";
import { TopWriters } from "@/components/TopWriters";
import { ArticleCard } from "@/components/ArticleCard";
import ProductsSlider from "@/components/ProductsSlider";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    photo_url: string | null;
  };
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          profiles (
            id,
            name,
            photo_url
          )
        `)
        .eq("status", "approved")
        .is("product_id", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل المقالات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <NewsSlider />
          </div>
          <div className="lg:col-span-1">
            <TopWriters />
          </div>
        </section>

        {/* Products Section */}
        <ProductsSlider />

        {/* Latest Articles */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">أحدث المقالات</h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
