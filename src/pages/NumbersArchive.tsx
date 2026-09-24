import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Hash } from "lucide-react";

interface NumberItem {
  id: string;
  number_value: string;
  title: string;
  description: string | null;
  source: string | null;
}

const NumbersArchive = () => {
  const [items, setItems] = useState<NumberItem[]>([]);

  useEffect(() => {
    supabase
      .from("number_stories")
      .select(
        "id, number_value, title, description, source"
      )
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        setItems(
          (data as NumberItem[]) || []
        );
      });
  }, []);

  return (
    <div
      className="numbers-archive-page"
      dir="rtl"
    >
      <TopBar />
      <Header />

      <main className="numbers-archive container mx-auto px-8 py-12">

        {/* =========================================
            INTRO
        ========================================== */}

        <section className="numbers-intro">

          <div className="numbers-intro-kicker">
            <Hash />
            <span>الرقم</span>
          </div>

          <h1>
            أرقام صغيرة،
            <br />
            <em>تحكي حكايات كبيرة.</em>
          </h1>

          <p>
            مجموعة من الأرقام التي مرّت في
            المُنحنى، وكل رقم منها يخفي خلفه
            قصة تستحق أن تُروى.
          </p>

        </section>


        {/* =========================================
            CONTENT
        ========================================== */}

        {items.length === 0 ? (

          <section className="numbers-empty">
            <span>—</span>
            <p>لا توجد أرقام بعد.</p>
          </section>

        ) : (

          <section className="numbers-list">

            <div
              className="numbers-list-line"
              aria-hidden="true"
            />

            {items.map((item, index) => (

              <article
                key={item.id}
                className="number-story"
                style={{
                  "--number-index": index,
                } as React.CSSProperties}
              >

                {/* الرقم */}

                <div className="number-story-value">

            

                  <strong>
                    {item.number_value}
                  </strong>

                </div>


              {/* القصة */}

                <div className="number-story-content">

                  <div className="number-story-top">

                    {item.source && (
                      <small>
                        المصدر: {item.source}
                      </small>
                    )}

                  </div>

                  <h2>
                    {item.title}
                  </h2>

                  {item.description && (
                    <p>
                      {item.description}
                    </p>
                  )}

          
                </div>

              </article>

            ))}

          </section>

        )}

      </main>

      <Footer />
    </div>
  );
};

export default NumbersArchive;
