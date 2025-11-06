import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

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
  const [products, setProducts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [profileId, setProfileId] = useState<string>("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    cover_image_url: "",
    content: "",
    product_id: "",
  });

  useEffect(() => {
    loadProfileAndArticles();
    loadProducts();
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
    setProfileId(profile.id);

    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false });

    if (data) setArticles(data);
  };

  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("display_order");
    if (data) setProducts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.excerpt || !formData.cover_image_url) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const articleData = {
      ...formData,
      product_id: formData.product_id || null,
      author_id: profileId,
      status: "pending" as "pending",
    };

    if (editingArticle) {
      const { error } = await supabase
        .from("articles")
        .update(articleData)
        .eq("id", editingArticle.id);

      if (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحديث المقال",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم التحديث",
        description: "تم تحديث المقال بنجاح",
      });
    } else {
      const { error } = await supabase.from("articles").insert(articleData);

      if (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء إضافة المقال",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم الإضافة",
        description: "تم إضافة المقال بنجاح وسيتم مراجعته من قبل الإدارة",
      });
    }

    setIsDialogOpen(false);
    resetForm();
    loadProfileAndArticles();
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      cover_image_url: article.cover_image_url,
      content: article.content,
      product_id: article.product_id || "",
    });
    setIsDialogOpen(true);
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

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      cover_image_url: "",
      content: "",
      product_id: "",
    });
    setEditingArticle(null);
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة مقال جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader style={{textAlign : 'right'}}>
              <DialogTitle>{editingArticle ? "تعديل المقال" : "إضافة مقال جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>العنوان</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="عنوان المقال"
                  required
                />
              </div>

              <div>
                <Label>النبذة المختصرة</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="نبذة مختصرة عن المقال"
                  rows={3}
                  required
                />
              </div>

              <ImageUpload
                value={formData.cover_image_url}
                onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                label="صورة الغلاف"
              />

              <div>
                <Label>منتج منحنى (اختياري)</Label>
                <Select
                  value={formData.product_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, product_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر منتج " />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">مقال عام </SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>المحتوى</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="اكتب محتوى المقال هنا..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingArticle ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                      {new Date(article.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(article)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
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
