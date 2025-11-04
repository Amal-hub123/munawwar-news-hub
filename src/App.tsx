import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Articles from "./pages/Articles";
import News from "./pages/News";
import Writers from "./pages/Writers";
import ArticleDetail from "./pages/ArticleDetail";
import NewsDetail from "./pages/NewsDetail";
import WriterDetail from "./pages/WriterDetail";
import ProductDetail from "./pages/ProductDetail";
import Products from "./pages/Products";
import AdminDashboard from "./pages/admin/Dashboard";
import ManageArticles from "./pages/admin/ManageArticles";
import ManageNews from "./pages/admin/ManageNews";
import ManageWriters from "./pages/admin/ManageWriters";
import ManageProducts from "./pages/admin/ManageProducts";
import AdminLayout from "./components/AdminLayout";
import WriterLayout from "./components/WriterLayout";
import WriterDashboard from "./pages/writer/Dashboard";
import WriterManageArticles from "./pages/writer/ManageArticles";
import WriterManageNews from "./pages/writer/ManageNews";
import WriterProfile from "./pages/writer/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/writers" element={<Writers />} />
          <Route path="/writers/:id" element={<WriterDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/articles" element={<AdminLayout><ManageArticles /></AdminLayout>} />
          <Route path="/admin/news" element={<AdminLayout><ManageNews /></AdminLayout>} />
          <Route path="/admin/writers" element={<AdminLayout><ManageWriters /></AdminLayout>} />
          <Route path="/admin/products" element={<AdminLayout><ManageProducts /></AdminLayout>} />
          <Route path="/writer" element={<WriterLayout><WriterDashboard /></WriterLayout>} />
          <Route path="/writer/articles" element={<WriterLayout><WriterManageArticles /></WriterLayout>} />
          <Route path="/writer/news" element={<WriterLayout><WriterManageNews /></WriterLayout>} />
          <Route path="/writer/profile" element={<WriterLayout><WriterProfile /></WriterLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
