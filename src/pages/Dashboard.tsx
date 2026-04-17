import { useMemo, useState } from "react";
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
  Edit,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const userName = useMemo(() => {
    return (
      user?.user_metadata?.display_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email ||
      "estudante"
    );
  }, [user]);

  const handleSaveName = async () => {
    if (!newName) return;

    await supabase.auth.updateUser({
      data: {
        display_name: newName,
      },
    });

    window.location.reload(); // atualiza para mostrar novo nome
  };

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

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          
          {/* TÍTULO COM EDITAR */}
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">
              Bem-vindo, <span className="text-primary">{userName}</span>
            </h1>

            <button
              onClick={() => setEditing(!editing)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>

          {/* EDITAR NOME */}
          {editing && (
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Novo nome"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              <Button onClick={handleSaveName}>
                Salvar
              </Button>
            </div>
          )}

          <p className="mt-2 text-hero-muted">
            Continue seus estudos com foco.
          </p>
        </motion.div>

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

                <h2 className="mt-1 text-2xl font-bold">
                  Anatomia &gt; Sistema Nervoso
                </h2>

                <p className="mt-1 flex items-center gap-2 text-sm text-hero-muted">
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
                className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left transition hover:bg-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mt-4 text-xl font-semibold">{card.title}</h3>

                <p className="mt-2 text-sm text-hero-muted">
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
