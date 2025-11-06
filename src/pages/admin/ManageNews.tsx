import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, Link } from "react-router-dom";

const ManageNews = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const { data: news, isLoading } = useQuery({
    queryKey: ["admin-news", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("news")
        .select(`
          *,
          profiles:author_id (name)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as "approved" | "pending" | "rejected");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "pending" | "rejected" }) => {
      const { error } = await supabase
        .from("news")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث حالة الخبر",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الخبر",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الخبر",
      });
    },
  });

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">إدارة الأخبار</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news?.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex gap-4">
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="w-32 h-32 object-cover rounded"
              />
              
              <div className="flex-1">
                <Link
                  to={`/news/${item.id}`}
                  className="font-bold text-lg hover:text-primary"
                >
                  {item.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">{item.excerpt}</p>
                <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                  <span>الكاتب: {item.profiles.name}</span>
                  <span>
                    الحالة:{" "}
                    <span
                      className={`font-semibold ${
                        item.status === "approved"
                          ? "text-green-500"
                          : item.status === "rejected"
                          ? "text-red-500"
                          : "text-orange-500"
                      }`}
                    >
                      {item.status === "approved"
                        ? "مقبول"
                        : item.status === "rejected"
                        ? "مرفوض"
                        : "معلق"}
                    </span>
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link to={`/admin/news/preview/${item.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 ml-2" />
                      
                    </Button>
                  </Link>
                  {item.status === "pending" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          updateStatusMutation.mutate({ id: item.id, status: "approved" })
                        }
                      >
                        <Check className="w-4 h-4 ml-2" />
                        قبول
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          updateStatusMutation.mutate({ id: item.id, status: "rejected" })
                        }
                      >
                        <X className="w-4 h-4 ml-2" />
                        رفض
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    <Trash2 className="w-4 h-4 ml-2" />
                    
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {news?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">لا توجد نتائج</p>
        )}
      </div>
    </div>
  );
};

export default ManageNews;
