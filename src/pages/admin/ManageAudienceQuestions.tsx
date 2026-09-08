import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

const STATUSES: { value: string; label: string }[] = [
  { value: "new", label: "جديد" },
  { value: "under_review", label: "قيد الدراسة" },
  { value: "in_progress", label: "قيد الكتابة" },
  { value: "published", label: "أصبح محتوى" },
  { value: "archived", label: "مؤرشف" },
];

const ManageAudienceQuestions = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const load = async () => {
    const [{ data: qs }, { data: arts }] = await Promise.all([
      supabase.from("audience_questions").select("*").order("created_at", { ascending: false }),
      supabase.from("articles").select("id, title").eq("status", "approved").order("created_at", { ascending: false }).limit(200),
    ]);
    setQuestions(qs || []);
    setArticles(arts || []);
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, patch: Record<string, any>) => {
    const { error } = await supabase.from("audience_questions").update(patch).eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: "تعذّر التحديث", variant: "destructive" });
      return;
    }
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا السؤال؟")) return;
    await supabase.from("audience_questions").delete().eq("id", id);
    load();
  };

  const visible = filter === "all" ? questions : questions.filter((q) => q.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">أسئلة الجمهور</h1>
        <div className="w-56">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="text-right"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem className="text-right" value="all">كل الأسئلة</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem className="text-right" key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {visible.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">لا توجد أسئلة في هذه الحالة.</CardContent></Card>
      )}

      {visible.map((q) => (
        <Card key={q.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg leading-relaxed">{q.question}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {q.name ? `من: ${q.name}` : "بدون اسم"} · {new Date(q.created_at).toLocaleDateString("ar-EG")}
            </p>
          </CardHeader>
          <CardContent className="grid md:grid-cols-[200px_1fr_auto] gap-3 items-center">
            <Select value={q.status} onValueChange={(v) => update(q.id, { status: v })}>
              <SelectTrigger className="text-right"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem className="text-right" key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={q.linked_article_id || "none"}
              onValueChange={(v) => update(q.id, { linked_article_id: v === "none" ? null : v })}
            >
              <SelectTrigger className="text-right"><SelectValue placeholder="اربط بمقال منشور" /></SelectTrigger>
              <SelectContent>
                <SelectItem className="text-right" value="none">بدون مقال</SelectItem>
                {articles.map((a) => (
                  <SelectItem className="text-right" key={a.id} value={a.id}>{a.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="destructive" size="sm" onClick={() => remove(q.id)} className="gap-1">
              <Trash2 className="w-4 h-4" /> حذف
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ManageAudienceQuestions;
