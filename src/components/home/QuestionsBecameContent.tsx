import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Quote } from "lucide-react";

export const QuestionsBecameContent = () => {
  const { data: items } = useQuery({
    queryKey: ["questions-became-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audience_questions")
        .select(`
          id, question, created_at,
          articles:linked_article_id ( id, title, excerpt, cover_image_url, status )
        `)
        .not("linked_article_id", "is", null)
        .order("updated_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data || []).filter((row: any) => row.articles?.status === "approved");
    },
  });

  if (!items || items.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-6">
        <Reveal className="mb-8">
          <h2 className="text-3xl md:text-4xl text-brand">أسئلة أصبحت محتوى</h2>
          <p className="text-muted-foreground mt-2">أسئلة وصلتنا منكم، فصارت مقالات.</p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5">
          {items.map((item: any, i: number) => (
            <Reveal key={item.id} delay={i * 70}>
              <Link
                to={`/articles/${item.articles.id}`}
                className="group h-full flex flex-col rounded-2xl surface-alt border border-border/60 p-6 transition-all duration-500 hover:border-primary hover:-translate-y-1"
              >
                <Quote className="w-6 h-6 text-brand/60 mb-3" />
                <p className="text-lg leading-relaxed text-brand">{item.question}</p>
                <span className="my-5 h-px w-full bg-border" />
                <div className="flex items-center gap-4 mt-auto">
                  <img
                    src={item.articles.cover_image_url}
                    alt=""
                    loading="lazy"
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">صار مقالًا</p>
                    <p className="font-semibold line-clamp-2">{item.articles.title}</p>
                  </div>
                  <ArrowLeft className="w-4 h-4 shrink-0 text-brand transition-transform group-hover:-translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuestionsBecameContent;
