import { useParams, Link, useNavigate } from "react-router-dom";
import { mockFolders } from "@/data/mockQuizData";
import { computePerformance } from "@/lib/quizStorage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimuladosTab } from "@/components/simulados/SimuladosTab";
import { PerformancePanel } from "@/components/simulados/PerformancePanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Clock3,
  SlidersHorizontal,
  RotateCcw,
  Folder,
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

type QuizType = "multiple_choice" | "open" | "mixed";
type Difficulty = "easy" | "medium" | "hard" | "mixed";
type CorrectionMode = "instant" | "end";

type QuizConfig = {
  quizType: QuizType;
  difficulty: Difficulty;
  questionCount: number;
  timerEnabled: boolean;
  timerMinutes: number;
  correctionMode: CorrectionMode;
};

type QuizHistoryItem = {
  id: string;
  title: string;
  createdAt: string;
  type: string;
  questionCount: number;
  difficulty: Difficulty;
  timerEnabled: boolean;
  timerMinutes?: number;
  correctionMode: CorrectionMode;
  correctCount: number;
  wrongCount: number;
  correctPercentage: number;
  wrongPercentage: number;
};

type FlashcardDisplayMode = "front-back" | "click-to-flip";
type FlashcardAnswerPosition = "back" | "front";

type FlashcardConfig = {
  displayMode: FlashcardDisplayMode;
  answerPosition: FlashcardAnswerPosition;
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
type FlashcardReviewItem = {
  id: string;
  flashcardId: string;
  createdAt: string;
  result: "correct" | "wrong";
};
type StudyContextData = {
  chatHistory: ChatMessage[];
  quizHistory: QuizHistoryItem[];
  flashcards: FlashcardItem[];
  flashcardReviews: FlashcardReviewItem[];
  quizConfig: QuizConfig;
  flashcardConfig: FlashcardConfig;
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

const defaultQuizConfig: QuizConfig = {
  quizType: "multiple_choice",
  difficulty: "medium",
  questionCount: 10,
  timerEnabled: false,
  timerMinutes: 20,
  correctionMode: "end",
};

const defaultFlashcardConfig: FlashcardConfig = {
  displayMode: "click-to-flip",
  answerPosition: "back",
};

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
  flashcardReviews: [],
  quizConfig: defaultQuizConfig,
  flashcardConfig: defaultFlashcardConfig,
});

const tabTriggerClass =
  "data-[state=active]:bg-white/15 data-[state=active]:border data-[state=active]:border-white/20 data-[state=active]:text-hero-foreground data-[state=active]:shadow-md text-hero-muted px-4 py-2.5 transition-all";

const quizTypeLabel = (quizType: QuizType) => {
  if (quizType === "multiple_choice") return "Múltipla escolha";
  if (quizType === "open") return "Abertas";
  return "Misto";
};

const difficultyLabel = (difficulty: Difficulty) => {
  if (difficulty === "easy") return "Fácil";
  if (difficulty === "medium") return "Médio";
  if (difficulty === "hard") return "Difícil";
  return "Misto";
};

const correctionModeLabel = (mode: CorrectionMode) => {
  if (mode === "instant") return "Mostrar resposta na hora";
  return "Mostrar resposta só no final";
};

function FlashcardPreview({
  card,
  config,
}: {
  card: FlashcardItem;
  config: FlashcardConfig;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [card.id, config.displayMode, config.answerPosition]);

  const frontLabel =
    config.answerPosition === "back" ? "Pergunta" : "Resposta";
  const backLabel =
    config.answerPosition === "back" ? "Resposta" : "Pergunta";

  const frontContent =
    config.answerPosition === "back" ? card.front : card.back;
  const backContent =
    config.answerPosition === "back" ? card.back : card.front;

  const canFlip = config.displayMode === "click-to-flip";

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={() => {
          if (canFlip) setFlipped((prev) => !prev);
        }}
        className="group w-full max-w-[420px] [perspective:1200px]"
      >
        <div
          className={`relative h-[260px] w-full rounded-[28px] transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="absolute inset-0 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)] [backface-visibility:hidden]">
            <div className="flex h-full flex-col justify-between text-left">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-hero-muted">
                  {frontLabel}
                </p>

                <div className="mt-6 flex h-[140px] items-center justify-center text-center">
                  <p className="text-2xl font-semibold leading-snug text-hero-foreground">
                    {frontContent}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-hero-muted">
                <span>Flashcard</span>
                {canFlip ? (
                  <span className="text-primary">Clique para virar</span>
                ) : (
                  <span>Frente e verso visíveis</span>
                )}
              </div>
            </div>
          </div>

          <div className="absolute inset-0 rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/15 to-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)] [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="flex h-full flex-col justify-between text-left">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-hero-muted">
                  {backLabel}
                </p>

                <div className="mt-6 flex h-[140px] items-center justify-center text-center">
                  <p className="text-lg font-medium leading-relaxed text-hero-foreground">
                    {backContent}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-hero-muted">
                <span>Verso</span>
                {canFlip ? (
                  <span className="text-primary">Clique para voltar</span>
                ) : (
                  <span>Frente e verso visíveis</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

const FolderDetail = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
 const { folderId, subFolderId } = useParams<{
  folderId: string;
  subFolderId?: string;
}>();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [storedFolders, setStoredFolders] = useState<FolderItem[]>([]);
  const SUBFOLDERS_STORAGE_KEY = `folder_${folderId}_subfolders`;
  const FOLDER_MATERIALS_STORAGE_KEY = `folder_${folderId}_materials`;

  const [folderMaterials, setFolderMaterials] = useState<MaterialItem[]>([]);
  const [showAddFolderMaterial, setShowAddFolderMaterial] = useState(false);

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
  const [quizConfig, setQuizConfig] = useState<QuizConfig>(defaultQuizConfig);
  const [showQuizConfig, setShowQuizConfig] = useState(false);

  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [flashcardConfig, setFlashcardConfig] =
    useState<FlashcardConfig>(defaultFlashcardConfig);
  const [flashcardReviews, setFlashcardReviews] = useState<FlashcardReviewItem[]>([]);
  const [showFlashcardSettings, setShowFlashcardSettings] = useState(false);

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

      if (subFolderId) {
        const exists = parsed.some((sub) => sub.id === subFolderId);
        setSelectedSubFolderId(exists ? subFolderId : null);
      } else {
        setSelectedSubFolderId(null);
      }
    } catch {
      localStorage.removeItem(SUBFOLDERS_STORAGE_KEY);
      setSubFolders([]);
      setSelectedSubFolderId(null);
    }
  } else {
    setSubFolders([]);
    setSelectedSubFolderId(null);
  }
}, [folderId, subFolderId, SUBFOLDERS_STORAGE_KEY]);
  useEffect(() => {
    if (!folderId) return;
    localStorage.setItem(SUBFOLDERS_STORAGE_KEY, JSON.stringify(subFolders));
  }, [subFolders, folderId, SUBFOLDERS_STORAGE_KEY]);

  useEffect(() => {
    if (!folderId) return;

    const saved = localStorage.getItem(FOLDER_MATERIALS_STORAGE_KEY);
    if (saved) {
      try {
        setFolderMaterials(JSON.parse(saved));
      } catch {
        localStorage.removeItem(FOLDER_MATERIALS_STORAGE_KEY);
        setFolderMaterials([]);
      }
    } else {
      setFolderMaterials([]);
    }
  }, [folderId, FOLDER_MATERIALS_STORAGE_KEY]);

  useEffect(() => {
    if (!folderId) return;
    localStorage.setItem(
      FOLDER_MATERIALS_STORAGE_KEY,
      JSON.stringify(folderMaterials)
    );
  }, [folderMaterials, folderId, FOLDER_MATERIALS_STORAGE_KEY]);

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
        setQuizConfig(parsed.quizConfig || defaultQuizConfig);
        setFlashcardConfig(parsed.flashcardConfig || defaultFlashcardConfig);
        setFlashcardReviews(parsed.flashcardReviews || []);
      } catch {
        const empty = createEmptyContext();
        setChatHistory(empty.chatHistory);
        setQuizHistory(empty.quizHistory);
        setFlashcards(empty.flashcards);
        setQuizConfig(empty.quizConfig);
        setFlashcardConfig(empty.flashcardConfig);
      }
    } else {
      const empty = createEmptyContext();
      setChatHistory(empty.chatHistory);
      setQuizHistory(empty.quizHistory);
      setFlashcards(empty.flashcards);
      setQuizConfig(empty.quizConfig);
      setFlashcardConfig(empty.flashcardConfig);
    }
  }, [CONTEXT_STORAGE_KEY, activeContextId]);

  useEffect(() => {
    if (!activeContextId) return;

    const data: StudyContextData = {
  chatHistory,
  quizHistory,
  flashcards,
  flashcardReviews,
  quizConfig,
  flashcardConfig,
};

    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(data));
  }, [
    chatHistory,
    quizHistory,
    flashcards,
    quizConfig,
    flashcardConfig,
    CONTEXT_STORAGE_KEY,
    activeContextId,
    flashcardReviews,
  ]);

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

  const resetMaterialForm = () => {
    setMaterialTitle("");
    setMaterialContent("");
    setMaterialUrl("");
    setMaterialType("note");
  };

  const buildMaterial = (): MaterialItem | null => {
    if (!materialTitle.trim()) return null;
    if (materialType === "note" && !materialContent.trim()) return null;
    if (materialType === "youtube" && !materialUrl.trim()) return null;

    return {
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
  };

  const addFolderMaterial = () => {
    const newMaterial = buildMaterial();
    if (!newMaterial) return;

    setFolderMaterials((prev) => [newMaterial, ...prev]);
    resetMaterialForm();
    setShowAddFolderMaterial(false);
  };

  const addMaterialToSubFolder = () => {
    if (!selectedSubFolder) return;

    const newMaterial = buildMaterial();
    if (!newMaterial) return;

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

    resetMaterialForm();
    setShowAddMaterial(false);
  };

  const deleteFolderMaterial = (materialId: string) => {
    setFolderMaterials((prev) => prev.filter((m) => m.id !== materialId));
  };

  const deleteSubFolderMaterial = (materialId: string) => {
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
    const total = Math.max(1, quizConfig.questionCount);
    const correct = Math.floor(Math.random() * (total + 1));
    const wrong = total - correct;
    const correctPercentage = Math.round((correct / total) * 100);
    const wrongPercentage = 100 - correctPercentage;

    const newQuiz: QuizHistoryItem = {
      id: crypto.randomUUID(),
      title: selectedSubFolder
        ? `Simulado - ${selectedSubFolder.name}`
        : `Simulado - ${folder?.name}`,
      createdAt: new Date().toISOString(),
      type: quizTypeLabel(quizConfig.quizType),
      questionCount: total,
      difficulty: quizConfig.difficulty,
      timerEnabled: quizConfig.timerEnabled,
      timerMinutes: quizConfig.timerEnabled ? quizConfig.timerMinutes : undefined,
      correctionMode: quizConfig.correctionMode,
      correctCount: correct,
      wrongCount: wrong,
      correctPercentage,
      wrongPercentage,
    };

    setQuizHistory((prev) => [newQuiz, ...prev]);
    setShowQuizConfig(false);
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

  const renderMaterialForm = (
    onSave: () => void,
    onCancel: () => void,
    title = "Novo material"
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4"
    >
      <h3 className="text-base font-semibold">{title}</h3>

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
        <Button onClick={onSave}>Salvar material</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </motion.div>
  );

  const renderMaterialsList = (
    materials: MaterialItem[],
    onDelete: (id: string) => void,
    emptyTitle: string,
    emptyDescription: string,
    onAdd?: () => void
  ) => {
    if (materials.length === 0) {
      return (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
          <FileText className="mb-4 h-12 w-12 text-hero-muted" />
          <h3 className="text-xl font-semibold">{emptyTitle}</h3>
          <p className="mt-2 max-w-xl text-sm text-hero-muted">
            {emptyDescription}
          </p>
          {onAdd && (
            <Button
              className="mt-5 bg-gradient-primary text-primary-foreground hover:opacity-90"
              onClick={onAdd}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar primeiro material
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {materials.map((material) => (
          <motion.div
            key={material.id}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="cursor-pointer rounded-3xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
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
                    <p className="mt-3 max-w-3xl text-sm text-hero-muted line-clamp-3">
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
                onClick={() => onDelete(material.id)}
                className="text-red-400 hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
   <div className="flex min-h-screen bg-hero text-hero-foreground">
     <div
  className={cn(
    "transition-all duration-300 border-r border-white/10 bg-white/5 backdrop-blur-md",
    sidebarOpen ? "w-64" : "w-16"
  )}
>
  <div className="flex justify-end p-2">
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
    </Button>
  </div>

  <div className="px-2 pb-4 space-y-2">
    <button
      onClick={() => navigate(`/folders/${folderId}`)}
      className={cn(
        "w-full rounded-xl text-left transition border",
        sidebarOpen ? "px-3 py-3" : "px-2 py-3 flex justify-center",
        selectedSubFolderId === null
          ? "bg-primary/15 border-primary/30 text-white"
          : "bg-white/5 border-white/10 text-hero-muted hover:bg-white/10"
      )}
    >
      {sidebarOpen ? (
        <div className="flex items-center gap-3">
          <Folder className="h-4 w-4 text-primary" />
          <span className="truncate">{folder.name}</span>
        </div>
      ) : (
        <Folder className="h-4 w-4 text-primary" />
      )}
    </button>

    {subFolders.map((subFolder) => {
      const isActive = selectedSubFolderId === subFolder.id;

      return (
        <button
          key={subFolder.id}
         onClick={() => navigate(`/folders/${folderId}/sub/${subFolder.id}`)}
          className={cn(
            "w-full rounded-xl text-left transition border",
            sidebarOpen ? "px-3 py-3" : "px-2 py-3 flex justify-center",
            isActive
              ? "bg-primary/15 border-primary/30 text-white"
              : "bg-white/5 border-white/10 text-hero-muted hover:bg-white/10"
          )}
        >
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <FolderOpen
                className="h-4 w-4"
                style={{ color: subFolder.color }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{subFolder.name}</p>
                <p className="text-xs text-hero-muted">
                  {subFolder.materials.length} materiais
                </p>
              </div>
            </div>
          ) : (
            <FolderOpen
              className="h-4 w-4"
              style={{ color: subFolder.color }}
            />
          )}
        </button>
      );
    })}
  </div>
</div>
     <div className="flex-1">
      <header className="border-b border-white/10 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
  {/* BOTÃO DE VOLTAR */}
  <button
    onClick={() => navigate("/dashboard")}
    className="p-2 rounded-lg hover:bg-white/10 transition"
  >
    <ChevronLeft className="h-5 w-5 text-hero-muted hover:text-white" />
  </button>

  {/* LOGO */}
  <Link to="/dashboard" className="flex items-center gap-2">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
      <Brain className="h-5 w-5 text-primary-foreground" />
    </div>
    <span className="text-lg font-bold">MedLearn AI</span>
  </Link>
</div>

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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex items-center gap-2 text-sm text-hero-muted">
          <Link
            to="/folders"
            className="hover:text-hero-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Pastas
          </Link>
          <ChevronRight className="h-4 w-4 opacity-50" />
          <span className="text-hero-foreground">{folder.name}</span>
          {selectedSubFolder && (
            <>
              <ChevronRight className="h-4 w-4 opacity-50" />
              <span className="text-hero-foreground">{selectedSubFolder.name}</span>
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl shadow-glow">
                {folder.icon}
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-hero-muted">
                  Contexto ativo
                </p>
                <h1 className="mt-1 text-3xl font-bold">
                  {folder.name}
                  {selectedSubFolder && (
                    <span className="text-hero-muted"> / {selectedSubFolder.name}</span>
                  )}
                </h1>
                <p className="mt-1 text-sm text-hero-muted max-w-2xl">
                  {selectedSubFolder
                    ? "Tudo o que você fizer aqui pertence apenas a esta subpasta."
                    : folder.description}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-hero-muted md:min-w-[280px]">
              <div className="flex items-center gap-2 text-hero-foreground font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Ambiente de estudo independente
              </div>
              <p className="mt-1 text-xs leading-relaxed">
                Chats, simulados, flashcards e revisões ficam separados por contexto.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-hero-muted">
                Você está estudando
              </p>
              <p className="mt-1 text-base font-semibold">
                📁 {folder.name}
                {selectedSubFolder && ` > 📂 ${selectedSubFolder.name}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-hero-muted">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {folderMaterials.length} materiais na pasta
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {subFolders.length} subpastas
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {selectedSubFolder?.materials.length ?? 0} materiais na subpasta
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {flashcards.length} flashcards
              </span>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="materiais" className="w-full">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
            <TabsTrigger value="materiais" className={tabTriggerClass}>
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Materiais
            </TabsTrigger>
            <TabsTrigger value="chat" className={tabTriggerClass}>
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat
            </TabsTrigger>
            <TabsTrigger value="simulados" className={tabTriggerClass}>
              <Target className="mr-1.5 h-3.5 w-3.5" /> Simulados
            </TabsTrigger>
            <TabsTrigger value="flashcards" className={tabTriggerClass}>
              <Layers3 className="mr-1.5 h-3.5 w-3.5" /> Flashcards
            </TabsTrigger>
            <TabsTrigger value="desempenho" className={tabTriggerClass}>
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Desempenho
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materiais" className="mt-6 space-y-6">
            {/* Materiais da pasta */}
            <section className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                      <Folder className="h-7 w-7 text-primary" />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold">Materiais da pasta</h2>
                      <p className="text-sm text-hero-muted">
                        Adicione materiais diretamente nesta pasta, sem precisar criar subpasta.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setShowAddFolderMaterial((prev) => !prev);
                      setShowAddMaterial(false);
                    }}
                    className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-md"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar material na pasta
                  </Button>
                </div>
              </div>

              {showAddFolderMaterial &&
                renderMaterialForm(
                  addFolderMaterial,
                  () => {
                    setShowAddFolderMaterial(false);
                    resetMaterialForm();
                  },
                  "Novo material da pasta"
                )}

              {renderMaterialsList(
                folderMaterials,
                deleteFolderMaterial,
                "Nenhum material diretamente nesta pasta ainda",
                "Adicione notas ou links do YouTube diretamente na pasta principal.",
                () => setShowAddFolderMaterial(true)
              )}
            </section>

            {/* Subpastas + materiais da subpasta */}
            <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
              <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">Subpastas</h2>
                      <p className="mt-1 text-sm text-hero-muted">
                        Organize conteúdos por assunto.
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setShowCreateSubFolder((prev) => !prev)}
                      className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Nova
                    </Button>
                  </div>

                  {showCreateSubFolder && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3"
                    >
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
                    </motion.div>
                  )}

                  {subFolders.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center">
                      <FolderOpen className="mx-auto mb-3 h-8 w-8 text-hero-muted" />
                      <p className="font-medium">Nenhuma subpasta criada ainda</p>
                      <p className="mt-1 text-sm text-hero-muted">
                        Crie uma subpasta para separar assuntos.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {subFolders.map((subFolder) => {
                        const isSelected = selectedSubFolderId === subFolder.id;

                        return (
                          <motion.button
                            key={subFolder.id}
                            whileHover={{ scale: 1.015 }}
                            transition={{ type: "spring", stiffness: 220, damping: 18 }}
                            onClick={() => setSelectedSubFolderId(subFolder.id)}
                            className={`relative w-full overflow-hidden rounded-2xl border p-4 text-left transition ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-lg"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div
                              className={`absolute left-0 top-0 h-full w-1 ${
                                isSelected ? "bg-primary" : "bg-transparent"
                              }`}
                            />

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
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {!selectedSubFolder ? (
                  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
                    <FolderOpen className="mb-4 h-12 w-12 text-hero-muted" />
                    <h3 className="text-2xl font-semibold">Nenhuma subpasta selecionada</h3>
                    <p className="mt-2 max-w-xl text-sm text-hero-muted">
                      Selecione uma subpasta para ver os materiais dela, ou continue usando os materiais da pasta principal.
                    </p>
                    <Button
                      className="mt-5 bg-gradient-primary text-primary-foreground hover:opacity-90"
                      onClick={() => setShowCreateSubFolder(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar subpasta
                    </Button>
                  </div>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-14 w-14 items-center justify-center rounded-2xl"
                            style={{
                              backgroundColor: `${selectedSubFolder.color}22`,
                              border: `1px solid ${selectedSubFolder.color}55`,
                            }}
                          >
                            <FolderOpen
                              className="h-7 w-7"
                              style={{ color: selectedSubFolder.color }}
                            />
                          </div>

                          <div>
                            <h2 className="text-xl font-semibold">
                              {selectedSubFolder.name}
                            </h2>
                            <p className="text-sm text-hero-muted">
                              Criada em {formatDate(selectedSubFolder.createdAt)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-hero-muted">
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                {selectedSubFolder.materials.length} materiais
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                {chatHistory.length} mensagens
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                {flashcards.length} flashcards
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            setShowAddMaterial((prev) => !prev);
                            setShowAddFolderMaterial(false);
                          }}
                          className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-md"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar material na subpasta
                        </Button>
                      </div>
                    </motion.div>

                    {showAddMaterial &&
                      renderMaterialForm(
                        addMaterialToSubFolder,
                        () => {
                          setShowAddMaterial(false);
                          resetMaterialForm();
                        },
                        "Novo material da subpasta"
                      )}

                    {renderMaterialsList(
                      selectedSubFolder.materials,
                      deleteSubFolderMaterial,
                      "Nenhum material nesta subpasta ainda",
                      "Adicione notas ou links do YouTube para montar o conteúdo desta subpasta.",
                      () => setShowAddMaterial(true)
                    )}
                  </>
                )}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5">
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
                  <p className="mt-2 text-xs text-hero-muted">
                    Contexto atual: {selectedSubFolder?.name || folder.name}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/10 p-4 min-h-[260px] space-y-3">
                {chatHistory.length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                    <MessageSquare className="mb-3 h-10 w-10 text-hero-muted" />
                    <p className="font-medium">Nenhuma conversa iniciada ainda</p>
                    <p className="mt-1 text-sm text-hero-muted">
                      Envie uma mensagem para começar o chat deste contexto.
                    </p>
                  </div>
                ) : (
                  chatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-2xl p-3 text-sm ${
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
                <Button onClick={sendChatMessage} className="bg-gradient-primary text-primary-foreground">
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="simulados" className="mt-6 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">
                      {selectedSubFolder
                        ? `Simulados da subpasta: ${selectedSubFolder.name}`
                        : `Simulados da pasta: ${folder.name}`}
                    </h3>
                    <p className="text-sm text-hero-muted">
                      Configure o tipo de simulado deste contexto. Quando a IA entrar,
                      ela usará essas escolhas para gerar as questões.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowQuizConfig((prev) => !prev)}
                    className="border-white/15 bg-white/5 text-hero-foreground hover:bg-white/10 hover:text-hero-foreground"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Configurar
                  </Button>

                  <Button
                    onClick={createMockQuiz}
                    className="bg-gradient-primary text-primary-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Gerar simulado
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-hero-muted">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Tipo: {quizTypeLabel(quizConfig.quizType)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Dificuldade: {difficultyLabel(quizConfig.difficulty)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  {quizConfig.questionCount} questões
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  {quizConfig.timerEnabled
                    ? `Cronômetro: ${quizConfig.timerMinutes} min`
                    : "Sem cronômetro"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  {correctionModeLabel(quizConfig.correctionMode)}
                </span>
              </div>
            </div>

            {showQuizConfig && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-5"
              >
                <div>
                  <h3 className="text-lg font-semibold">Configuração do simulado</h3>
                  <p className="text-sm text-hero-muted mt-1">
                    Escolha como esse simulado deve ser montado neste contexto.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-hero-muted">Tipo de simulado</label>
                    <select
                      value={quizConfig.quizType}
                      onChange={(e) =>
                        setQuizConfig((prev) => ({
                          ...prev,
                          quizType: e.target.value as QuizType,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="multiple_choice">Múltipla escolha</option>
                      <option value="open">Abertas</option>
                      <option value="mixed">Misto</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-hero-muted">Dificuldade</label>
                    <select
                      value={quizConfig.difficulty}
                      onChange={(e) =>
                        setQuizConfig((prev) => ({
                          ...prev,
                          difficulty: e.target.value as Difficulty,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="easy">Fácil</option>
                      <option value="medium">Médio</option>
                      <option value="hard">Difícil</option>
                      <option value="mixed">Misto</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-hero-muted">Número de questões</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={quizConfig.questionCount}
                      onChange={(e) =>
                        setQuizConfig((prev) => ({
                          ...prev,
                          questionCount: Math.max(1, Number(e.target.value) || 1),
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-hero-muted">Modo de correção</label>
                    <select
                      value={quizConfig.correctionMode}
                      onChange={(e) =>
                        setQuizConfig((prev) => ({
                          ...prev,
                          correctionMode: e.target.value as CorrectionMode,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="instant">Mostrar resposta na hora</option>
                      <option value="end">Mostrar resposta só no final</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-hero-muted flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      Cronômetro
                    </label>

                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={quizConfig.timerEnabled}
                          onChange={(e) =>
                            setQuizConfig((prev) => ({
                              ...prev,
                              timerEnabled: e.target.checked,
                            }))
                          }
                        />
                        Ativar cronômetro
                      </label>
                    </div>
                  </div>
                </div>

                {quizConfig.timerEnabled && (
                  <div className="space-y-2">
                    <label className="text-sm text-hero-muted">Tempo em minutos</label>
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={quizConfig.timerMinutes}
                      onChange={(e) =>
                        setQuizConfig((prev) => ({
                          ...prev,
                          timerMinutes: Math.max(1, Number(e.target.value) || 1),
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={createMockQuiz}>Salvar e gerar simulado</Button>
                  <Button variant="outline" onClick={() => setShowQuizConfig(false)}>
                    Fechar
                  </Button>
                </div>
              </motion.div>
            )}

            {quizHistory.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
                <h3 className="text-lg font-semibold">Histórico deste contexto</h3>

                <div className="grid gap-3">
                  {quizHistory.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-medium">{quiz.title}</p>
                        <p className="text-sm text-hero-muted">
                          {quiz.type} • {quiz.questionCount} questões •{" "}
                          {difficultyLabel(quiz.difficulty)}
                        </p>
                        <p className="text-xs text-hero-muted mt-1">
                          {quiz.timerEnabled
                            ? `Com cronômetro (${quiz.timerMinutes} min)`
                            : "Sem cronômetro"}
                        </p>
                        <p className="text-xs text-hero-muted mt-1">
                          {correctionModeLabel(quiz.correctionMode)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                            Acertos: {quiz.correctCount}
                          </span>
                          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-red-300">
                            Erros: {quiz.wrongCount}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-hero-muted">
                            % acerto: {quiz.correctPercentage}%
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-hero-muted">
                            % erro: {quiz.wrongPercentage}%
                          </span>
                        </div>

                        <p className="text-xs text-hero-muted mt-3">
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
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <BookOpenText className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">
                      {selectedSubFolder
                        ? `Flashcards da subpasta: ${selectedSubFolder.name}`
                        : `Flashcards da pasta: ${folder.name}`}
                    </h3>
                    <p className="text-sm text-hero-muted">
                      Defina como os cartões devem ser exibidos neste contexto. Depois,
                      quando a IA entrar, ela poderá gerar os cards nesse formato.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFlashcardSettings((prev) => !prev)}
                    className="border-white/15 bg-white/5 text-hero-foreground hover:bg-white/10 hover:text-hero-foreground"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Configurar
                  </Button>

                  <Button
                    onClick={() => setShowFlashcardForm((prev) => !prev)}
                    className="bg-gradient-primary text-primary-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo flashcard
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-hero-muted">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Modo:{" "}
                  {flashcardConfig.displayMode === "click-to-flip"
                    ? "Virar ao clicar"
                    : "Frente e verso visíveis"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Resposta na{" "}
                  {flashcardConfig.answerPosition === "back"
                    ? "parte de trás"
                    : "parte da frente"}
                </span>
              </div>
            </div>

            {showFlashcardSettings && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-5"
              >
                <div>
                  <h3 className="text-lg font-semibold">Configuração dos flashcards</h3>
                  <p className="text-sm text-hero-muted mt-1">
                    Escolha como os cartões devem ser exibidos neste contexto.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-hero-muted">Modo de exibição</label>
                    <select
                      value={flashcardConfig.displayMode}
                      onChange={(e) =>
                        setFlashcardConfig((prev) => ({
                          ...prev,
                          displayMode: e.target.value as FlashcardDisplayMode,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="click-to-flip">Virar ao clicar</option>
                      <option value="front-back">Frente e verso visíveis</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-hero-muted">Posição da resposta</label>
                    <select
                      value={flashcardConfig.answerPosition}
                      onChange={(e) =>
                        setFlashcardConfig((prev) => ({
                          ...prev,
                          answerPosition: e.target.value as FlashcardAnswerPosition,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="back">Resposta atrás</option>
                      <option value="front">Resposta na frente</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setShowFlashcardSettings(false)}>
                    Salvar configuração
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFlashcardConfig(defaultFlashcardConfig)}
                  >
                    Restaurar padrão
                  </Button>
                </div>
              </motion.div>
            )}

            {showFlashcardForm && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
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
                  <Button
                    variant="outline"
                    onClick={() => setShowFlashcardForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

        {flashcards.length === 0 ? (
  <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
    <Layers3 className="mx-auto mb-3 h-10 w-10 text-hero-muted" />
    <h3 className="text-lg font-semibold">Nenhum flashcard neste contexto</h3>
    <p className="mt-2 text-sm text-hero-muted">
      Crie flashcards para esta pasta ou subpasta.
    </p>
  </div>
) : (
  <div className="grid gap-6 lg:grid-cols-2">
    {flashcards.map((card) => (
      <div key={card.id} className="space-y-3">
        <FlashcardPreview card={card} config={flashcardConfig} />

        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => {
              const review = {
                id: crypto.randomUUID(),
                flashcardId: card.id,
                createdAt: new Date().toISOString(),
                result: "correct" as const,
              };
              setFlashcardReviews((prev) => [review, ...prev]);
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Acertei
          </Button>

          <Button
            onClick={() => {
              const review = {
                id: crypto.randomUUID(),
                flashcardId: card.id,
                createdAt: new Date().toISOString(),
                result: "wrong" as const,
              };
              setFlashcardReviews((prev) => [review, ...prev]);
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Errei
          </Button>
        </div>

        <div className="mx-auto w-full max-w-[420px] flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs text-hero-muted">
            {formatDateTime(card.createdAt)}
          </p>

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
 </div>
);
};

export default FolderDetail;
