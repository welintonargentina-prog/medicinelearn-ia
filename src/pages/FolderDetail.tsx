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
  Youtube,
  NotebookPen,
  CheckCircle2,
  Send,
  Layers3,
  BookOpenText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type FolderItem = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  materialsCount: number;
  createdAt: string;
};

type MaterialType = "note" | "youtube";

type MaterialItem = {
  id: string;
  title: string;
  type: MaterialType;
  content?: string;
  url?: string;
  createdAt: string;
  sourceType?: "pdf" | "video" | "note" | "chat" | "file";
  sourceTitle?: string;
  sourceId?: string;
  pageReference?: string;
  videoTimestamp?: string;
  materialId?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type QuizHistoryItem = {
  id: string;
  title: string;
  createdAt: string;
  type: string;
  questionCount: number;
};

type FlashcardItem = {
  id: string;
  front: string;
  back: string;
  createdAt: string;
};

type SubFolder = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  materials: MaterialItem[];
};

type StudyContextData = {
  chatHistory: ChatMessage[];
  quizHistory: QuizHistoryItem[];
  flashcards: FlashcardItem[];
};

const FOLDERS_STORAGE_KEY = "medlearn_folders";

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

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const createEmptyContext = (): StudyContextData => ({
  chatHistory: [],
  quizHistory: [],
  flashcards: [],
});

const FolderDetail = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [storedFolders, setStoredFolders] = useState<FolderItem[]>([]);
  const SUBFOLDERS_STORAGE_KEY = `folder_${folderId}_subfolders`;

  const [subFolders, setSubFolders] = useState<SubFolder[]>([]);
  const [selectedSubFolderId, setSelectedSubFolderId] = useState<string | null>(null);

  const [showCreateSubFolder, setShowCreateSubFolder] = useState(false);
  const [newSubFolderName, setNewSubFolderName] = useState("");
  const [newSubFolderColor, setNewSubFolderColor] = useState(folderColors[0]);

  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [materialType, setMaterialType] = useState<MaterialType>("note");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialContent, setMaterialContent] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);

  const [showFlashcardForm, setShowFlashcardForm] = useState(false);
  const [flashFront, setFlashFront] = useState("");
  const [flashBack, setFlashBack] = useState("");

  useEffect(() => {
    const savedFolders = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (savedFolders) {
      try {
        setStoredFolders(JSON.parse(savedFolders));
      } catch {
        setStoredFolders([]);
      }
    }
  }, []);

  const folder =
    storedFolders.find((f) => f.id === folderId) ||
    mockFolders.find((f) => f.id === folderId);

  useEffect(() => {
    if (!folderId) return;

    const saved = localStorage.getItem(SUBFOLDERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SubFolder[];
        setSubFolders(parsed);
        if (parsed.length > 0) {
          setSelectedSubFolderId((prev) => prev ?? parsed[0].id);
        }
      } catch {
        localStorage.removeItem(SUBFOLDERS_STORAGE_KEY);
        setSubFolders([]);
      }
    } else {
      setSubFolders([]);
    }
  }, [folderId, SUBFOLDERS_STORAGE_KEY]);

  useEffect(() => {
    if (!folderId) return;
    localStorage.setItem(SUBFOLDERS_STORAGE_KEY, JSON.stringify(subFolders));
  }, [subFolders, folderId, SUBFOLDERS_STORAGE_KEY]);

  const selectedSubFolder =
    subFolders.find((subFolder) => subFolder.id === selectedSubFolderId) || null;

  const activeContextId = selectedSubFolder
    ? `folder:${folderId}/subfolder:${selectedSubFolder.id}`
    : folderId
      ? `folder:${folderId}`
      : "";

  const CONTEXT_STORAGE_KEY = `study_context_${activeContextId}`;

  useEffect(() => {
    if (!activeContextId) return;

    const saved = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StudyContextData;
        setChatHistory(parsed.chatHistory || []);
        setQuizHistory(parsed.quizHistory || []);
        setFlashcards(parsed.flashcards || []);
      } catch {
        const empty = createEmptyContext();
        setChatHistory(empty.chatHistory);
        setQuizHistory(empty.quizHistory);
        setFlashcards(empty.flashcards);
      }
    } else {
      const empty = createEmptyContext();
      setChatHistory(empty.chatHistory);
      setQuizHistory(empty.quizHistory);
      setFlashcards(empty.flashcards);
    }
  }, [CONTEXT_STORAGE_KEY, activeContextId]);

  useEffect(() => {
    if (!activeContextId) return;

    const data: StudyContextData = {
      chatHistory,
      quizHistory,
      flashcards,
    };

    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(data));
  }, [chatHistory, quizHistory, flashcards, CONTEXT_STORAGE_KEY, activeContextId]);

  const performance = useMemo(
    () => (activeContextId ? computePerformance(activeContextId) : null),
    [activeContextId]
  );

  const createSubFolder = () => {
    if (!newSubFolderName.trim()) return;

    const newFolder: SubFolder = {
      id: crypto.randomUUID(),
      name: newSubFolderName.trim(),
      color: newSubFolderColor,
      createdAt: new Date().toISOString(),
      materials: [],
    };

    setSubFolders((prev) => [newFolder, ...prev]);
    setSelectedSubFolderId(newFolder.id);
    setNewSubFolderName("");
    setNewSubFolderColor(folderColors[0]);
    setShowCreateSubFolder(false);
  };

  const deleteSubFolder = (id: string) => {
    const updated = subFolders.filter((subFolder) => subFolder.id !== id);
    setSubFolders(updated);

    const subContextKey = `study_context_folder:${folderId}/subfolder:${id}`;
    localStorage.removeItem(subContextKey);

    if (selectedSubFolderId === id) {
      setSelectedSubFolderId(updated[0]?.id || null);
    }
  };

  const addMaterial = () => {
    if (!selectedSubFolder) return;
    if (!materialTitle.trim()) return;
    if (materialType === "note" && !materialContent.trim()) return;
    if (materialType === "youtube" && !materialUrl.trim()) return;

    const newMaterial: MaterialItem = {
      id: crypto.randomUUID(),
      title: materialTitle.trim(),
      type: materialType,
      content: materialType === "note" ? materialContent.trim() : undefined,
      url: materialType === "youtube" ? materialUrl.trim() : undefined,
      createdAt: new Date().toISOString(),
      sourceType: materialType === "youtube" ? "video" : "note",
      sourceTitle: materialTitle.trim(),
      sourceId: crypto.randomUUID(),
      pageReference: "",
      videoTimestamp: "",
      materialId: crypto.randomUUID(),
    };

    setSubFolders((prev) =>
      prev.map((subFolder) =>
        subFolder.id === selectedSubFolder.id
          ? {
              ...subFolder,
              materials: [newMaterial, ...subFolder.materials],
            }
          : subFolder
      )
    );

    setMaterialTitle("");
    setMaterialContent("");
    setMaterialUrl("");
    setMaterialType("note");
    setShowAddMaterial(false);
  };

  const deleteMaterial = (materialId: string) => {
    if (!selectedSubFolder) return;

    setSubFolders((prev) =>
      prev.map((subFolder) =>
        subFolder.id === selectedSubFolder.id
          ? {
              ...subFolder,
              materials: subFolder.materials.filter((m) => m.id !== materialId),
            }
          : subFolder
      )
    );
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: chatInput.trim(),
      createdAt: new Date().toISOString(),
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: selectedSubFolder
        ? `Resposta simulada da IA para a subpasta "${selectedSubFolder.name}". No futuro, a IA usará apenas os materiais desse contexto e poderá citar origem, página ou minuto do vídeo.`
        : `Resposta simulada da IA para a pasta principal "${folder?.name}". No futuro, a IA usará apenas os materiais desse contexto e poderá citar origem, página ou minuto do vídeo.`,
      createdAt: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, userMessage, assistantMessage]);
    setChatInput("");
  };

  const createMockQuiz = () => {
    const newQuiz: QuizHistoryItem = {
      id: crypto.randomUUID(),
      title: selectedSubFolder
        ? `Simulado - ${selectedSubFolder.name}`
        : `Simulado - ${folder?.name}`,
      createdAt: new Date().toISOString(),
      type: "Simulado padrão",
      questionCount: 10,
    };

    setQuizHistory((prev) => [newQuiz, ...prev]);
  };

  const deleteQuiz = (quizId: string) => {
    setQuizHistory((prev) => prev.filter((quiz) => quiz.id !== quizId));
  };

  const createFlashcard = () => {
    if (!flashFront.trim() || !flashBack.trim()) return;

    const newCard: FlashcardItem = {
      id: crypto.randomUUID(),
      front: flashFront.trim(),
      back: flashBack.trim(),
      createdAt: new Date().toISOString(),
    };

    setFlashcards((prev) => [newCard, ...prev]);
    setFlashFront("");
    setFlashBack("");
    setShowFlashcardForm(false);
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards((prev) => prev.filter((card) => card.id !== id));
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex items-center gap-2 text-sm text-hero-muted">
          <Link
            to="/folders"
            className="hover:text-hero-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Pastas
          </Link>
          <span>/</span>
          <span className="text-hero-foreground">{folder.name}</span>
          {selectedSubFolder && (
            <>
              <span>/</span>
              <span className="text-hero-foreground">{selectedSubFolder.name}</span>
            </>
          )}
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
          <TabsList className="bg-white/5 border border-white/10 flex flex-wrap h-auto">
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
              value="flashcards"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-hero-foreground text-hero-muted"
            >
              <Layers3 className="mr-1.5 h-3.5 w-3.5" /> Flashcards
            </TabsTrigger>
            <TabsTrigger
              value="desempenho"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-hero-foreground text-hero-muted"
            >
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Desempenho
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materiais" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Subpastas</h2>
                      <p className="text-sm text-hero-muted">
                        Organize os conteúdos por assunto.
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setShowCreateSubFolder((prev) => !prev)}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Nova
                    </Button>
                  </div>

                  {showCreateSubFolder && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                      <input
                        value={newSubFolderName}
                        onChange={(e) => setNewSubFolderName(e.target.value)}
                        placeholder="Nome da subpasta"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-primary"
                      />

                      <div>
                        <p className="mb-2 text-sm text-hero-muted">Cor</p>
                        <div className="flex flex-wrap gap-2">
                          {folderColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNewSubFolderColor(color)}
                              className={`h-7 w-7 rounded-full border-2 transition ${
                                newSubFolderColor === color
                                  ? "border-white scale-110"
                                  : "border-transparent"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={createSubFolder}>
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowCreateSubFolder(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {subFolders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-hero-muted">
                      Nenhuma subpasta criada ainda
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subFolders.map((subFolder) => {
                        const isSelected = selectedSubFolderId === subFolder.id;

                        return (
                          <button
                            key={subFolder.id}
                            onClick={() => setSelectedSubFolderId(subFolder.id)}
                            className={`w-full rounded-xl border p-4 text-left transition ${
                              isSelected
                                ? "border-white/25 bg-white/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl"
                                  style={{
                                    backgroundColor: `${subFolder.color}22`,
                                    border: `1px solid ${subFolder.color}55`,
                                  }}
                                >
                                  <FolderOpen
                                    className="h-5 w-5"
                                    style={{ color: subFolder.color }}
                                  />
                                </div>

                                <div>
                                  <p className="font-medium">{subFolder.name}</p>
                                  <p className="text-xs text-hero-muted">
                                    {subFolder.materials.length} materiais
                                  </p>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSubFolder(subFolder.id);
                                }}
                                className="text-red-400 hover:bg-white/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {!selectedSubFolder ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
                    <FolderOpen className="mx-auto mb-3 h-10 w-10 text-hero-muted" />
                    <h3 className="text-lg font-semibold">
                      Selecione uma subpasta
                    </h3>
                    <p className="mt-2 text-sm text-hero-muted">
                      Escolha uma subpasta para adicionar notas, links do YouTube e
                      organizar seus materiais.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl"
                            style={{
                              backgroundColor: `${selectedSubFolder.color}22`,
                              border: `1px solid ${selectedSubFolder.color}55`,
                            }}
                          >
                            <FolderOpen
                              className="h-6 w-6"
                              style={{ color: selectedSubFolder.color }}
                            />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold">
                              {selectedSubFolder.name}
                            </h2>
                            <p className="text-sm text-hero-muted">
                              Criada em {formatDate(selectedSubFolder.createdAt)}
                            </p>
                          </div>
                        </div>

                        <Button onClick={() => setShowAddMaterial((prev) => !prev)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar material
                        </Button>
                      </div>
                    </div>

                    {showAddMaterial && (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                        <h3 className="text-base font-semibold">Novo material</h3>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            type="button"
                            variant={materialType === "note" ? "default" : "outline"}
                            onClick={() => setMaterialType("note")}
                          >
                            <NotebookPen className="mr-2 h-4 w-4" />
                            Nota de texto
                          </Button>

                          <Button
                            type="button"
                            variant={materialType === "youtube" ? "default" : "outline"}
                            onClick={() => setMaterialType("youtube")}
                          >
                            <Youtube className="mr-2 h-4 w-4" />
                            Link do YouTube
                          </Button>
                        </div>

                        <input
                          value={materialTitle}
                          onChange={(e) => setMaterialTitle(e.target.value)}
                          placeholder="Título do material"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-primary"
                        />

                        {materialType === "note" ? (
                          <textarea
                            value={materialContent}
                            onChange={(e) => setMaterialContent(e.target.value)}
                            placeholder="Escreva a nota ou cole o conteúdo aqui"
                            className="min-h-[140px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-primary"
                          />
                        ) : (
                          <input
                            value={materialUrl}
                            onChange={(e) => setMaterialUrl(e.target.value)}
                            placeholder="Cole a URL do vídeo do YouTube"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-primary"
                          />
                        )}

                        <div className="flex gap-3">
                          <Button onClick={addMaterial}>Salvar material</Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowAddMaterial(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedSubFolder.materials.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
                        <FileText className="mx-auto mb-3 h-10 w-10 text-hero-muted" />
                        <h3 className="text-lg font-semibold">
                          Nenhum material nesta subpasta ainda
                        </h3>
                        <p className="mt-2 text-sm text-hero-muted">
                          Adicione notas ou links do YouTube para começar a montar o
                          conteúdo desta subpasta.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {selectedSubFolder.materials.map((material) => (
                          <div
                            key={material.id}
                            className="rounded-2xl border border-white/10 bg-white/5 p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                  {material.type === "note" ? (
                                    <NotebookPen className="h-5 w-5 text-primary" />
                                  ) : (
                                    <Youtube className="h-5 w-5 text-red-400" />
                                  )}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold">{material.title}</h3>
                                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-hero-muted">
                                      {material.type === "note" ? "Nota" : "YouTube"}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-xs text-hero-muted">
                                    Criado em {formatDate(material.createdAt)}
                                  </p>

                                  {material.type === "note" && material.content && (
                                    <p className="mt-3 text-sm text-hero-muted line-clamp-3">
                                      {material.content}
                                    </p>
                                  )}

                                  {material.type === "youtube" && material.url && (
                                    <a
                                      href={material.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-3 inline-block text-sm text-primary underline"
                                    >
                                      Abrir vídeo
                                    </a>
                                  )}

                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-hero-muted">
                                      Fonte: {material.sourceType || "não definida"}
                                    </span>
                                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-hero-muted">
                                      Contexto salvo
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMaterial(material.id)}
                                className="text-red-400 hover:bg-white/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedSubFolder
                      ? `Chat da subpasta: ${selectedSubFolder.name}`
                      : `Chat da pasta: ${folder.name}`}
                  </h3>
                  <p className="text-sm text-hero-muted">
                    Histórico salvo por contexto. No futuro, a IA responderá com base apenas nos materiais desta área.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 min-h-[220px] space-y-3">
                {chatHistory.length === 0 ? (
                  <div className="text-sm text-hero-muted">
                    Nenhuma conversa iniciada neste contexto ainda.
                  </div>
                ) : (
                  chatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-xl p-3 text-sm ${
                        message.role === "user"
                          ? "bg-white/10 ml-6"
                          : "bg-primary/10 mr-6"
                      }`}
                    >
                      <div className="mb-1 text-[11px] uppercase tracking-wide text-hero-muted">
                        {message.role === "user" ? "Você" : "IA"}
                      </div>
                      <p>{message.content}</p>
                      <p className="mt-2 text-[11px] text-hero-muted">
                        {formatDateTime(message.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-3">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escreva sua mensagem"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
                <Button onClick={sendChatMessage}>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="simulados" className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">
                      {selectedSubFolder
                        ? `Simulados da subpasta: ${selectedSubFolder.name}`
                        : `Simulados da pasta: ${folder.name}`}
                    </h3>
                    <p className="text-sm text-hero-muted">
                      Histórico salvo por contexto. Preparado para IA depois.
                    </p>
                  </div>
                </div>

                <Button onClick={createMockQuiz}>
                  <Plus className="mr-2 h-4 w-4" />
                  Gerar simulado
                </Button>
              </div>
            </div>

            {quizHistory.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <h3 className="text-lg font-semibold">Histórico deste contexto</h3>

                <div className="grid gap-3">
                  {quizHistory.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-medium">{quiz.title}</p>
                        <p className="text-sm text-hero-muted">
                          {quiz.type} • {quiz.questionCount} questões
                        </p>
                        <p className="text-xs text-hero-muted mt-1">
                          {formatDateTime(quiz.createdAt)}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteQuiz(quiz.id)}
                        className="text-red-400 hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <SimuladosTab folderId={activeContextId} />
          </TabsContent>

          <TabsContent value="flashcards" className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <BookOpenText className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">
                      {selectedSubFolder
                        ? `Flashcards da subpasta: ${selectedSubFolder.name}`
                        : `Flashcards da pasta: ${folder.name}`}
                    </h3>
                    <p className="text-sm text-hero-muted">
                      Histórico salvo por contexto. Preparado para geração por IA depois.
                    </p>
                  </div>
                </div>

                <Button onClick={() => setShowFlashcardForm((prev) => !prev)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo flashcard
                </Button>
              </div>
            </div>

            {showFlashcardForm && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <h3 className="text-base font-semibold">Criar flashcard</h3>

                <input
                  value={flashFront}
                  onChange={(e) => setFlashFront(e.target.value)}
                  placeholder="Frente do card"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-primary"
                />

                <textarea
                  value={flashBack}
                  onChange={(e) => setFlashBack(e.target.value)}
                  placeholder="Verso do card"
                  className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-primary"
                />

                <div className="flex gap-3">
                  <Button onClick={createFlashcard}>Salvar flashcard</Button>
                  <Button variant="outline" onClick={() => setShowFlashcardForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {flashcards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
                <Layers3 className="mx-auto mb-3 h-10 w-10 text-hero-muted" />
                <h3 className="text-lg font-semibold">Nenhum flashcard neste contexto</h3>
                <p className="mt-2 text-sm text-hero-muted">
                  Crie flashcards para esta pasta ou subpasta.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {flashcards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-hero-muted">
                            Frente
                          </p>
                          <p className="font-medium">{card.front}</p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-hero-muted">
                            Verso
                          </p>
                          <p className="text-sm text-hero-muted">{card.back}</p>
                        </div>

                        <p className="text-xs text-hero-muted">
                          {formatDateTime(card.createdAt)}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFlashcard(card.id)}
                        className="text-red-400 hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
