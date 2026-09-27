import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { ArticleCard } from "@/components/ArticleCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { parseSequencePoints } from "@/lib/articleExtras";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
  created_at: string;
  sequence_points?: unknown;
  profiles: {
    id: string;
    name: string;
    photo_url: string | null;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ARTICLES_PER_PAGE = 20;

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articleCategories, setArticleCategories] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSlug = searchParams.get("category") || "";
  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [
        { data: initialArticles, error },
        { data: cats },
        { data: links },
      ] = await Promise.all([
        supabase
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
          .order("approved_at", { ascending: false })
          .range(0, ARTICLES_PER_PAGE - 1),

        supabase
          .from("categories")
          .select("id, name, slug, display_order")
          .order("display_order"),

        supabase
          .from("article_categories")
          .select("article_id, categories:category_id ( id, name, slug )"),
      ]);

      if (error) throw error;

      setArticles(initialArticles || []);
      setCategories(cats || []);

      const map: Record<string, string[]> = {};

      (links || []).forEach((row: any) => {
        if (!row.categories) return;

        map[row.article_id] = [
          ...(map[row.article_id] || []),
          row.categories.slug,
        ];
      });

      setArticleCategories(map);

      // إذا رجعت أقل من 20، فهذا يعني ما فيه مقالات إضافية
      setHasMore((initialArticles?.length || 0) === ARTICLES_PER_PAGE);
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

  const fetchMoreArticles = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);

      const from = articles.length;
      const to = from + ARTICLES_PER_PAGE - 1;

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
        .order("approved_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const newArticles = data || [];

      setArticles((prev) => [...prev, ...newArticles]);

      // تحميل تصنيفات المقالات الجديدة
      if (newArticles.length > 0) {
        const newArticleIds = newArticles.map((article) => article.id);

        const { data: links, error: linksError } = await supabase
          .from("article_categories")
          .select(
            "article_id, categories:category_id ( id, name, slug )"
          )
          .in("article_id", newArticleIds);

        if (linksError) throw linksError;

        setArticleCategories((prev) => {
          const updated = { ...prev };

          (links || []).forEach((row: any) => {
            if (!row.categories) return;

            updated[row.article_id] = [
              ...(updated[row.article_id] || []),
              row.categories.slug,
            ];
          });

          return updated;
        });
      }

      // إذا رجعت أقل من 20، وصلنا لنهاية المقالات
      setHasMore(newArticles.length === ARTICLES_PER_PAGE);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل المزيد من المقالات",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const slugToName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, c.name])),
    [categories]
  );

  const visible = useMemo(() => {
    if (!activeSlug) return articles;

    return articles.filter((article) =>
      (articleCategories[article.id] || []).includes(activeSlug)
    );
  }, [articles, articleCategories, activeSlug]);

  const selectCategory = (slug: string) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <main className="container mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            جميع المقالات
          </h1>

          <p className="text-muted-foreground">
            تصفح جميع المقالات المنشورة على المُنحنى
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              type="button"
              onClick={() => selectCategory("")}
              className={cn(
                "px-4 py-2 rounded-full text-sm border transition-all duration-300",
                !activeSlug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              )}
            >
              الكل
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(cat.slug)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm border transition-all duration-300",
                  activeSlug === cat.slug
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Loading initial articles */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {activeSlug
                ? `لا توجد مقالات في "${
                    slugToName[activeSlug] || activeSlug
                  }" حالياً`
                : "لا توجد مقالات منشورة حالياً"}
            </p>
          </div>
        ) : (
          <>
            {/* Articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visible.map((article) => (
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
                  categories={(articleCategories[article.id] || [])
                    .map((slug) => slugToName[slug])
                    .filter(Boolean)}
                  sequencePoints={parseSequencePoints(
                    article.sequence_points
                  )}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  type="button"
                  onClick={fetchMoreArticles}
                  disabled={loadingMore}
                  className={cn(
                    "px-8 py-3 rounded-full border border-primary",
                    "text-primary font-medium",
                    "transition-all duration-300",
                    "hover:bg-primary hover:text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {loadingMore
                    ? "جاري تحميل المزيد..."
                    : "المزيد من المقالات"}
                </button>
              </div>
            )}

            {/* End of articles */}
            {!hasMore && articles.length > 20 && (
              <div className="text-center mt-12">
                <p className="text-sm text-muted-foreground">
                  وصلت إلى نهاية المقالات
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Articles;
