import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "تم تسجيل الخروج بنجاح",
    });
    navigate("/");
  };

  const navItems = [
    { label: "الرئيسية", href: "/" },
    { label: "الأخبار", href: "/news" },
    { label: "المقالات", href: "/articles" },
    { label: "الكتّاب", href: "/writers" },
    { label: "منتجاتنا", href: "/products" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="منحنى" className="h-14 w-14 rounded-full object-cover border-2 border-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">منحنى</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button onClick={handleSignOut} variant="outline">
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link to="/auth">تسجيل الدخول</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 mt-4">
                  {user ? (
                    <>
                      <span className="text-sm text-muted-foreground px-3">{user.email}</span>
                      <Button onClick={() => { handleSignOut(); setOpen(false); }} variant="outline">
                        تسجيل الخروج
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline">
                        <Link to="/auth" onClick={() => setOpen(false)}>
                          تسجيل الدخول
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};