import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const TopBar = () => {
  const [currentNews, setCurrentNews] = useState(0);
  const [newsItems, setNewsItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchLatestContent = async () => {
      try {
        // Get latest approved articles
        const { data: articles } = await supabase
          .from("articles")
          .select("title")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(3);

        // Get latest approved news
        const { data: news } = await supabase
          .from("news")
          .select("title")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(3);

        const items = [
          ...(articles?.map(a => `مقال جديد: ${a.title}`) || []),
          ...(news?.map(n => `عاجل: ${n.title}`) || [])
        ];

        if (items.length > 0) {
          setNewsItems(items);
        } else {
          setNewsItems(["مرحباً بكم في منحنى - موقع إخباري شامل"]);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setNewsItems(["مرحباً بكم في منحنى - موقع إخباري شامل"]);
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
          <div className="animate-in slide-in-from-top duration-500">
            {newsItems[currentNews]}
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
          <a href="#" className="hover:text-accent transition-colors">
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};