import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const APP_PASSWORD = "01112001";
const ACCESS_KEY = "medlearn_private_access";

function PasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(
    localStorage.getItem(ACCESS_KEY) === "true"
  );
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (password === APP_PASSWORD) {
      localStorage.setItem(ACCESS_KEY, "true");
      setAuthorized(true);
      setError("");
    } else {
      setError("Senha incorreta");
    }
  };

  if (!authorized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#0b1120",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            color: "#ffffff",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Acesso privado
          </h1>

          <p
            style={{
              marginTop: "12px",
              marginBottom: "24px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "15px",
            }}
          >
            Digite a senha para entrar na plataforma
          </p>

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid #374151",
              background: "#0f172a",
              color: "#ffffff",
              outline: "none",
              marginBottom: "14px",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={handleSubmit}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Entrar
          </button>

          {error && (
            <p
              style={{
                marginTop: "14px",
                textAlign: "center",
                color: "#f87171",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const App = () => (
  <PasswordGate>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <NotFound />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </PasswordGate>
);

export default App;
