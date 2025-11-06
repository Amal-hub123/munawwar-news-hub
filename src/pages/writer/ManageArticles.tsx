import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
  content: string;
  status: string;
  product_id: string | null;
  created_at: string;
}

export const ManageArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProfileAndArticles();
  }, []);

  const loadProfileAndArticles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return;

    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false });

    if (data) setArticles(data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;

    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المقال",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تم الحذف",
      description: "تم حذف المقال بنجاح",
    });

    loadProfileAndArticles();
  };


  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const labels = {
      pending: "قيد المراجعة",
      approved: "موافق عليه",
      rejected: "مرفوض",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">مقالاتي</h1>
        <Link to="/writer/articles/add">
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            إضافة مقال جديد
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(article.status)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/writer/articles/edit/${article.id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageArticles;
