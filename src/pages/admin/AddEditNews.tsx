import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

const AdminAddEditNews = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    cover_image_url: "",
    content: "",
  });

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    const { data: news } = await supabase
      .from("news")
      .select("*")
      .eq("id", id!)
      .single();

    if (news) {
      setFormData({
        title: news.title,
        excerpt: news.excerpt,
        cover_image_url: news.cover_image_url,
        content: news.content,
      });
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

    if (id) {
      const { error } = await supabase
        .from("news")
        .update({
          title: formData.title,
          excerpt: formData.excerpt,
          cover_image_url: formData.cover_image_url,
          content: formData.content,
        })
        .eq("id", id);

      if (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحديث الخبر",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم التحديث",
        description: "تم تحديث الخبر بنجاح",
      });
    }

    navigate("/admin/news");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/news")}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">تعديل الخبر</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات الخبر</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>العنوان</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان الخبر"
                required
              />
            </div>

            <div>
              <Label>النبذة المختصرة</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="نبذة مختصرة عن الخبر"
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
              <Label>المحتوى</Label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="اكتب محتوى الخبر هنا..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/admin/news")}>
                إلغاء
              </Button>
              <Button type="submit">تحديث</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAddEditNews;
