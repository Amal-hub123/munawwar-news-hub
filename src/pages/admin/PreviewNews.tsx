import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PreviewNews = () => {
  const { id } = useParams<{ id: string }>();

  const { data: news, isLoading } = useQuery({
    queryKey: ["preview-news", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select(`
          *,
          profiles:author_id (
            name,
            photo_url,
            bio
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-96 bg-muted rounded"></div>
          <div className="h-12 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-muted-foreground">الخدمة غير موجودة</p>
        <Link to="/admin/news">
          <Button className="mt-4">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة لخدماتنا
          </Button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(news.created_at).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/admin/news">
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة لخدماتنا
          </Button>
        </Link>
      </div>

      <article className="space-y-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={news.cover_image_url}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="text-4xl font-bold leading-tight">{news.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{news.views || 0} مشاهدة</span>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
          <Avatar className="w-16 h-16">
            <AvatarImage src={news.profiles.photo_url} alt={news.profiles.name} />
            <AvatarFallback className="text-lg">{news.profiles.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Link to={`/writers/${news.author_id}`} className="hover:text-primary">
              <h3 className="font-bold text-lg">{news.profiles.name}</h3>
            </Link>
            {news.profiles.bio && (
              <p className="text-sm text-muted-foreground mt-1">{news.profiles.bio}</p>
            )}
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-muted-foreground mb-6">{news.excerpt}</p>
          <div
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </article>
    </div>
  );
};

export default PreviewNews;
