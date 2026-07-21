import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initStorageGuard } from "./lib/storageGuard";

// يجب أن يعمل قبل تحميل عميل Supabase حتى يعترض عمليات setItem الفاشلة
initStorageGuard();

createRoot(document.getElementById("root")!).render(<App />);
