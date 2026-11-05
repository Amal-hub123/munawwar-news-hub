import { useDashboardSearch } from "@/components/DashboardSearch";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { parseSequencePoints } from "@/lib/articleExtras";
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import { excludeVisualColumnsFilter, getVisualColumnIds } from "@/lib/visualColumns";


interface Stop {
  title: string;
  description?: string;
}

interface StoryDraft {
  id?: string;
  article_id: string;
  badge: string;
  stops: Stop[];
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

const emptyDraft: StoryDraft = {
  article_id: "",
  badge: "مقال اليوم ",
  stops: [],
  starts_at: "",
  ends_at: "",
  is_active: true,
};

const STOP_TITLES = ["البداية", "المنتصف", "النهاية"];

/** Picks start / middle / end points from the article's own sequence. */
const stopsFromSequence = (value: unknown): Stop[] => {
  const pts = parseSequencePoints(value);
  const pick = pts.length <= 3 ? pts : [pts[0], pts[Math.floor((pts.length - 1) / 2)], pts[pts.length - 1]];
  return STOP_TITLES.map((title, i) => ({ title, description: pick[i] || "" }));
};

const normalizeStops = (stops: Stop[]): Stop[] =>
  STOP_TITLES.map((title, i) => ({ title, description: stops[i]?.description || "" }));

const toLocalInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

const StoryForm = ({
  draft,
  articles,
  onChange,
  onSave,
  onDelete,
}: {
  draft: StoryDraft;
  articles: any[];
  onChange: (d: StoryDraft) => void;
  onSave: () => void;
  onDelete?: () => void;
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const setStop = (i: number, patch: Partial<Stop>) => {
    const stops = [...draft.stops];
    stops[i] = { ...stops[i], ...patch };
    onChange({ ...draft, stops });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= draft.stops.length) return;
    const stops = [...draft.stops];
    const [item] = stops.splice(from, 1);
    stops.splice(to, 0, item);
    onChange({ ...draft, stops });
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>المقال المميز</Label>
          <Select value={draft.article_id || "none"} onValueChange={(v) => {
            const id = v === "none" ? "" : v;
            const art = articles.find((a) => a.id === id);
            onChange({ ...draft, article_id: id, stops: art ? stopsFromSequence(art.sequence_points) : normalizeStops([]) });
          }}>
            <SelectTrigger className="text-right"><SelectValue placeholder="اختر مقالاً" /></SelectTrigger>
            <SelectContent>
              <SelectItem className="text-right" value="none">بدون</SelectItem>
              {articles.map((a) => (
                <SelectItem className="text-right" key={a.id} value={a.id}>{a.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>الشارة</Label>
          <Input value={draft.badge} onChange={(e) => onChange({ ...draft, badge: e.target.value })} maxLength={40} />
        </div>
        <div>
          <Label>يبدأ في</Label>
          <Input type="datetime-local" value={draft.starts_at} onChange={(e) => onChange({ ...draft, starts_at: e.target.value })} />
        </div>
        <div>
          <Label>ينتهي في</Label>
          <Input type="datetime-local" value={draft.ends_at} onChange={(e) => onChange({ ...draft, ends_at: e.target.value })} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={draft.is_active} onCheckedChange={(v) => onChange({ ...draft, is_active: v })} />
        <span className="text-sm">مفعّلة</span>
      </div>

      <div>
        <Label>محطات المقال (تُقرأ تلقائيًا من تسلسل المقال ويمكن تعديل الوصف)</Label>
        <div className="space-y-3 mt-3">
          {normalizeStops(draft.stops).map((stop, i) => (
            <div key={i} className="border border-border rounded-xl p-3 space-y-2">
              <div className="text-sm font-semibold">{stop.title}</div>
              <Textarea
                value={stop.description || ""}
                onChange={(e) => onChange({ ...draft, stops: normalizeStops(draft.stops).map((s, x) => (x === i ? { ...s, description: e.target.value } : s)) })}
                placeholder={`وصف ${stop.title}`}
                rows={2}
                maxLength={200}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onDelete && <Button type="button" variant="destructive" onClick={onDelete}>حذف</Button>}
        <Button type="button" onClick={onSave}>حفظ</Button>
      </div>
    </div>
  );
};

const ManageDailyStories = () => {
  const search = useDashboardSearch();
  const [stories, setStories] = useState<StoryDraft[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [draft, setDraft] = useState<StoryDraft>(emptyDraft);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
  const hidden = excludeVisualColumnsFilter(await getVisualColumnIds());

  const [{ data: rows }, { data: arts }] = await Promise.all([
    supabase.from("daily_stories").select("*").order("created_at", { ascending: false }),

    supabase
      .from("articles")
      .select("id, title, sequence_points")
      .eq("status", "approved")
      .or(hidden ?? "id.not.is.null")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);
    
    setStories(
      (rows || []).map((r: any) => ({
        id: r.id,
        article_id: r.article_id,
        badge: r.badge || "",
        stops: normalizeStops(Array.isArray(r.stops) ? r.stops : []),
        starts_at: toLocalInput(r.starts_at),
        ends_at: toLocalInput(r.ends_at),
        is_active: r.is_active,
      })),
    );
    setArticles(arts || []);
  };

  useEffect(() => {
    load();
  }, []);

  const payload = (d: StoryDraft) => ({
    article_id: d.article_id,
    badge: d.badge || null,
    stops: normalizeStops(d.stops).map((s) => ({ title: s.title, description: s.description || "" })) as any,
    starts_at: d.starts_at ? new Date(d.starts_at).toISOString() : null,
    ends_at: d.ends_at ? new Date(d.ends_at).toISOString() : null,
    is_active: d.is_active,
  });

  const create = async () => {
    if (!draft.article_id) {
      toast({ title: "خطأ", description: "اختر المقال المميز أولاً", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("daily_stories").insert(payload(draft));
    if (error) {
      toast({ title: "خطأ", description: "تعذّر الحفظ", variant: "destructive" });
      return;
    }
    setDraft(emptyDraft);
    setNewOpen(false);
    toast({ title: "تم الحفظ", description: "تمت إضافة المقال" });
    load();
  };

  const update = async (story: StoryDraft) => {
    const { error } = await supabase.from("daily_stories").update(payload(story)).eq("id", story.id!);
    toast(error ? { title: "خطأ", description: "تعذّر الحفظ", variant: "destructive" } : { title: "تم الحفظ", description: "تم تحديث المقال" });
    load();
  };

  const remove = async (story: StoryDraft) => {
    if (!confirm("حذف هذا المقال؟")) return;
    await supabase.from("daily_stories").delete().eq("id", story.id!);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">مقال اليوم</h1>

      <Card>
        <CardHeader className="p-0">
          <Button type="button" variant="ghost" className="h-auto w-full justify-between gap-3 whitespace-normal px-4 py-3 text-right" aria-expanded={newOpen} aria-controls="new-daily-story" onClick={() => setNewOpen(!newOpen)}>
            <span className="flex items-center gap-2"><Plus className="h-4 w-4 shrink-0" /> تجهيز مقال جديد</span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${newOpen ? "rotate-180" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent id="new-daily-story" hidden={!newOpen} className="px-4 pb-4">
          <StoryForm draft={draft} articles={articles} onChange={setDraft} onSave={create} />
        </CardContent>
      </Card>

      {search(stories.map((story) => ({ ...story, article_title: articles.find((a) => a.id === story.article_id)?.title || "مقال" }))).map((story) => (
        <Card key={story.id}>
          <CardHeader className="p-0">
            <Button type="button" variant="ghost" className="h-auto w-full justify-between gap-3 whitespace-normal px-4 py-3 text-right" aria-expanded={openId === story.id} aria-controls={`daily-story-${story.id}`} onClick={() => setOpenId(openId === story.id ? null : story.id ?? null)}>
              <span className="min-w-0 text-base font-bold [overflow-wrap:anywhere]">{story.article_title}</span>
              <span className="flex shrink-0 items-center gap-2">
                {!story.is_active && <span className="text-xs font-normal text-muted-foreground">مخفي</span>}
                <ChevronDown className={`h-4 w-4 transition-transform ${openId === story.id ? "rotate-180" : ""}`} />
              </span>
            </Button>
          </CardHeader>
          <CardContent id={`daily-story-${story.id}`} hidden={openId !== story.id} className="px-4 pb-4">
            <StoryForm
              draft={story}
              articles={articles}
              onChange={(d) => setStories((prev) => prev.map((s) => (s.id === story.id ? d : s)))}
              onSave={() => update(story)}
              onDelete={() => remove(story)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ManageDailyStories;
