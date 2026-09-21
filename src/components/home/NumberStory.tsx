import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Reveal from "@/components/motion/Reveal";
import { ArrowLeft } from "lucide-react";

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
  const [active, setActive] = useState(0);

  useEffect(() => {
    supabase
      .from("number_stories")
      .select("id, number_value, title, description, source, story_date, link_url")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setItems((data as NumberStory[]) || []));
  }, []);

  if (!items.length) return null;
  const item = items[Math.min(active, items.length - 1)];

  return (
    <section id="the-number" className="number-section py-14 md:py-20">
      <div className="container mx-auto px-6">
        <Reveal variant="clip">
          <div className="mb-6 md:mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="editorial-kicker">قراءة في رقم</p>
              <h2 className="editorial-heading mt-2">الرقم</h2>
            </div>
            <span className="editorial-index">٠٦</span>
          </div>
        </Reveal>

        <Reveal variant="clip">
          <div className="number-card">
            <div className="number-card__figure">
              <span className="number-card__value">{item.number_value}</span>
            </div>

            <div className="number-card__body">
              <h3 className="number-card__title">{item.title}</h3>
              {item.description && <p className="number-card__text">{item.description}</p>}

              <div className="number-card__meta">
                {item.source && <span>المصدر: {item.source}</span>}
                {item.story_date && (
                  <span>{new Date(item.story_date).toLocaleDateString("ar-SA")}</span>
                )}
              </div>

              {item.link_url && (
                <a className="number-card__link" href={item.link_url} target="_blank" rel="noreferrer">
                  التفاصيل كاملة <ArrowLeft className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </Reveal>

        {items.length > 1 && (
          <div className="number-dots" dir="rtl">
            {items.map((n, i) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={n.title}
                className={`number-dot ${i === active ? "is-active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NumberStory;
