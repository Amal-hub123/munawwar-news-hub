import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

const slugify = (value: string) =>
  value
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || `cat-${Date.now().toString(36)}`;

const ManageCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const load = async () => {
    const [{ data }, { data: links }] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("article_categories").select("category_id"),
    ]);
    setCategories(data || []);
    const map: Record<string, number> = {};
    (links || []).forEach((l: any) => (map[l.category_id] = (map[l.category_id] || 0) + 1));
    setCounts(map);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const { error } = await supabase.from("categories").insert({
      name: newName.trim(),
      slug: slugify(newName),
      display_order: categories.length,
    });
    if (error) {
      toast({ title: "خطأ", description: "تعذّرت إضافة التصنيف", variant: "destructive" });
      return;
    }
    setNewName("");
    load();
  };

  const rename = async (cat: Category, name: string) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, name } : c)));
  };

  const save = async (cat: Category) => {
    const { error } = await supabase
      .from("categories")
      .update({ name: cat.name, slug: slugify(cat.name) })
      .eq("id", cat.id);
    toast(
      error
        ? { title: "خطأ", description: "تعذّر الحفظ", variant: "destructive" }
        : { title: "تم الحفظ", description: "تم تحديث التصنيف" },
    );
    load();
  };

  const remove = async (cat: Category) => {
    if (!confirm(`حذف التصنيف "${cat.name}"؟ لن يتم حذف أي مقال.`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", cat.id);
    if (error) {
      toast({ title: "خطأ", description: "تعذّر الحذف", variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف", description: "حُذف التصنيف والمقالات باقية كما هي" });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">التصنيفات</h1>

      <Card>
        <CardHeader>
          <CardTitle>إضافة تصنيف</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="sr-only">اسم التصنيف</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="اسم التصنيف" maxLength={60} />
            </div>
            <Button type="submit" className="gap-2"><Plus className="w-4 h-4" /> إضافة</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>التصنيفات الحالية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.length === 0 && <p className="text-muted-foreground">لا توجد تصنيفات بعد.</p>}
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-border rounded-xl p-3">
              <Input className="flex-1" value={cat.name} onChange={(e) => rename(cat, e.target.value)} />
              <span className="text-sm text-muted-foreground whitespace-nowrap">{counts[cat.id] || 0} مقال</span>
              <div className="flex gap-2 shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => save(cat)} className="gap-1">
                  <Save className="w-4 h-4" /> حفظ
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => remove(cat)} className="gap-1">
                  <Trash2 className="w-4 h-4" /> حذف
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCategories;
