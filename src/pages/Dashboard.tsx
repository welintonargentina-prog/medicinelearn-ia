import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  LogOut,
  FolderOpen,
  Layers3,
  FileText,
  BarChart3,
  Play,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const userName = useMemo(() => {
    return user?.email || "estudante";
  }, [user?.email]);

  const cards = [
    {
      title: "Meus Materiais",
      description: "Onde tudo acontece. Pastas, arquivos e estudo contextual.",
      icon: FolderOpen,
      meta: "12 pastas",
      onClick: () => navigate("/folders"),
    },
    {
      title: "Flashcards",
      description: "Revise todos os cartões criados nas suas pastas.",
      icon: Layers3,
      meta: "156 cards",
      onClick: () => navigate("/flashcards"),
    },
    {
      title: "Resumos",
      description: "Revisões rápidas dos seus conteúdos.",
      icon: FileText,
      meta: "8 resumos",
      onClick: () => navigate("/summaries"),
    },
    {
      title: "Desempenho",
      description: "Acompanhe sua evolução e resultados.",
      icon: BarChart3,
      meta: "65%",
      onClick: () => navigate("/folders"),
    },
  ];

  return (
    <div className="min-h-screen bg-hero text-hero-foreground">
      {/* HEADER */}
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
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="text-hero-muted hover:bg-white/10 hover:text-hero-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-10">

        {/* HEADER TEXT */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold">
            Bem-vindo,{" "}
            <span className="text-primary">{userName}</span>
          </h1>
          <p className="text-hero-muted mt-2">
            Continue seus estudos com foco.
          </p>
        </motion.div>

        {/* CONTINUAR ESTUDANDO */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>

              <div>
                <p className="text-xs uppercase text-hero-muted">
                  Continuar estudando
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  Anatomia &gt; Sistema Nervoso
                </h2>

                <p className="flex items-center gap-2 text-sm text-hero-muted mt-1">
                  <Clock3 className="h-4 w-4" />
                  Último acesso há 2 horas
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/folders")}
              className="bg-gradient-primary text-primary-foreground"
            >
              <Play className="mr-2 h-4 w-4" />
              Continuar
            </Button>
          </div>
        </motion.section>

        {/* CARDS PRINCIPAIS */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.button
                key={card.title}
                onClick={card.onClick}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="text-left rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  {card.title}
                </h3>

                <p className="text-sm text-hero-muted mt-2">
                  {card.description}
                </p>

                <div className="mt-4 flex justify-between text-sm text-hero-muted">
                  {card.meta}
                  <ChevronRight className="h-4 w-4" />
                </div>
              </motion.button>
            );
          })}
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
