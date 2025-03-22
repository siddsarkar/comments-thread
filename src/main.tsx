import { ThemeProvider } from "@/components/theme-provider";
import "@/index.css";
import AppRouter from "@/routes/app-router.tsx";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <AppRouter />
  </ThemeProvider>
  // </StrictMode>
);
