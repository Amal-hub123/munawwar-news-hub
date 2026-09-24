import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

interface Item {
  id: string;
  number_value: string;
  title: string;
  description: string | null;
  source: string | null;
  story_date: string | null;
  link_url: string | null;
}

const NumberStories = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    supabase
      .from("number_stories")
      .select("id, number_value, title, description, source, story_date, link_url")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as Item[]) || []));
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <TopBar />
      <Header />
      <main className="editorial-home">
        <section className="number-section">
          <div className="container mx-auto px-6">
            <div className="number-section__heading">
              <h2>كل الأرقام</h2>
              <p>رقم واحد، يعني الكثير.</p>
            </div>
            {!items.length && <p className="text-muted-foreground text-center py-10">لا توجد أرقام بعد.</p>}
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="number-story">
                  <div className="number-story__figure">
                    <span className="number-card__value">{item.number_value}</span>
                  </div>
                  <div className="number-card__body">
                    <h3 className="number-card__title">{item.title}</h3>
                    {item.description && <p className="number-card__text">{item.description}</p>}
                    <div className="number-card__meta">
                      {item.source && <span>المصدر: {item.source}</span>}
                      {item.story_date && <span>{new Date(item.story_date).toLocaleDateString("ar-SA")}</span>}
                    </div>
                    {item.link_url && (
                      <a href={item.link_url} target="_blank" rel="noreferrer" className="number-card__link inline-flex items-center gap-1">
                        اقرأ ما وراء الرقم <ArrowLeft className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NumberStories;
