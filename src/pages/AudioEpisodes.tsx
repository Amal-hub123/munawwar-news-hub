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
  const [playbackRate, setPlaybackRate] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speedMenuRef = useRef<HTMLDivElement | null>(null);

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

  // إغلاق قائمة السرعة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        speedMenuRef.current &&
        !speedMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setSpeedMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const changePlaybackRate = (speed: number) => {
    setPlaybackRate(speed);

    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }

    setSpeedMenuOpen(false);
  };

  const toggle = async (episode: Episode) => {
    const currentAudio = audioRef.current;

    // نفس الحلقة
    if (
      playingId === episode.id &&
      currentAudio
    ) {
      if (currentAudio.paused) {
        try {
          currentAudio.playbackRate = playbackRate;

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

    const audio = new Audio(
      episode.audio_url
    );

    // تطبيق السرعة الحالية على الحلقة الجديدة
    audio.playbackRate = playbackRate;

    audioRef.current = audio;

    setPlayingId(episode.id);
    setProgress(0);

    // تحديث التقدم
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

    // نهاية الحلقة
    audio.onended = () => {
      setPlayingId(null);
      setProgress(0);
    };

    // في حالة وجود خطأ
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

                  {/* =================================
                      الصورة
                  ================================= */}

                  <div className="audio-episode-media">

                    {episode.cover_image_url ? (
                      <img
                        src={
                          episode.cover_image_url
                        }
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


                  {/* =================================
                      المحتوى
                  ================================= */}

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


                    {/* =================================
                        المشغل
                    ================================= */}

                    <div className="audio-episode-controls">

                      {/* Play / Pause */}

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


                      {/* سرعة التشغيل */}

                      <div
                        className="audio-speed-wrapper"
                        ref={
                          isPlaying
                            ? speedMenuRef
                            : undefined
                        }
                      >

                        <button
                          type="button"
                          className="audio-speed"
                          aria-label="سرعة التشغيل"
                          aria-expanded={
                            speedMenuOpen
                          }
                          onClick={(event) => {
                            event.stopPropagation();

                            setSpeedMenuOpen(
                              (open) => !open
                            );
                          }}
                        >
                          {playbackRate}×
                        </button>


                        <div
                          className={`audio-speed-menu ${
                            speedMenuOpen &&
                            isPlaying
                              ? "is-open"
                              : ""
                          }`}
                        >

                          <span className="audio-speed-menu__title">
                            سرعة التشغيل
                          </span>

                          <div className="audio-speed-options">

                            {[
                              0.75,
                              1,
                              1.25,
                              1.5,
                              1.75,
                              2,
                            ].map((speed) => (

                              <button
                                key={speed}
                                type="button"
                                className={`audio-speed-option ${
                                  playbackRate ===
                                  speed
                                    ? "is-active"
                                    : ""
                                }`}
                                onClick={(event) => {
                                  event.stopPropagation();

                                  changePlaybackRate(
                                    speed
                                  );
                                }}
                              >
                                {speed}×
                              </button>

                            ))}

                          </div>

                        </div>

                      </div>


                      {/* Progress */}

                      <div className="audio-episode-progress">

                        <div className="audio-episode-progress-track">

                          <span
                            style={{
                              width:
                                isPlaying
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
                                  (i / 23) *
                                    100 <=
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
