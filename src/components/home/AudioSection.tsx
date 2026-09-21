import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Reveal from "@/components/motion/Reveal";
import { Pause, Play } from "lucide-react";

interface Episode {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  audio_url: string;
  cover_image_url: string | null;
  duration_label: string | null;
  episode_date: string | null;
  is_featured: boolean;
}

const AudioSection = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase
      .from("audio_episodes")
      .select("id, title, description, category, audio_url, cover_image_url, duration_label, episode_date, is_featured")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        const rows = (data as Episode[]) || [];
        setEpisodes(rows);
        const featured = rows.find((r) => r.is_featured) || rows[0];
        if (featured) setCurrentId(featured.id);
      });
  }, []);

  const current = useMemo(
    () => episodes.find((e) => e.id === currentId) || null,
    [episodes, currentId],
  );

  useEffect(() => {
    setProgress(0);
    setPlaying(false);
  }, [currentId]);

  const toggle = async (id: string) => {
    if (id !== currentId) {
      setCurrentId(id);
      setTimeout(() => {
        audioRef.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }, 60);
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      try {
        await el.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  if (!episodes.length) return null;

  return (
    <section id="masmoo3" className="audio-section py-14 md:py-20">
      <div className="container mx-auto px-6">
        <Reveal variant="clip">
          <div className="mb-6 md:mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="editorial-kicker">المُنحنى بالصوت</p>
              <h2 className="editorial-heading mt-2">مسموع</h2>
            </div>
            <span className="editorial-index">٠٧</span>
          </div>
        </Reveal>

        <Reveal variant="clip">
          <div className="audio-panel">
            {current && (
              <div className="audio-player">
                {current.cover_image_url && (
                  <div className="audio-player__cover">
                    <img src={current.cover_image_url} alt={current.title} loading="lazy" />
                  </div>
                )}

                <div className="audio-player__body">
                  {current.category && <span className="audio-chip">{current.category}</span>}
                  <h3 className="audio-player__title">{current.title}</h3>
                  {current.description && <p className="audio-player__text">{current.description}</p>}

                  <div className="audio-controls">
                    <button
                      type="button"
                      className="audio-play"
                      onClick={() => toggle(current.id)}
                      aria-label={playing ? "إيقاف" : "تشغيل"}
                    >
                      {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>

                    <div className="audio-bar" aria-hidden>
                      <span className="audio-bar__fill" style={{ width: `${progress}%` }} />
                    </div>

                    <span className="audio-duration">{current.duration_label || ""}</span>
                  </div>

                  <audio
                    ref={audioRef}
                    src={current.audio_url}
                    onTimeUpdate={(e) => {
                      const el = e.currentTarget;
                      if (el.duration) setProgress((el.currentTime / el.duration) * 100);
                    }}
                    onEnded={() => {
                      setPlaying(false);
                      setProgress(0);
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            <ul className="audio-list">
              {episodes.map((ep) => (
                <li key={ep.id}>
                  <button
                    type="button"
                    onClick={() => toggle(ep.id)}
                    className={`audio-item ${ep.id === currentId ? "is-active" : ""}`}
                  >
                    <span className="audio-item__icon">
                      {ep.id === currentId && playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </span>
                    <span className="audio-item__body">
                      <span className="audio-item__title">{ep.title}</span>
                      <span className="audio-item__meta">
                        {ep.category && <span>{ep.category}</span>}
                        {ep.duration_label && <span>{ep.duration_label}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AudioSection;
