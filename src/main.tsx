import { ThemeProvider } from "@/components/theme-provider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import AppRouter from "@/routes/app-router.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AppRouter />
    </ThemeProvider>
  </StrictMode>
);
