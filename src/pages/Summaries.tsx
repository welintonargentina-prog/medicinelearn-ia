import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, FileText, LogOut, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Summary {
  titulo: string;
  topicos: string[];
  resumo: string;
}

const Summaries = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleGenerate = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setSummary(null);

    // Simulated AI response
    await new Promise((r) => setTimeout(r, 2000));

    setSummary({
      titulo: "Resumo: Conteúdo de Estudo",
      topicos: [
        "Conceitos fundamentais apresentados no texto",
        "Relações entre os tópicos principais",
        "Aplicações práticas e exemplos citados",
        "Pontos-chave para revisão",
      ],
      resumo:
        "O conteúdo aborda os conceitos fundamentais do tema estudado, destacando as relações entre os principais tópicos e suas aplicações práticas. Os pontos mais relevantes incluem definições essenciais, mecanismos de ação e correlações clínicas importantes para a prática médica. Recomenda-se revisão periódica dos tópicos destacados para consolidação do aprendizado.",
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-hero text-hero-foreground">
      {/* Header */}
      <header className="border-b border-white/10 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">MedLearn AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-hero-muted hover:text-hero-foreground hover:bg-white/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-8">
       <div className="flex items-center gap-2 mb-6">
  <button
    onClick={() => navigate("/dashboard")}
    className="flex items-center gap-2 text-hero-muted hover:text-white transition"
  >
    <ArrowLeft className="h-5 w-5" />
    <span>Voltar</span>
  </button>
</div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gerar Resumo com IA</h1>
          </div>
          <p className="text-hero-muted">Cole seu conteúdo de estudo e gere um resumo estruturado com inteligência artificial.</p>
        </motion.div>

        {/* Input */}
        <motion.div
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Textarea
            placeholder="Cole aqui o conteúdo que deseja resumir..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[180px] bg-white/5 border-white/10 text-hero-foreground placeholder:text-hero-muted resize-none focus-visible:ring-primary/50"
          />
          <Button
            onClick={handleGenerate}
            disabled={loading || !content.trim()}
            className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando resumo...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Gerar resumo
              </>
            )}
          </Button>
        </motion.div>

        {/* Summary output */}
        {summary && (
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h2 className="text-xl font-bold text-primary">{summary.titulo}</h2>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-hero-muted mb-3">Tópicos Principais</h3>
              <ul className="space-y-2">
                {summary.topicos.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-hero-muted mb-3">Resumo Final</h3>
              <p className="text-sm leading-relaxed text-hero-foreground/90">{summary.resumo}</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Summaries;
