import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import xIcon from "@/assets/x-icon.png";

interface NewsItem {
  title: string;
  date: string;
  author_linkedin?: string;
  author_twitter?: string;
}

export const TopBar = () => {
  const [currentNews, setCurrentNews] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
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
          ...(articles?.map(a => {
            const author = Array.isArray(a.author) ? a.author[0] : a.author;
            return {
              title: a.title,
              date: new Date(a.created_at).toLocaleDateString("ar-EG", { 
                day: "numeric", 
                month: "long", 
                year: "numeric" 
              }),
              author_linkedin: author?.linkedin_url || undefined,
              author_twitter: author?.twitter_url || undefined,
            };
          }) || []),
          ...(news?.map(n => {
            const author = Array.isArray(n.author) ? n.author[0] : n.author;
            return {
              title: n.title,
              date: new Date(n.created_at).toLocaleDateString("ar-EG", { 
                day: "numeric", 
                month: "long", 
                year: "numeric" 
              }),
              author_linkedin: author?.linkedin_url || undefined,
              author_twitter: author?.twitter_url || undefined,
            };
          }) || [])
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

  // Typewriter effect
  useEffect(() => {
    const text = newsItems[currentNews]?.title || "";
    if (!text) {
      setDisplayedText("");
      return;
    }

    setIsTyping(true);
    setDisplayedText("");
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50);

    return () => {
      clearInterval(typingInterval);
      setIsTyping(false);
    };
  }, [currentNews, newsItems]);

  // Auto-advance news
  useEffect(() => {
    if (newsItems.length === 0 || isTyping) return;
    
    const timer = setInterval(() => {
      setCurrentNews((prev) => (prev + 1) % newsItems.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [newsItems.length, isTyping]);

  const today = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-secondary text-secondary-foreground px-4 border-b border-secondary-foreground/10">
      <div className="container mx-auto flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-4">
  {newsItems[currentNews]?.date && (
    <span className="text-xs opacity-80"> {newsItems[currentNews].date}</span>
  )}

  {/* ⚡︎ فاصل الشريط */}
  <span
    className="bg-yellow-400 text-black font-bold px-3 py-1 text-sm shadow-md"
    aria-hidden="true"
  >
    ⚡︎
  </span>

  {/* عنوان الخبر */}
  <div className="flex items-center justify-center gap-2">
    <span className="whitespace-pre font-medium">{displayedText}</span>
    {isTyping && <span className="animate-pulse">|</span>}
  </div>
</div>

        
        {/* <div className="flex-1 text-center overflow-hidden">
          <div className="animate-in slide-in-from-top duration-500 flex items-center justify-center gap-2">
            <span>{newsItems[currentNews]?.title}</span>        
          </div>
        </div> */}

        <div className="flex items-center gap-3">
           {newsItems[currentNews]?.author_twitter && (
              <a
                href={newsItems[currentNews].author_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                title="X"
              >
                <img src={xIcon} alt="X" className="w-4 h-4" />
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
