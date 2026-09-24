import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Episode {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  audio_url: string;
  cover_image_url: string | null;
  duration_label: string | null;
}

const AudioEpisodes = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase
      .from("audio_episodes")
      .select("id, title, description, category, audio_url, cover_image_url, duration_label")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setEpisodes((data as Episode[]) || []));
    return () => audioRef.current?.pause();
  }, []);

  const toggle = (ep: Episode) => {
    if (playingId === ep.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const el = new Audio(ep.audio_url);
    el.onended = () => setPlayingId(null);
    audioRef.current = el;
    el.play().then(() => setPlayingId(ep.id)).catch(() => setPlayingId(null));
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <TopBar />
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">مسموع</h1>
        <p className="text-muted-foreground mb-8">كل الحلقات المسجّلة.</p>
        {episodes.length === 0 ? (
          <p className="text-muted-foreground">لا توجد حلقات بعد.</p>
        ) : (
          <ul className="space-y-3">
            {episodes.map((ep) => (
              <li key={ep.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <Button
                  type="button"
                  size="icon"
                  className="shrink-0 rounded-full"
                  onClick={() => toggle(ep)}
                  aria-label={playingId === ep.id ? "إيقاف" : "تشغيل"}
                >
                  {playingId === ep.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold truncate">{ep.title}</h2>
                  <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                    {ep.category && <span>{ep.category}</span>}
                    {ep.duration_label && <span>{ep.duration_label}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AudioEpisodes;
