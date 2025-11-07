import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

const ManageWriters = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const { data: writers, isLoading } = useQuery({
    queryKey: ["admin-writers", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*, user_id")
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
    mutationFn: async ({ id, status, email, userId, name }: { id: string; status: "approved" | "pending" | "rejected"; email: string; userId: string; name: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      if (status === "approved") {
        // Add writer role automatically upon approval
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: userId,
            role: "writer",
          });

        if (roleError && roleError.code !== "23505") { // Ignore duplicate key error
          throw roleError;
        }

        // Send welcome email
        try {
          const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
            body: { email, name },
          });

          if (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }
        } catch (emailErr) {
          console.error('Error sending welcome email:', emailErr);
        }
      }

      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-writers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث حالة الكاتب",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الكاتب",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">إدارة الكتاب</h1>

      <div className="space-y-4">
        {writers?.map((writer) => (
          <Card key={writer.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {writer.photo_url ? (
                  <img
                    src={writer.photo_url}
                    alt={writer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{writer.name}</h3>
                  <p className="text-sm text-muted-foreground">{writer.email}</p>
                  {writer.bio && (
                    <p className="text-sm text-muted-foreground mt-1">{writer.bio}</p>
                  )}
                  <p className="text-sm mt-1">
                    الحالة:{" "}
                    <span
                      className={`font-semibold ${
                        writer.status === "approved"
                          ? "text-green-500"
                          : writer.status === "rejected"
                          ? "text-red-500"
                          : "text-orange-500"
                      }`}
                    >
                      {writer.status === "approved"
                        ? "مقبول"
                        : writer.status === "rejected"
                        ? "مرفوض"
                        : "معلق"}
                    </span>
                  </p>
                </div>
              </div>

              {writer.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: writer.id,
                        status: "approved",
                        email: writer.email,
                        userId: writer.user_id,
                        name: writer.name,
                      })
                    }
                  >
                    <Check className="w-4 h-4 ml-2" />
                    قبول
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: writer.id,
                        status: "rejected",
                        email: writer.email,
                        userId: writer.user_id,
                        name: writer.name,
                      })
                    }
                  >
                    <X className="w-4 h-4 ml-2" />
                    رفض
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {writers?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">لا توجد نتائج</p>
        )}
      </div>
    </div>
  );
};

export default ManageWriters;