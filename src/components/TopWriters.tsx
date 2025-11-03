import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Writer {
  id: string;
  name: string;
  photo_url?: string;
  linkedin_url?: string;
  article_count: number;
}

export const TopWriters = () => {
  const [writers, setWriters] = useState<Writer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTopWriters();
  }, []);

  const fetchTopWriters = async () => {
    try {
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select("author_id")
        .eq("status", "approved");

      if (articlesError) throw articlesError;

      const { data: newsData, error: newsError } = await supabase
        .from("news")
        .select("author_id")
        .eq("status", "approved");

      if (newsError) throw newsError;

      const authorCounts: Record<string, number> = {};
      [...(articlesData || []), ...(newsData || [])].forEach((item) => {
        authorCounts[item.author_id] = (authorCounts[item.author_id] || 0) + 1;
      });

      const topAuthorIds = Object.entries(authorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, photo_url, linkedin_url")
        .in("id", topAuthorIds)
        .eq("status", "approved");

      if (profilesError) throw profilesError;

      const writersWithCounts = profiles?.map((profile) => ({
        ...profile,
        article_count: authorCounts[profile.id] || 0,
      })) || [];

      writersWithCounts.sort((a, b) => b.article_count - a.article_count);
      setWriters(writersWithCounts);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الكتاب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">أفضل 5 كتّاب</h3>
      {writers.map((writer, index) => (
        <Card key={writer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-primary w-8">
                {index + 1}
              </div>
              <Link to={`/writers/${writer.id}`} className="flex items-center gap-3 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={writer.photo_url} alt={writer.name} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold hover:text-primary transition-colors">
                    {writer.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {writer.article_count} مقال ومقالة
                  </p>
                </div>
              </Link>
              {writer.linkedin_url && (
                <a
                  href={writer.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-accent transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};