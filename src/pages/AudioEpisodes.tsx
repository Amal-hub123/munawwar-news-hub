import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Pause,
  Play,
  Headphones,
  Clock3,
} from "lucide-react";
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
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase
      .from("audio_episodes")
      .select(
        "id, title, description, category, audio_url, cover_image_url, duration_label"
      )
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        setEpisodes((data as Episode[]) || []);
      });

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggle = async (episode: Episode) => {
    const currentAudio = audioRef.current;

    // نفس الحلقة
    if (playingId === episode.id && currentAudio) {
      if (currentAudio.paused) {
        try {
          await currentAudio.play();
          setPlayingId(episode.id);
        } catch {
          setPlayingId(null);
        }
      } else {
        currentAudio.pause();
        setPlayingId(null);
      }

      return;
    }

    // أوقف الحلقة السابقة
    currentAudio?.pause();

    const audio = new Audio(episode.audio_url);

    audioRef.current = audio;
    setPlayingId(episode.id);
    setProgress(0);

    audio.ontimeupdate = () => {
      if (
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        setProgress(
          (audio.currentTime / audio.duration) * 100
        );
      }
    };

    audio.onended = () => {
      setPlayingId(null);
      setProgress(0);
    };

    audio.onerror = () => {
      setPlayingId(null);
      setProgress(0);
    };

    try {
      await audio.play();
    } catch {
      setPlayingId(null);
      setProgress(0);
    }
  };

  return (
    <div
      className="audio-archive-page"
      dir="rtl"
    >
      <TopBar />
      <Header />

      <main className="audio-archive container mx-auto px-8 py-12">

        {/* =========================================
            Intro
        ========================================= */}

        <section className="audio-archive-intro">

          <div className="audio-archive-kicker">
            <Headphones />
            <span>مسموع</span>
          </div>

          <h1>
            أصواتٌ تُسمع
            <br />
            <em>وحكاياتٌ تبقى</em>
          </h1>

          <p>
            حلقات المُنحنى الصوتية؛
            أفكار وحكايات تأخذك إلى زاوية
            أخرى من الحكاية
          </p>

        </section>


        {/* =========================================
            Episodes
        ========================================= */}

        {episodes.length === 0 ? (

          <section className="audio-archive-empty">
            <Headphones />
            <p>لا توجد حلقات بعد.</p>
          </section>

        ) : (

          <section className="audio-archive-list">

            {episodes.map((episode, index) => {

              const isPlaying =
                playingId === episode.id;

              return (
                <article
                  key={episode.id}
                  className={`audio-episode-card ${
                    isPlaying
                      ? "is-playing"
                      : ""
                  }`}
                  style={
                    {
                      "--audio-index": index,
                    } as React.CSSProperties
                  }
                >

                  {/* الصورة */}

                  <div className="audio-episode-media">

                    {episode.cover_image_url ? (
                      <img
                        src={episode.cover_image_url}
                        alt={episode.title}
                        loading={
                          index < 2
                            ? "eager"
                            : "lazy"
                        }
                      />
                    ) : (
                      <div className="audio-episode-media-placeholder">
                        <Headphones />
                      </div>
                    )}

                    <div className="audio-episode-media-overlay" />

                   
                  </div>


                  {/* المحتوى */}

                  <div className="audio-episode-content">

                    <div className="audio-episode-top">

                      {episode.category && (
                        <span className="audio-episode-category">
                          {episode.category}
                        </span>
                      )}

                      {episode.duration_label && (
                        <span className="audio-episode-duration">
                          <Clock3 />
                          {episode.duration_label}
                        </span>
                      )}

                    </div>


                    <h2>
                      {episode.title}
                    </h2>


                    {episode.description && (
                      <p className="audio-episode-description">
                        {episode.description}
                      </p>
                    )}


                    {/* المشغل */}

                    <div className="audio-episode-controls">

                      <button
                        type="button"
                        className="audio-episode-play"
                        onClick={() =>
                          toggle(episode)
                        }
                        aria-label={
                          isPlaying
                            ? "إيقاف الحلقة"
                            : "تشغيل الحلقة"
                        }
                      >
                        {isPlaying ? (
                          <Pause />
                        ) : (
                          <Play />
                        )}
                      </button>


                      <div className="audio-episode-progress">

                        <div
                          className="audio-episode-progress-track"
                        >
                          <span
                            style={{
                              width: isPlaying
                                ? `${progress}%`
                                : "0%",
                            }}
                          />
                        </div>

                        <div className="audio-episode-wave">
                          {Array.from(
                            { length: 24 },
                            (_, i) => (
                              <i
                                key={i}
                                className={
                                  isPlaying &&
                                  (i / 23) * 100 <=
                                    progress
                                    ? "is-played"
                                    : ""
                                }
                              />
                            )
                          )}
                        </div>

                      </div>

                    </div>

                  </div>

                </article>
              );
            })}

          </section>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default AudioEpisodes;
