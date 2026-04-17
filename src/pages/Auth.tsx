import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type AuthMode = "login" | "signup" | "recovery";

const Auth = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ NOVO
  const [displayName, setDisplayName] = useState("");

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName, // ✅ SALVA NOME
            },
          },
        });

        if (error) throw error;

        toast.success("Conta criada com sucesso. Verifique seu email.");
        setMode("login");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

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
      toast.error(error.message || "Ocorreu um erro.");
    } finally {
      setSubmitting(false);
    }
  };

  const titles: Record<AuthMode, { heading: string; sub: string }> = {
    login: {
      heading: "Bem-vindo de volta",
      sub: "Entre na sua conta",
    },
    signup: {
      heading: "Crie sua conta",
      sub: "Comece a estudar com inteligência",
    },
    recovery: {
      heading: "Recuperar senha",
      sub: "Enviaremos um link por email",
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-hero-foreground">
            MedLearn AI
          </span>
        </Link>

        <div className="rounded-2xl border border-border/20 bg-card/5 p-8 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-hero-foreground">
              {titles[mode].heading}
            </h1>
            <p className="text-sm text-hero-muted mt-2">
              {titles[mode].sub}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-hero-muted" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>

            {/* 👇 NOVO CAMPO NOME */}
            {mode === "signup" && (
              <Input
                type="text"
                placeholder="Como gostaria de ser chamado"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            )}

            {/* SENHA */}
            {mode !== "recovery" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-hero-muted" />
                <Input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10"
                />
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "login" && "Entrar"}
              {mode === "signup" && "Criar conta"}
              {mode === "recovery" && "Enviar link"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {mode === "login" && (
              <>
                <button
                  onClick={() => setMode("recovery")}
                  className="text-primary"
                >
                  Esqueci minha senha
                </button>

                <p className="mt-2">
                  Não tem conta?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-primary font-semibold"
                  >
                    Criar conta
                  </button>
                </p>
              </>
            )}

            {mode === "signup" && (
              <p>
                Já tem conta?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary font-semibold"
                >
                  Entrar
                </button>
              </p>
            )}

            {mode === "recovery" && (
              <button
                onClick={() => setMode("login")}
                className="flex items-center justify-center gap-1 text-primary"
              >
                <ArrowLeft className="h-3 w-3" />
                Voltar
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
