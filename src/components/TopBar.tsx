import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  title: string;
  date: string;
  author_linkedin?: string;
  author_twitter?: string;
}

export const TopBar = () => {
  const [currentNews, setCurrentNews] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchLatestContent = async () => {
      try {
        // Get latest approved articles with author info
        const { data: articles } = await supabase
          .from("articles")
          .select(`
            title, 
            created_at,
            author:profiles!articles_author_id_fkey(linkedin_url, twitter_url)
          `)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(3);

        // Get latest approved news with author info
        const { data: news } = await supabase
          .from("news")
          .select(`
            title, 
            created_at,
            author:profiles!news_author_id_fkey(linkedin_url, twitter_url)
          `)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(3);

        const items = [
          ...(articles?.map(a => ({
            title: a.title,
            date: new Date(a.created_at).toLocaleDateString("ar-EG", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            }),
            author_linkedin: (a.author as any)?.linkedin_url,
            author_twitter: (a.author as any)?.twitter_url,
          })) || []),
          ...(news?.map(n => ({
            title: n.title,
            date: new Date(n.created_at).toLocaleDateString("ar-EG", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            }),
            author_linkedin: (n.author as any)?.linkedin_url,
            author_twitter: (n.author as any)?.twitter_url,
          })) || [])
        ];

        // Sort all items by date
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (items.length > 0) {
          setNewsItems(items);
        } else {
          setNewsItems([{ title: "مرحباً بكم في منحنى - موقع إخباري شامل", date: "" }]);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setNewsItems([{ title: "مرحباً بكم في منحنى - موقع إخباري شامل", date: "" }]);
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

  const today = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 border-b border-primary-foreground/10">
      <div className="container mx-auto flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-4">
          {newsItems[currentNews]?.date && (
              <span className="text-xs opacity-80">• {newsItems[currentNews].date}</span>
            )} 
           <div className="animate-in slide-in-from-top duration-500 flex items-center justify-center gap-2">
            <span>{newsItems[currentNews]?.title}</span>        
          </div>
        </div>
        
        <div className="flex-1 text-center overflow-hidden">
          <div className="animate-in slide-in-from-top duration-500 flex items-center justify-center gap-2">
            <span>{newsItems[currentNews]?.title}</span>        
          </div>
        </div>

        <div className="flex items-center gap-3">
           {newsItems[currentNews]?.author_twitter && (
              <a
                href={newsItems[currentNews].author_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
                title="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}

           {newsItems[currentNews]?.author_linkedin && (
              <a
                href={newsItems[currentNews].author_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
        </div>
      </div>
    </div>
  );
};
