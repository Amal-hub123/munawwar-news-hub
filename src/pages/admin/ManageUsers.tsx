import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, UserCheck, Mail } from "lucide-react";

export default function ManageUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles (role)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return profiles;
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "writer" }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "تم إضافة الصلاحية بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "writer" }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "تم إزالة الصلاحية بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم الإرسال",
        description: "تم إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const hasRole = (user: any, role: string) => {
    return user.user_roles?.some((r: any) => r.role === role);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center">جاري التحميل...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">
            إدارة المستخدمين والصلاحيات
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>قائمة المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الصلاحيات</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "approved" ? "default" : "secondary"
                        }
                      >
                        {user.status === "approved" ? "موافق عليه" : "قيد المراجعة"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {hasRole(user, "admin") && (
                          <Badge variant="destructive">
                            <Shield className="w-3 h-3 ml-1" />
                            مدير
                          </Badge>
                        )}
                        {hasRole(user, "writer") && (
                          <Badge>
                            <UserCheck className="w-3 h-3 ml-1" />
                            كاتب
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!hasRole(user, "admin") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              addRoleMutation.mutate({
                                userId: user.user_id,
                                role: "admin",
                              })
                            }
                          >
                            إضافة مدير
                          </Button>
                        )}
                        {hasRole(user, "admin") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              removeRoleMutation.mutate({
                                userId: user.user_id,
                                role: "admin",
                              })
                            }
                          >
                            إزالة مدير
                          </Button>
                        )}
                        {!hasRole(user, "writer") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              addRoleMutation.mutate({
                                userId: user.user_id,
                                role: "writer",
                              })
                            }
                          >
                            إضافة كاتب
                          </Button>
                        )}
                        {hasRole(user, "writer") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              removeRoleMutation.mutate({
                                userId: user.user_id,
                                role: "writer",
                              })
                            }
                          >
                            إزالة كاتب
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => resetPasswordMutation.mutate(user.email)}
                        >
                          <Mail className="w-4 h-4" />
                          إعادة تعيين كلمة المرور
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
