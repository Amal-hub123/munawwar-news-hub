import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Reveal from "@/components/motion/Reveal";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface NumberStory {
  id: string;
  number_value: string;
  title: string;
  description: string | null;
  source: string | null;
  story_date: string | null;
  link_url: string | null;
}

const NumberStory = () => {
  const [items, setItems] = useState<NumberStory[]>([]);

  // useEffect(() => {
  //   supabase
  //     .from("number_stories")
  //     .select(
  //       "id, number_value, title, description, source, story_date, link_url"
  //     )
  //     .eq("is_active", true)
  //     .order("display_order")
  //     .then(({ data }) => {
  //       setItems((data as NumberStory[]) || []);
  //     });
  // }, []);

  useEffect(() => {
  const loadNumberStories = async () => {
    const { data, error } = await supabase
      .from("number_stories")
      .select(
        "id, number_value, title, description, source, story_date, link_url"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Failed to load number_stories:", error);
      return;
    }

    setItems((data as NumberStory[]) || []);
  };

  loadNumberStories();
}, []);

  if (!items.length) return null;

  const item = items[0];

  return (
    <section id="the-number" className="number-section">
      <div className="container mx-auto px-6">

        <Reveal variant="clip">
          <div className="number-section__heading">
            <h2>الرقم</h2>
            <p>رقم واحد، يعني الكثير.</p>
          </div>
        </Reveal>

        <Reveal variant="clip">
          <div className="number-story">

            <div
              key={`figure-${item.id}`}
              className="number-story__figure"
            >
              <span className="number-card__value number-value-enter">
                {item.number_value}
              </span>
            </div>

            <div
              key={`body-${item.id}`}
              className="number-card__body number-body-enter"
            >
              <h3 className="number-card__title">
                {item.title}
              </h3>

              {item.description && (
                <p className="number-card__text">
                  {item.description}
                </p>
              )}

              <div className="number-card__meta">
                {item.source && (
                  <span>المصدر: {item.source}</span>
                )}

                {item.story_date && (
                  <span>
                    {new Date(item.story_date).toLocaleDateString(
                      "ar-SA"
                    )}
                  </span>
                )}
              </div>

              {item.link_url && (
                <Button
                  asChild
                  variant="link"
                  className="number-card__link"
                >
                  <a
                    href={item.link_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    اقرأ ما وراء الرقم
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>

          </div>
        </Reveal>

        <div className="number-section__footer">
          <Link to="/numbers" className="number-card__link inline-flex items-center gap-1">
            كل الأرقام
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <p>يتغيّر كل فترة ليحكي رواية أخرى.</p>
        </div>

        <div className="number-wave" aria-hidden="true">
          <span />
        </div>

      </div>
    </section>
  );
};

export default NumberStory;
