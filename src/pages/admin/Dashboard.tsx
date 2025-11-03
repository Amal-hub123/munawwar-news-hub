import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FileText, Newspaper, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [articlesCount, newsCount, writersCount, pendingArticles, pendingNews, pendingWriters] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("news").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("news").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      return {
        articles: articlesCount.count || 0,
        news: newsCount.count || 0,
        writers: writersCount.count || 0,
        pendingArticles: pendingArticles.count || 0,
        pendingNews: pendingNews.count || 0,
        pendingWriters: pendingWriters.count || 0,
      };
    },
  });

  const statCards = [
    { title: "المقالات", count: stats?.articles, icon: FileText, color: "text-blue-500", link: "/admin/articles" },
    { title: "الأخبار", count: stats?.news, icon: Newspaper, color: "text-green-500", link: "/admin/news" },
    { title: "الكتاب", count: stats?.writers, icon: Users, color: "text-purple-500", link: "/admin/writers" },
    { title: "مقالات معلقة", count: stats?.pendingArticles, icon: Clock, color: "text-orange-500", link: "/admin/articles?status=pending" },
    { title: "أخبار معلقة", count: stats?.pendingNews, icon: Clock, color: "text-orange-500", link: "/admin/news?status=pending" },
    { title: "كتاب معلقين", count: stats?.pendingWriters, icon: Clock, color: "text-red-500", link: "/admin/writers?status=pending" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.link}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.count}</p>
                  </div>
                  <Icon className={`w-12 h-12 ${stat.color}`} />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;