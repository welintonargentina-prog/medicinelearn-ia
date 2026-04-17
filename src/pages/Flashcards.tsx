import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  LogOut,
  Layers3,
  ChevronRight,
  FolderOpen,
  RotateCcw,
  BookOpenText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";

const mockDecks = [
  {
    id: "1",
    title: "Anatomia",
    subtitle: "Sistema Nervoso",
    count: 42,
    due: 12,
  },
  {
    id: "2",
    title: "Fisiologia",
    subtitle: "Sistema Endócrino",
    count: 30,
    due: 8,
  },
  {
    id: "3",
    title: "Farmacologia",
    subtitle: "Antibióticos",
    count: 18,
    due: 5,
  },
];

const Flashcards = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

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

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs uppercase tracking-[0.22em] text-hero-muted">
            Flashcards
          </p>
          <h1 className="mt-2 text-4xl font-bold">Biblioteca global de flashcards</h1>
          <p className="mt-2 max-w-2xl text-hero-muted">
            Aqui você revisa todos os flashcards criados nas suas pastas e subpastas.
          </p>
        </motion.div>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-hero-muted">Total de cards</p>
            <p className="mt-2 text-3xl font-bold">90</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-hero-muted">Para revisar hoje</p>
            <p className="mt-2 text-3xl font-bold">25</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-hero-muted">Contextos ativos</p>
            <p className="mt-2 text-3xl font-bold">3</p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Revisar por contexto</h2>
              <p className="mt-1 text-sm text-hero-muted">
                Escolha uma pasta para revisar apenas os flashcards daquele contexto.
              </p>
            </div>

            <Button className="bg-gradient-primary text-primary-foreground">
              <RotateCcw className="mr-2 h-4 w-4" />
              Revisar todos
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mockDecks.map((deck) => (
              <button
                key={deck.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mt-4 text-xl font-semibold">{deck.title}</h3>
                <p className="mt-1 text-sm text-hero-muted">{deck.subtitle}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-hero-muted">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {deck.count} cards
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {deck.due} para revisar
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm text-hero-muted">
                  <span>Abrir revisão</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
          <BookOpenText className="mx-auto mb-4 h-10 w-10 text-hero-muted" />
          <h3 className="text-xl font-semibold">Pronto para crescer</h3>
          <p className="mt-2 text-sm text-hero-muted">
            Depois, esta página pode incluir filtros por pasta, revisão por erros,
            repetição espaçada e geração por IA.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Flashcards;
