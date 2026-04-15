import { useParams, Link, useNavigate } from "react-router-dom";
import { mockFolders } from "@/data/mockQuizData";
import { computePerformance } from "@/lib/quizStorage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimuladosTab } from "@/components/simulados/SimuladosTab";
import { PerformancePanel } from "@/components/simulados/PerformancePanel";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, ArrowLeft, FileText, MessageSquare, Target, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";
import { useMemo } from "react";

const FolderDetail = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const folder = mockFolders.find((f) => f.id === folderId);
  const performance = useMemo(() => folderId ? computePerformance(folderId) : null, [folderId]);

  if (!folder) {
    return (
      <div className="min-h-screen bg-hero text-hero-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold">Pasta não encontrada</p>
          <Link to="/folders" className="text-primary mt-2 inline-block">Voltar</Link>
        </div>
      </div>
    );
  }

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

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-hero-muted">
          <Link to="/folders" className="hover:text-hero-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Pastas
          </Link>
          <span>/</span>
          <span className="text-hero-foreground">{folder.name}</span>
        </div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{folder.icon}</span>
            <div>
              <h1 className="text-2xl font-bold">{folder.name}</h1>
              <p className="text-sm text-hero-muted">{folder.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="simulados" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="materiais" className="data-[state=active]:bg-white/10 data-[state=active]:text-hero-foreground text-hero-muted">
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Materiais
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-white/10 data-[state=active]:text-hero-foreground text-hero-muted">
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat
            </TabsTrigger>
            <TabsTrigger value="simulados" className="data-[state=active]:bg-white/10 data-[state=active]:text-hero-foreground text-hero-muted">
              <Target className="mr-1.5 h-3.5 w-3.5" /> Simulados
            </TabsTrigger>
            <TabsTrigger value="desempenho" className="data-[state=active]:bg-white/10 data-[state=active]:text-hero-foreground text-hero-muted">
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Desempenho
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materiais" className="mt-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-hero-muted mb-3" />
              <p className="text-hero-muted">Seus materiais aparecerão aqui.</p>
              <p className="text-xs text-hero-muted mt-1">{folder.materialsCount} materiais na pasta</p>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-hero-muted mb-3" />
              <p className="text-hero-muted">Chat com IA sobre esta pasta em breve.</p>
            </div>
          </TabsContent>

          <TabsContent value="simulados" className="mt-6">
            <SimuladosTab folderId={folder.id} />
          </TabsContent>

          <TabsContent value="desempenho" className="mt-6">
            {performance && <PerformancePanel performance={performance} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FolderDetail;
