import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";

export const TopBar = () => {
  const [currentNews, setCurrentNews] = useState(0);
  const newsItems = [
    "عاجل: أحدث الأخبار من منحنى",
    "مقال جديد: تحليل شامل للأحداث الراهنة",
    "تقرير خاص: رؤى مميزة من كتابنا",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNews((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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