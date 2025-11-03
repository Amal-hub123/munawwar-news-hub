import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { z } from "zod";

const writerSchema = z.object({
  name: z.string().min(3, "الاسم يجب أن يحتوي على 3 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(10, "رقم الهاتف غير صحيح"),
  bio: z.string().max(150, "النبذة يجب ألا تتجاوز 150 حرف"),
  linkedin: z.string().url("رابط لينكد إن غير صحيح").optional().or(z.literal("")),
});

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    linkedin: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = writerSchema.safeParse(formData);
      
      if (!validation.success) {
        toast({
          title: "خطأ في البيانات",
          description: validation.error.issues[0].message,
          variant: "destructive",
        });
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36).slice(-12),
        options: {
          data: {
            name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;

      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سيتم مراجعة طلبك وإرسال بيانات الدخول إلى بريدك الإلكتروني",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "خطأ في إرسال الطلب",
        description: error.message,
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
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">سجل واكتب معنا</CardTitle>
              <CardDescription>
                انضم إلى فريق منحنى وشارك أفكارك ومقالاتك مع الجمهور
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="example@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم التواصل *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">نبذة عنك (150 حرف كحد أقصى) *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    required
                    maxLength={150}
                    placeholder="اكتب نبذة مختصرة عنك وعن اهتماماتك..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground text-left">
                    {formData.bio.length} / 150
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">رابط حسابك على لينكد إن (اختياري)</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    ملاحظة: بعد مراجعة طلبك وقبوله، سنرسل إليك بريداً إلكترونياً يحتوي على بيانات تسجيل الدخول الخاصة بك.
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "جاري الإرسال..." : "إرسال الطلب"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;