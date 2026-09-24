import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

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
      .select("id, number_value, title, description, source")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setItems((data as NumberItem[]) || []));
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <TopBar />
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">الرقم</h1>
        <p className="text-muted-foreground mb-8">كل الأرقام السابقة.</p>
        {items.length === 0 ? (
          <p className="text-muted-foreground">لا توجد أرقام بعد.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((n) => (
              <li key={n.id} className="flex items-start gap-5 rounded-xl border border-border bg-card p-5">
                <span className="text-3xl font-bold text-accent shrink-0 min-w-[4rem]">{n.number_value}</span>
                <div className="min-w-0">
                  <h2 className="font-bold">{n.title}</h2>
                  {n.description && <p className="text-sm text-muted-foreground mt-1">{n.description}</p>}
                  {n.source && <p className="text-xs text-muted-foreground mt-2">المصدر: {n.source}</p>}
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

export default NumbersArchive;
