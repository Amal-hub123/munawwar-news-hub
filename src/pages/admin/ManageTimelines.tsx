import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface Stop {
  id?: string;
  title: string;
  label: string;
  description: string;
  image_url: string;
  article_id: string;
}

interface Timeline {
  id: string;
  title: string;
  description: string;
  timeline_type: string;
  image_url: string;
  is_active: boolean;
  stops: Stop[];
}

const ManageTimelines = () => {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [dragKey, setDragKey] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    const [{ data: lines }, { data: stops }, { data: arts }] = await Promise.all([
      supabase.from("timelines").select("*").order("display_order"),
      supabase.from("timeline_stops").select("*").order("display_order"),
      supabase.from("articles").select("id, title").eq("status", "approved").limit(200),
    ]);
    setTimelines(
      (lines || []).map((l: any) => ({
        id: l.id,
        title: l.title,
        description: l.description || "",
        timeline_type: l.timeline_type || "interactive",
        image_url: l.image_url || "",
        is_active: l.is_active,
        stops: (stops || [])
          .filter((s: any) => s.timeline_id === l.id)
          .map((s: any) => ({
            id: s.id,
            title: s.title,
            label: s.label || "",
            description: s.description || "",
            image_url: s.image_url || "",
            article_id: s.article_id || "",
          })),
      })),
    );
    setArticles(arts || []);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = (id: string, p: Partial<Timeline>) =>
    setTimelines((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));

  const addTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const { error } = await supabase.from("timelines").insert({
      title: newTitle.trim(),
      display_order: timelines.length,
    });
    if (error) {
      toast({ title: "خطأ", description: "تعذّرت الإضافة", variant: "destructive" });
      return;
    }
    setNewTitle("");
    load();
  };

  const save = async (t: Timeline) => {
    const { error } = await supabase
      .from("timelines")
      .update({
        title: t.title,
        description: t.description || null,
        timeline_type: t.timeline_type,
        image_url: t.image_url || null,
        is_active: t.is_active,
      })
      .eq("id", t.id);

    if (error) {
      toast({ title: "خطأ", description: "تعذّر الحفظ", variant: "destructive" });
      return;
    }

    await supabase.from("timeline_stops").delete().eq("timeline_id", t.id);
    const rows = t.stops
      .filter((s) => s.title.trim())
      .map((s, i) => ({
        timeline_id: t.id,
        title: s.title,
        label: s.label || null,
        description: s.description || null,
        image_url: s.image_url || null,
        article_id: s.article_id || null,
        display_order: i,
      }));
    if (rows.length) await supabase.from("timeline_stops").insert(rows);

    toast({ title: "تم الحفظ", description: "تم تحديث الخط الزمني" });
    load();
  };

  const remove = async (t: Timeline) => {
    if (!confirm(`حذف الخط "${t.title}"؟`)) return;
    await supabase.from("timelines").delete().eq("id", t.id);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">خطوط المُنحنى</h1>

      <Card>
        <CardHeader><CardTitle>إضافة خط جديد</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={addTimeline} className="flex flex-col sm:flex-row gap-3">
            <Input className="flex-1" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="عنوان الخط الزمني" />
            <Button type="submit" className="gap-2"><Plus className="w-4 h-4" /> إضافة</Button>
          </form>
        </CardContent>
      </Card>

      {timelines.map((t) => (
        <Card key={t.id}>
          <CardHeader><CardTitle className="text-lg">{t.title}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>العنوان</Label>
                <Input value={t.title} onChange={(e) => patch(t.id, { title: e.target.value })} />
              </div>
              <div>
                <Label>نوع العرض</Label>
                <Select value={t.timeline_type} onValueChange={(v) => patch(t.id, { timeline_type: v })}>
                  <SelectTrigger className="text-right"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-right" value="interactive">خط تفاعلي</SelectItem>
                    <SelectItem className="text-right" value="image">صورة مصمّمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>وصف مختصر</Label>
              <Textarea value={t.description} onChange={(e) => patch(t.id, { description: e.target.value })} rows={2} />
            </div>

            {t.timeline_type === "image" && (
              <ImageUpload value={t.image_url} onChange={(url) => patch(t.id, { image_url: url })} label="صورة الخط الزمني" />
            )}

            <div className="flex items-center gap-3">
              <Switch checked={t.is_active} onCheckedChange={(v) => patch(t.id, { is_active: v })} />
              <span className="text-sm">ظاهر في الموقع</span>
            </div>

            {t.timeline_type === "interactive" && (
              <div>
                <div className="flex items-center justify-between">
                  <Label>محطات الخط</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => patch(t.id, { stops: [...t.stops, { title: "", label: "", description: "", image_url: "", article_id: "" }] })}
                  >
                    <Plus className="w-4 h-4 ml-1" /> محطة
                  </Button>
                </div>
                <div className="space-y-3 mt-3">
                  {t.stops.map((stop, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => setDragKey(`${t.id}:${i}`)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (!dragKey?.startsWith(`${t.id}:`)) return;
                        const from = Number(dragKey.split(":")[1]);
                        const stops = [...t.stops];
                        const [item] = stops.splice(from, 1);
                        stops.splice(i, 0, item);
                        patch(t.id, { stops });
                        setDragKey(null);
                      }}
                      className="flex items-start gap-2 border border-border rounded-xl p-3"
                    >
                      <GripVertical className="w-4 h-4 mt-3 text-muted-foreground cursor-grab shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="grid sm:grid-cols-2 gap-2">
                          <Input
                            value={stop.title}
                            onChange={(e) => patch(t.id, { stops: t.stops.map((s, x) => (x === i ? { ...s, title: e.target.value } : s)) })}
                            placeholder="عنوان المحطة"
                          />
                          <Input
                            value={stop.label}
                            onChange={(e) => patch(t.id, { stops: t.stops.map((s, x) => (x === i ? { ...s, label: e.target.value } : s)) })}
                            placeholder="التاريخ أو العلامة"
                          />
                        </div>
                        <Textarea
                          value={stop.description}
                          onChange={(e) => patch(t.id, { stops: t.stops.map((s, x) => (x === i ? { ...s, description: e.target.value } : s)) })}
                          placeholder="وصف مختصر"
                          rows={2}
                        />
                        <Select
                          value={stop.article_id || "none"}
                          onValueChange={(v) => patch(t.id, { stops: t.stops.map((s, x) => (x === i ? { ...s, article_id: v === "none" ? "" : v } : s)) })}
                        >
                          <SelectTrigger className="text-right"><SelectValue placeholder="اربط بمقال" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem className="text-right" value="none">بدون مقال</SelectItem>
                            {articles.map((a) => (
                              <SelectItem className="text-right" key={a.id} value={a.id}>{a.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => patch(t.id, { stops: t.stops.filter((_, x) => x !== i) })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="destructive" onClick={() => remove(t)}>حذف</Button>
              <Button type="button" onClick={() => save(t)}>حفظ</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ManageTimelines;
