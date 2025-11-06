import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const Setup = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "exists">("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const createAdmin = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-default-admin`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          if (data.message.includes("already exists")) {
            setStatus("exists");
            setMessage("المستخدم الإداري موجود مسبقاً");
          } else {
            setStatus("success");
            setMessage("تم إنشاء المستخدم الإداري بنجاح");
          }
        } else {
          setStatus("error");
          setMessage(data.error || "حدث خطأ أثناء إنشاء المستخدم");
        }
      } catch (error) {
        setStatus("error");
        setMessage("حدث خطأ في الاتصال");
      }
    };

    createAdmin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">إعداد النظام</CardTitle>
          <CardDescription className="text-center">
            إنشاء المستخدم الإداري الافتراضي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-center">جاري إنشاء المستخدم الإداري...</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <div className="text-center space-y-2">
                  <p className="font-semibold">{message}</p>
                  <div className="bg-muted p-4 rounded-lg space-y-1 text-sm">
                    <p>
                      <strong>البريد الإلكتروني:</strong> admin@almonhna.sa
                    </p>
                    <p>
                      <strong>كلمة المرور:</strong> Admin@123
                    </p>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    يمكنك تغيير كلمة المرور من صفحة الإعدادات
                  </p>
                </div>
                <Button onClick={() => navigate("/auth")} className="w-full">
                  الذهاب لصفحة تسجيل الدخول
                </Button>
              </>
            )}

            {status === "exists" && (
              <>
                <CheckCircle className="h-12 w-12 text-blue-500" />
                <p className="text-center">{message}</p>
                <Button onClick={() => navigate("/auth")} className="w-full">
                  الذهاب لصفحة تسجيل الدخول
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 text-destructive" />
                <p className="text-center text-destructive">{message}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  إعادة المحاولة
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
