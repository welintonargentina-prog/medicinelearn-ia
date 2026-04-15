import { useParams, Link, useNavigate } from "react-router-dom";
import { mockFolders } from "@/data/mockQuizData";
import { computePerformance } from "@/lib/quizStorage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimuladosTab } from "@/components/simulados/SimuladosTab";
import { PerformancePanel } from "@/components/simulados/PerformancePanel";
import { Button } from "@/components/ui/button";
import {
  Brain,
  LogOut,
  ArrowLeft,
  FileText,
  MessageSquare,
  Target,
  BarChart3,
  FolderOpen,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type SubFolder = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

const folderColors = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

const FolderDetail = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const folder = mockFolders.find((f) => f.id === folderId);
  const performance = useMemo(
    () => (folderId ? computePerformance(folderId) : null),
    [folderId]
  );

  const STORAGE_KEY = `folder_${folderId}_subfolders`;

  const [subFolders, setSubFolders] = useState<SubFolder[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(folderColors[0]);

  useEffect(() => {
    if (!folderId) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SubFolder[];
        setSubFolders(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setSubFolders([]);
      }
    } else {
      setSubFolders([]);
    }
  }, [folderId, STORAGE_KEY]);

  useEffect(() => {
    if (!folderId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subFolders));
  }, [subFolders, folderId, STORAGE_KEY]);

  const createSubFolder = () => {
    if (!newName.trim()) return;

    const newFolder: SubFolder = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: newColor,
      createdAt: new Date().toISOString(),
    };

    setSubFolders((prev) => [newFolder, ...prev]);
    setNewName("");
    setNewColor(folderColors[0]);
    setShowCreate(false);
  };

  const deleteSubFolder = (id: string) => {
    setSubFolders((prev) => prev.filter((folder) => folder.id !== id));
  };

  if (!folder) {
    return (
      <div className="min-h-screen bg-hero text-hero-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold">Pasta não encontrada</p>
          <Link to="/folders" className="text-primary mt-2 inline-block">
            Voltar
          </Link>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="text-hero-muted hover:text-hero-foreground hover:bg-white/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex items-center gap-2 text-sm text-hero-muted">
          <Link
            to="/folders"
            className="hover:text-hero-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Pastas
          </Link>
          <span>/</span>
          <span className="text-hero-foreground">{folder.name}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{folder.icon}</span>
            <div>
              <h1 className="text-2xl font-bold">{folder.name}</h1>
              <p className="text-sm text-hero-muted">{folder.description}</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="materiais" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger
              value="materiais"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-hero-foreground text-hero-muted"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Materiais
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-hero-foreground text-hero-muted"
            >
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat
            </TabsTrigger>
            <TabsTrigger
              value="simulados"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-hero-foreground text-hero-muted"
            >
              <Target className="mr-1.5 h-3.5 w-3.5" /> Simulados
            </TabsTrigger>
            <TabsTrigger
              value="desempenho"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-hero-foreground text-hero-muted"
            >
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Desempenho
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materiais" className="mt-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Subpastas e materiais</h2>
                <p className="text-sm text-hero-muted">
                  Organize esta pasta em subpastas para separar temas, aulas ou módulos.
                </p>
              </div>

              <Button onClick={() => setShowCreate((prev) => !prev)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova subpasta
              </Button>
            </div>

            {showCreate && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <h3 className="text-base font-semibold">Criar subpasta</h3>

                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome da subpasta"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-primary"
                />

                <div>
                  <p className="mb-2 text-sm text-hero-muted">Escolha uma cor</p>
                  <div className="flex flex-wrap gap-3">
                    {folderColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewColor(color)}
                        className={`h-8 w-8 rounded-full border-2 transition ${
                          newColor === color
                            ? "border-white scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={createSubFolder}>Salvar subpasta</Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {subFolders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
                <FolderOpen className="mx-auto mb-3 h-10 w-10 text-hero-muted" />
                <h3 className="text-lg font-semibold">Nenhuma subpasta criada ainda</h3>
                <p className="mt-2 text-sm text-hero-muted">
                  Crie subpastas para organizar melhor os materiais desta pasta.
                </p>
                <p className="mt-1 text-xs text-hero-muted">
                  {folder.materialsCount} materiais na pasta principal
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {subFolders.map((subFolder) => (
                  <div
                    key={subFolder.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: `${subFolder.color}22`,
                          border: `1px solid ${subFolder.color}55`,
                        }}
                      >
                        <FolderOpen
                          className="h-6 w-6"
                          style={{ color: subFolder.color }}
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSubFolder(subFolder.id)}
                        className="text-red-400 hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold">{subFolder.name}</h3>
                    <p className="mt-1 text-sm text-hero-muted">
                      Subpasta criada para organizar conteúdos relacionados.
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-xs text-hero-muted">
                      <FileText className="h-3 w-3" /> 0 materiais
                    </div>

                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-hero-muted">
                      Abertura da subpasta detalhada será o próximo passo.
                    </div>
                  </div>
                ))}
              </div>
            )}
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
