import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

const DEFAULT_ADMIN_EMAIL = "admin@almonhna.sa";

export default function ManageUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Then get user roles for each profile
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.user_id);

          return {
            ...profile,
            user_roles: roles || [],
          };
        })
      );

      return usersWithRoles;
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

  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Update profile status to approved
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ status: "approved" })
        .eq("user_id", userId);
      
      if (profileError) throw profileError;

      // Add writer role automatically when approving
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "writer" });
      
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "تم قبول المستخدم وإضافة صلاحية الكاتب",
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

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "rejected" })
        .eq("user_id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "تم رفض المستخدم",
        variant: "destructive",
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

  const isDefaultAdmin = (email: string) => {
    return email === DEFAULT_ADMIN_EMAIL;
  };

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>;
  }

  return (
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
                        {isDefaultAdmin(user.email) && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            محمي
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => approveUserMutation.mutate(user.user_id)}
                            >
                              قبول
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectUserMutation.mutate(user.user_id)}
                            >
                              رفض
                            </Button>
                          </>
                        ) : (
                          <>
                            {!isDefaultAdmin(user.email) && (
                              <>
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
                              </>
                            )}
                            {isDefaultAdmin(user.email) && (
                              <span className="text-sm text-muted-foreground">حساب محمي - لا يمكن تعديل الصلاحيات</span>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => resetPasswordMutation.mutate(user.email)}
                            >
                              <Mail className="w-4 h-4" />
                              إعادة تعيين كلمة المرور
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
