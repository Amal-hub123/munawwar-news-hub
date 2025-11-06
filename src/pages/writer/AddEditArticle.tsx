import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

interface Product {
  id: string;
  name: string;
}

export const AddEditArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
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
    loadData();
  }, [id]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return;
    setProfileId(profile.id);

    const { data: productsData } = await supabase
      .from("products")
      .select("id, name")
      .order("name");
    if (productsData) setProducts(productsData);

    if (id) {
      const { data: article } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (article) {
        setFormData({
          title: article.title,
          excerpt: article.excerpt,
          cover_image_url: article.cover_image_url,
          content: article.content,
          product_id: article.product_id || "",
        });
      }
    }
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

    if (id) {
      const { error } = await supabase
        .from("articles")
        .update(articleData)
        .eq("id", id);

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

    navigate("/writer/articles");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/writer/articles")}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">{id ? "تعديل المقال" : "إضافة مقال جديد"}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات المقال</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Label>المنتج </Label>
              <Select style={{textContent : 'right'}}
                value={formData.product_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, product_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر منتجاً" />
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
              <Button type="button" variant="outline" onClick={() => navigate("/writer/articles")}>
                إلغاء
              </Button>
              <Button type="submit">
                {id ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEditArticle;
