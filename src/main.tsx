import { ThemeProvider } from "@/components/theme-provider";
import "@/index.css";
import AppRouter from "@/routes/app-router.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
