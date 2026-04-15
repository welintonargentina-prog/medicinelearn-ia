import { mockFolders } from "@/data/mockQuizData";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Brain, LogOut, FolderOpen, FileText, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const Folders = () => {
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
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }} className="text-hero-muted hover:text-hero-foreground hover:bg-white/10">
              <LogOut className="mr-2 h-4 w-4" /><span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Minhas Pastas</h1>
        </div>

        <motion.div className="grid gap-4 sm:grid-cols-2" variants={container} initial="hidden" animate="show">
          {mockFolders.map((f) => (
            <motion.div key={f.id} variants={item}>
              <Link to={`/folders/${f.id}`} className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:shadow-glow">
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{f.icon}</span>
                  <ChevronRight className="h-5 w-5 text-hero-muted" />
                </div>
                <h3 className="mt-3 text-lg font-semibold">{f.name}</h3>
                <p className="mt-1 text-sm text-hero-muted leading-relaxed">{f.description}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-hero-muted">
                  <FileText className="h-3 w-3" /> {f.materialsCount} materiais
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Folders;
