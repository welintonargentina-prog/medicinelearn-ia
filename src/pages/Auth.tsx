import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

type AuthMode = "login" | "signup" | "recovery";

const Auth = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Conta criada com sucesso. Verifique seu email.");
        setMode("login");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Email de recuperação enviado.");
        setMode("login");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const titles: Record<AuthMode, { heading: string; sub: string }> = {
    login: { heading: "Bem-vindo de volta", sub: "Entre na sua conta para continuar estudando" },
    signup: { heading: "Crie sua conta", sub: "Comece a estudar medicina com inteligência artificial" },
    recovery: { heading: "Recuperar senha", sub: "Enviaremos um link de recuperação para seu email" },
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-hero overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-hero-foreground">MedLearn AI</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border/20 bg-card/5 p-8 backdrop-blur-xl shadow-glow">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-hero-foreground">{titles[mode].heading}</h1>
            <p className="mt-2 text-sm text-hero-muted">{titles[mode].sub}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hero-muted" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-border/20 bg-hero/50 pl-10 text-hero-foreground placeholder:text-hero-muted focus-visible:ring-primary"
              />
            </div>

            {mode !== "recovery" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hero-muted" />
                <Input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 border-border/20 bg-hero/50 pl-10 text-hero-foreground placeholder:text-hero-muted focus-visible:ring-primary"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow hover:opacity-90"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" && "Entrar"}
              {mode === "signup" && "Criar conta"}
              {mode === "recovery" && "Enviar link"}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm">
            {mode === "login" && (
              <>
                <button
                  onClick={() => setMode("recovery")}
                  className="block w-full text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
                <p className="text-hero-muted">
                  Não tem conta?{" "}
                  <button onClick={() => setMode("signup")} className="font-semibold text-primary hover:underline">
                    Criar conta
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p className="text-hero-muted">
                Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="font-semibold text-primary hover:underline">
                  Entrar
                </button>
              </p>
            )}
            {mode === "recovery" && (
              <button
                onClick={() => setMode("login")}
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <ArrowLeft className="h-3 w-3" />
                Voltar para login
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-hero-muted">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
