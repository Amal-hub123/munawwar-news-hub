import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { User, Linkedin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/ArticleCard";


const WriterDetail = () => {
  const { id } = useParams();
  const [filter, setFilter] = useState<"all" | "articles" | "news">("all");

  // ✅ جلب بيانات الكاتب
  const { data: writer, isLoading: writerLoading } = useQuery({
    queryKey: ["writer", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .single();

      if (error) throw error;
      return data;
    },
  });

  // ✅ جلب المقالات
  const { data: articles } = useQuery({
    queryKey: ["writer-articles", id, filter],
    queryFn: async () => {
      if (filter === "news") return [];
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          profiles:author_id (name, photo_url)
        `)
        .eq("author_id", id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // ✅ جلب الأخبار
  const { data: news } = useQuery({
    queryKey: ["writer-news", id, filter],
    queryFn: async () => {
      if (filter === "articles") return [];
      const { data, error } = await supabase
        .from("news")
        .select(`
          *,
          profiles:author_id (name, photo_url)
        `)
        .eq("author_id", id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // ✅ حالة التحميل
  if (writerLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // ✅ في حال لم يتم العثور على الكاتب
  if (!writer) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">الكاتب غير موجود</h1>
        </div>
      </div>
    );
  }

  // ✅ العرض الرئيسي
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <div className="container mx-auto px-2 py-4">
        <div className="bg-card rounded-lg p-8 mb-3 shadow-md">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {writer.photo_url ? (
              <img
                src={writer.photo_url}
                alt={writer.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-16 h-16 text-primary" />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{writer.name}</h1>
              {writer.bio && (
                <div className="flex justify-between items-center mb-4">
                  <p className="text-muted-foreground line-clamp-2">
                    {writer.bio}
                  </p>
                  {writer.linkedin_url && (
                    <a
                      href={writer.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ أزرار الفلترة */}
        <div className="mb-6">
          <div className="flex gap-4 justify-center">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              الكل
            </Button>
            <Button
              variant={filter === "articles" ? "default" : "outline"}
              onClick={() => setFilter("articles")}
            >
              المقالات
            </Button>
            <Button
              variant={filter === "news" ? "default" : "outline"}
              onClick={() => setFilter("news")}
            >
              الأخبار
            </Button>
          </div>
        </div>

        {/* ✅ عرض المقالات والأخبار */}
        <div className="grid md:grid-cols-2 gap-6">
          {filter !== "news" &&
            articles?.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                excerpt={article.excerpt}
                coverImage={article.cover_image_url}
                author={{
                  name: article.profiles?.name,
                  photo: article.profiles?.photo_url || undefined,
                }}
                date={article.created_at}
                type="article"
              />
            ))}

          {filter !== "articles" &&
            news?.map((item) => (
              <ArticleCard
                key={item.id}
                id={item.id}
                title={item.title}
                excerpt={item.excerpt}
                coverImage={item.cover_image_url}
                author={{
                  name: item.profiles?.name,
                  photo: item.profiles?.photo_url || undefined,
                }}
                date={item.created_at}
                type="news"
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default WriterDetail;
