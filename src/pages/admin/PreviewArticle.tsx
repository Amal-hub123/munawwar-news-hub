import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PreviewArticle = () => {
  const { id } = useParams<{ id: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ["preview-article", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          profiles:author_id (
            name,
            photo_url,
            bio
          ),
          products (
            id,
            name,
            image_url
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

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-muted-foreground">المقال غير موجود</p>
        <Link to="/admin/articles">
          <Button className="mt-4">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للمقالات
          </Button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(article.created_at).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/admin/articles">
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للمقالات
          </Button>
        </Link>
      </div>

      <article className="space-y-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="text-4xl font-bold leading-tight">{article.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{article.views || 0} مشاهدة</span>
          </div>
        </div>

        {article.products && (
          <Link to={`/products/${article.products.id}`}>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <img
                src={article.products.image_url}
                alt={article.products.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="text-xs text-muted-foreground">المنتج المرتبط</p>
                <p className="font-semibold">{article.products.name}</p>
              </div>
            </div>
          </Link>
        )}

        <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
          <Avatar className="w-16 h-16">
            <AvatarImage src={article.profiles.photo_url} alt={article.profiles.name} />
            <AvatarFallback className="text-lg">{article.profiles.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Link to={`/writers/${article.author_id}`} className="hover:text-primary">
              <h3 className="font-bold text-lg">{article.profiles.name}</h3>
            </Link>
            {article.profiles.bio && (
              <p className="text-sm text-muted-foreground mt-1">{article.profiles.bio}</p>
            )}
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-muted-foreground mb-6">{article.excerpt}</p>
          <div
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>
    </div>
  );
};

export default PreviewArticle;
