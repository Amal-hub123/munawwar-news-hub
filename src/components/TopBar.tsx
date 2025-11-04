import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  text: string;
  date: string;
  linkedin?: string;
}

export const TopBar = () => {
  const [currentNews, setCurrentNews] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchLatestContent = async () => {
      try {
        // Get latest approved articles
        const { data: articles } = await supabase
          .from("articles")
          .select("title, created_at, linkedin_url")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(3);

        // Get latest approved news
        const { data: news } = await supabase
          .from("news")
          .select("title, created_at, linkedin_url")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(3);

        const items = [
          ...(articles?.map(a => ({
            text: `مقال جديد: ${a.title}`,
            date: new Date(a.created_at).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" }),
            linkedin: a.linkedin_url
          })) || []),
          ...(news?.map(n => ({
            text: `عاجل: ${n.title}`,
            date: new Date(n.created_at).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" }),
            linkedin: n.linkedin_url
          })) || [])
        ];

        if (items.length > 0) {
          setNewsItems(items);
        } else {
          setNewsItems([{ text: "مرحباً بكم في منحنى - موقع إخباري شامل", date: "", linkedin: "" }]);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setNewsItems([{ text: "مرحباً بكم في منحنى - موقع إخباري شامل", date: "", linkedin: "" }]);
      }
    };

    fetchLatestContent();
  }, []);

  useEffect(() => {
    if (newsItems.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentNews((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [newsItems.length]);

  const today = new Date().toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 border-b border-primary-foreground/10">
      <div className="container mx-auto flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-4">
          <span className="font-semibold">{today}</span>
        </div>
        
        <div className="flex-1 text-center overflow-hidden">
          <div className="animate-in slide-in-from-top duration-500 flex items-center justify-center gap-2">
            <span>{newsItems[currentNews]?.text}</span>
            {newsItems[currentNews]?.date && (
              <span className="text-xs opacity-80">• {newsItems[currentNews].date}</span>
            )}
            {newsItems[currentNews]?.linkedin && (
              <a
                href={newsItems[currentNews].linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-accent transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
          <a href="#" className="hover:text-accent transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="#" className="hover:text-accent transition-colors">
            <Instagram className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};