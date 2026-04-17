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
  RotateCcw,
  Target,
  MessageSquare,
  Sparkles,
  Clock3,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type DashboardAction = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  actionLabel: string;
  onClick: () => void;
  badge?: string;
};

type DashboardCard = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  meta: string;
  onClick: () => void;
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const userName = useMemo(() => {
    const email = user?.email || "estudante";
    return email;
  }, [user?.email]);

  const quickActions: DashboardAction[] = [
    {
      title: "Revisar flashcards",
      description: "Retome os cartões do seu contexto atual.",
      icon: RotateCcw,
      actionLabel: "Revisar agora",
      badge: "24 cards",
      onClick: () => navigate("/flashcards"),
    },
    {
      title: "Treino rápido",
      description: "Abra um simulado curto a partir do seu contexto.",
      icon: Target,
      actionLabel: "Treinar",
      badge: "10 questões",
      onClick: () => navigate("/folders"),
    },
    {
      title: "Revisar erros",
      description: "Volte apenas no que você mais precisa reforçar.",
      icon: Sparkles,
      actionLabel: "Revisar",
      badge: "3 pontos",
      onClick: () => navigate("/folders"),
    },
    {
      title: "Retomar chat",
      description: "Continue a conversa do último contexto estudado.",
      icon: MessageSquare,
      actionLabel: "Abrir chat",
      badge: "Último contexto",
      onClick: () => navigate("/folders"),
    },
  ];

  const studyCards: DashboardCard[] = [
    {
      title: "Meus Materiais",
      description:
        "Organize pastas, subpastas e arquivos. Este é o centro do seu estudo.",
      icon: FolderOpen,
      meta: "12 pastas • 48 materiais",
      onClick: () => navigate("/folders"),
    },
    {
      title: "Flashcards",
      description:
        "Revise os cartões criados nas suas pastas e filtre por contexto.",
      icon: Layers3,
      meta: "156 cards • 24 para revisar",
      onClick: () => navigate("/flashcards"),
    },
    {
      title: "Resumos",
      description:
        "Consulte revisões rápidas e resumos organizados pelos seus conteúdos.",
      icon: FileText,
      meta: "8 resumos gerados",
      onClick: () => navigate("/summaries"),
    },
    {
      title: "Desempenho",
      description:
        "Acompanhe sua evolução, simulados e áreas que precisam de reforço.",
      icon: BarChart3,
      meta: "65% de aproveitamento",
      onClick: () => navigate("/folders"),
    },
  ];

  const recentActivities = [
    {
      title: "Você estudou Sistema Nervoso",
      subtitle: "Há 2 horas • 3 materiais acessados",
      accent: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    },
    {
      title: "24 flashcards revisados",
      subtitle: "Ontem • 15 min de revisão",
      accent: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    },
    {
      title: "Simulado de Anatomia concluído",
      subtitle: "Ontem • 72% de acertos",
      accent: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-hero text-hero-foreground">
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
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Bem-vindo de volta,{" "}
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                {userName}
              </span>
            </h1>
            <p className="mt-2 text-lg text-hero-muted">
              Continue seus estudos com foco e organização.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.22em] text-hero-muted">
                  Continuar estudando
                </p>

                <div>
                  <h2 className="text-3xl font-bold">Anatomia &gt; Sistema Nervoso</h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-hero-muted">
                    <Clock3 className="h-4 w-4" />
                    Último acesso há 2 horas
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-hero-muted">Seu progresso neste contexto</span>
                    <span className="font-medium text-hero-foreground">65% concluído</span>
                  </div>
                  <div className="h-2 w-full max-w-xl overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-[260px]">
              <Button
                onClick={() => navigate("/folders")}
                className="h-12 bg-gradient-primary text-base text-primary-foreground hover:opacity-90"
              >
                <Play className="mr-2 h-4 w-4" />
                Continuar estudo
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/folders")}
                className="h-12 border-white/15 bg-white/5 text-hero-foreground hover:bg-white/10"
              >
                Ver detalhes do contexto
              </Button>
            </div>
          </div>
        </motion.section>

        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-hero-muted">
              Ações rápidas
            </p>
            <h3 className="mt-1 text-2xl font-semibold">Comece sem perder tempo</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;

              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ scale: 1.015 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/[0.08] hover:shadow-glow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>

                    {action.badge && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-hero-muted">
                        {action.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="mt-4 text-lg font-semibold">{action.title}</h4>
                  <p className="mt-1 text-sm text-hero-muted">{action.description}</p>

                  <Button
                    variant="outline"
                    className="mt-5 w-full justify-between border-white/15 bg-white/5 text-hero-foreground hover:bg-white/10"
                    onClick={action.onClick}
                  >
                    {action.actionLabel}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-hero-muted">
              Seu espaço de estudo
            </p>
            <h3 className="mt-1 text-2xl font-semibold">
              Ferramentas organizadas sem duplicidade
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {studyCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.button
                  key={card.title}
                  type="button"
                  onClick={card.onClick}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.015 }}
                  className="text-left rounded-3xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/[0.08] hover:shadow-glow"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  <h4 className="mt-5 text-2xl font-semibold">{card.title}</h4>
                  <p className="mt-2 min-h-[72px] text-sm leading-relaxed text-hero-muted">
                    {card.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="text-hero-muted">{card.meta}</span>
                    <ChevronRight className="h-4 w-4 text-hero-muted" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-hero-muted">
                  Atividade recente
                </p>
                <h3 className="mt-1 text-2xl font-semibold">Seu histórico recente</h3>
              </div>

              <Button
                variant="ghost"
                onClick={() => navigate("/folders")}
                className="text-hero-muted hover:bg-white/10 hover:text-hero-foreground"
              >
                Ver tudo
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.title}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="mt-1 text-sm text-hero-muted">{activity.subtitle}</p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${activity.accent}`}
                  >
                    atividade
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-hero-muted">
              Resumo do progresso
            </p>
            <h3 className="mt-1 text-2xl font-semibold">Visão geral</h3>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-hero-muted">Aproveitamento</p>
                <p className="mt-2 text-3xl font-bold">65%</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-hero-muted">Materiais estudados</p>
                <p className="mt-2 text-3xl font-bold">48</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-hero-muted">Flashcards criados</p>
                <p className="mt-2 text-3xl font-bold">156</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-hero-muted">Simulados feitos</p>
                <p className="mt-2 text-3xl font-bold">12</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="mt-6 w-full border-white/15 bg-white/5 text-hero-foreground hover:bg-white/10"
              onClick={() => navigate("/folders")}
            >
              Ver desempenho detalhado
            </Button>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
