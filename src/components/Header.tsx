import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import logo from "@/assets/logo.png";

export const Header = () => {
  const [open, setOpen] = useState(false);

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
            <img src={logo} alt="منحنى" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-primary">منحنى</h1>
              <p className="text-xs text-muted-foreground">موقع إخباري شامل</p>
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
            <Button asChild variant="outline">
              <Link to="/auth">تسجيل الدخول</Link>
            </Button>
            <Button asChild>
              <Link to="/register">اكتب معنا</Link>
            </Button>
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
                  <Button asChild variant="outline">
                    <Link to="/auth" onClick={() => setOpen(false)}>
                      تسجيل الدخول
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register" onClick={() => setOpen(false)}>
                      اكتب معنا
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};