import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  Brain, FileText, BookOpen, Target, FolderOpen,
  LogOut, Clock, Sparkles, Activity,
  BarChart3, Upload, Layers, ClipboardCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const featureCards = [
  {
    icon: FileText,
    title: "Resumos com IA",
    description: "Gere resumos inteligentes a partir dos seus materiais de estudo.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BookOpen,
    title: "Flashcards",
    description: "Crie e revise flashcards para memorização ativa e eficiente.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Target,
    title: "Questões e Simulados",
    description: "Pratique com questões geradas por IA e simulados completos.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: FolderOpen,
    title: "Meus Materiais",
    description: "Organize e acesse todos os seus arquivos e anotações.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const recentActivity = [
  { icon: FileText, text: "Resumo de Fisiologia criado", time: "Há 2 horas" },
  { icon: BookOpen, text: "20 flashcards de Anatomia", time: "Há 5 horas" },
  { icon: Target, text: "Simulado de Clínica Médica iniciado", time: "Há 1 dia" },
  { icon: Upload, text: "Farmacologia - Aula 5.pptx enviado", time: "Há 2 dias" },
];

const stats = [
  { icon: Upload, label: "Materiais enviados", value: "12", color: "text-primary" },
  { icon: Layers, label: "Resumos gerados", value: "8", color: "text-accent" },
  { icon: BookOpen, label: "Flashcards criados", value: "64", color: "text-orange-500" },
  { icon: ClipboardCheck, label: "Simulados realizados", value: "3", color: "text-emerald-500" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Dashboard = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-hero text-hero-foreground">
      {/* Header */}
      <header className="border-b border-white/10 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {t("dash.welcome")},{" "}
            <span className="text-gradient">{user?.email ?? "Estudante"}</span>
          </h1>
          <p className="mt-1 text-hero-muted">Continue seus estudos com inteligência</p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {featureCards.map((card) => (
            <motion.div
              key={card.title}
              variants={item}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.08] hover:shadow-glow"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="mt-1 text-sm text-hero-muted leading-relaxed">{card.description}</p>
              <Button
                size="sm"
                className="mt-5 w-full bg-white/10 text-white hover:bg-white/20 border border-white/10"
                onClick={() => {
                  if (card.title === "Resumos com IA") navigate("/summaries");
                }}
              >
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Abrir
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Recent Activity */}
          <motion.div
            className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Atividade recente</h2>
            </div>
            <div className="space-y-1">
              {recentActivity.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <a.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.text}</p>
                    <p className="text-xs text-hero-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Seu progresso</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                  <s.icon className={`mx-auto h-5 w-5 ${s.color}`} />
                  <p className="mt-2 text-2xl font-bold">{s.value}</p>
                  <p className="mt-0.5 text-xs text-hero-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
