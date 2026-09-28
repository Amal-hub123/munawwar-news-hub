import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BarChart3, Mic2, PenLine } from "lucide-react";
import { Link } from "react-router-dom";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    photo_url: string | null;
  };
}

const featuredServices = [
  {
    title: "صياغة المحتوى الاقتصادي",
    description: "نحوّل الأفكار والأرقام إلى محتوى اقتصادي واضح، دقيق، ومناسب للجمهور المستهدف.",
    icon: PenLine,
  },
  {
    title: "إعداد المحتوى الاقتصادي",
    description: "نبني محتوى متكاملًا يبدأ من البحث والتحليل، وينتهي بحكاية اقتصادية مؤثرة.",
    icon: BarChart3,
    featured: true,
  },
  {
    title: "التعليق الصوتي",
    description: "نمنح النص الاقتصادي صوتًا احترافيًا يحافظ على وضوح المعلومة وحضورها.",
    icon: Mic2,
  },
];

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select(`
          *,
          profiles (
            id,
            name,
            photo_url
          )
        `)
        .eq("status", "approved")
        .order("approved_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل خدماتنا",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <main className="services-page">
        <section className="services-intro" aria-labelledby="services-title">
          <div className="services-dots" aria-hidden="true" />
          <div className="container mx-auto px-6">
            <div className="services-heading">
              <p className="services-kicker">خبرة تُروى بوضوح</p>
              <h1 id="services-title">خدماتنا</h1>
              <p>نصنع محتوى اقتصاديًا يصل إلى الناس بلغة دقيقة، وحكاية تبقى في الذاكرة.</p>
            </div>

            <div className="services-featured-grid">
              {featuredServices.map((service) => {
                const Icon = service.icon;
                return (
                  <article
                    key={service.title}
                    className={`service-featured-card${service.featured ? " is-featured" : ""}`}
                  >
                    <span className="service-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <h2>{service.title}</h2>
                    <p>{service.description}</p>
                    <span className="service-card-line" aria-hidden="true" />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="services-more" aria-labelledby="more-services-title">
          <div className="container mx-auto px-6">
            <div className="services-more-heading">
              <div>
                <p className="services-kicker">مساحات أوسع للمحتوى</p>
                <h2 id="more-services-title">خدمات أخرى</h2>
              </div>
              <span>{news.length.toLocaleString("ar-SA")} خدمات</span>
            </div>

            {loading ? (
              <div className="services-more-grid" aria-label="جاري تحميل الخدمات">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="service-more-card service-more-skeleton" />
                ))}
              </div>
            ) : news.length === 0 ? (
              <div className="services-empty">
                <p>لا توجد خدمات إضافية منشورة حاليًا.</p>
              </div>
            ) : (
              <div className="services-more-grid">
                {news.map((item) => (
                  <Link key={item.id} to={`/news/${item.id}`} className="service-more-card">
                    <div className="service-more-image">
                      <img src={item.cover_image_url} alt="" loading="lazy" />
                    </div>
                    <div className="service-more-copy">
                      <h3>{item.title}</h3>
                      <p>{item.excerpt}</p>
                      <span className="service-more-link">
                        عرض الخدمة
                        <ArrowLeft aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;
