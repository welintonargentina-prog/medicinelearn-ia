import { useParams, Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimuladosTab } from "@/components/simulados/SimuladosTab";
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
  Upload,
  Paperclip,
  Download,
  ChevronRight,
  ChevronLeft,
  Clock3,
  SlidersHorizontal,
  Folder,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuração Global da IA Gratuita do Gemini
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

type FolderItem = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  materialsCount: number;
  createdAt: string;
};

type MaterialType = "note" | "youtube" | "file";

type MaterialItem = {
  id: string;
  title: string;
  type: MaterialType;
  content?: string;
  url?: string;
  fileName?: string;
  fileMime?: string;
  fileSize?: number;
  fileDataUrl?: string;
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

const getLocale = (language: string) => {
  if (language === "en") return "en-US";
  if (language === "es") return "es-ES";
  return "pt-BR";
};

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

  const frontLabel = config.answerPosition === "back" ? "Pergunta" : "Resposta";
  const backLabel = config.answerPosition === "back" ? "Resposta" : "Pergunta";
  const frontContent = config.answerPosition === "back" ? card.front : card.back;
  const backContent = config.answerPosition === "back" ? card.back : card.front;
  const canFlip = config.displayMode === "click-to-flip";

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={() => { if (canFlip) setFlipped((prev) => !prev); }}
        className="group w-full max-w-[420px] [perspective:1200px]"
      >
        <div className={`relative h-[260px] w-full rounded-[28px] transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}>
          <div className="absolute inset-0 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)] [backface-visibility:hidden]">
            <div className="flex h-full flex-col justify-between text-left">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-hero-muted">{frontLabel}</p>
                <div className="mt-6 flex h-[140px] items-center justify-center text-center">
                  <p className="text-2xl font-semibold leading-snug text-hero-foreground">{frontContent}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-hero-muted">
                <span>Flashcard</span>
                {canFlip ? <span className="text-primary">Clique para virar</span> : <span>Frente e verso visíveis</span>}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/15 to-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)] [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="flex h-full flex-col justify-between text-left">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-hero-muted">{backLabel}</p>
                <div className="mt-6 flex h-[140px] items-center justify-center text-center">
                  <p className="text-lg font-medium leading-relaxed text-hero-foreground">{backContent}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-hero-muted">
                <span>Verso</span>
                {canFlip ? <span className="text-primary">Clique para voltar</span> : <span>Frente e verso visíveis</span>}
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
  const { folderId, subFolderId } = useParams<{ folderId: string; subFolderId?: string; }>();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const sectionText = {
    pt: {
      quizTitleFolder: "Simulados da pasta",
      quizTitleSubfolder: "Simulados da subpasta",
      quizDescription: "Configure o tipo de simulado deste contexto. Quando a IA entrar, ela usará essas escolhas para gerar as questões.",
      configure: "Configurar",
      generateQuiz: "Gerar simulado",
      quizConfigTitle: "Configuração do simulado",
      quizConfigDescription: "Escolha como esse simulado deve ser montado neste contexto.",
      quizType: "Tipo de simulado",
      difficulty: "Dificuldade",
      questionCount: "Número de questões",
      correctionMode: "Modo de correção",
      timer: "Cronômetro",
      enableTimer: "Ativar cronômetro",
      timeMinutes: "Tempo em minutos",
      saveAndGenerate: "Salvar e gerar simulado",
      close: "Fechar",
      history: "Histórico deste contexto",
      correct: "Acertos",
      wrong: "Erros",
      correctRate: "Taxa de acerto",
      wrongRate: "Taxa de erro",
      noTimer: "Sem cronômetro",
      flashTitleFolder: "Flashcards da pasta",
      flashTitleSubfolder: "Flashcards da subpasta",
      flashDescription: "Defina como os cartões devem ser exibidos neste contexto. Depois, quando a IA entrar, ela poderá gerar os cards nesse formato.",
      newFlashcard: "Novo flashcard",
      flashConfigTitle: "Configuração dos flashcards",
      flashConfigDescription: "Escolha como os cartões devem ser exibidos neste contexto.",
      displayMode: "Modo de exibição",
      answerPosition: "Posição da resposta",
      clickToFlip: "Virar ao clicar",
      frontBackVisible: "Frente e verso visíveis",
      answerBack: "Resposta atrás",
      answerFront: "Resposta na frente",
      saveConfig: "Salvar configuração",
      restoreDefault: "Restaurar padrão",
      createFlashcard: "Criar flashcard",
      frontCard: "Frente do card",
      backCard: "Verso do card",
      saveFlashcard: "Salvar flashcard",
      noFlashcards: "Nenhum flashcard neste contexto",
      noFlashcardsDesc: "Crie flashcards para esta pasta ou subpasta.",
      gotItRight: "Acertei",
      gotItWrong: "Errei",
      performanceTitle: "Desempenho dos flashcards",
      reviews: "Revisões de flashcards",
      noReviews: "Ainda não há revisões de flashcards neste contexto.",
    },
    es: {
      quizTitleFolder: "Simulacros de la carpeta",
      quizTitleSubfolder: "Simulacros de la subcarpeta",
      quizDescription: "Configura el tipo de simulacro de este contexto. Cuando la IA entre, usará estas elecciones para generar las preguntas.",
      configure: "Configurar",
      generateQuiz: "Generar simulacro",
      quizConfigTitle: "Configuración del simulacro",
      quizConfigDescription: "Elige cómo debe armarse este simulacro en este contexto.",
      quizType: "Tipo de simulacro",
      difficulty: "Dificultad",
      questionCount: "Número de preguntas",
      correctionMode: "Modo de corrección",
      timer: "Cronómetro",
      enableTimer: "Activar cronómetro",
      timeMinutes: "Tiempo en minutos",
      saveAndGenerate: "Guardar y generar simulacro",
      close: "Cerrar",
      history: "Historial de este contexto",
      correct: "Aciertos",
      wrong: "Errores",
      correctRate: "Tasa de acierto",
      wrongRate: "Tasa de error",
      noTimer: "Sin cronómetro",
      flashTitleFolder: "Flashcards de la carpeta",
      flashTitleSubfolder: "Flashcards de la subcarpeta",
      flashDescription: "Define cómo deben mostrarse las tarjetas en este contexto. Después, cuando entre la IA, podrá generar los cards en este formato.",
      newFlashcard: "Nuevo flashcard",
      flashConfigTitle: "Configuración de flashcards",
      flashConfigDescription: "Elige cómo deben mostrarse las tarjetas en este contexto.",
      displayMode: "Modo de visualización",
      answerPosition: "Posición de la respuesta",
      clickToFlip: "Girar al hacer clic",
      frontBackVisible: "Frente y reverso visibles",
      answerBack: "Respuesta atrás",
      answerFront: "Respuesta al frente",
      saveConfig: "Guardar configuración",
      restoreDefault: "Restaurar predeterminado",
      createFlashcard: "Crear flashcard",
      frontCard: "Frente de la tarjeta",
      backCard: "Reverso de la tarjeta",
      saveFlashcard: "Guardar flashcard",
      noFlashcards: "No hay flashcards en este contexto",
      noFlashcardsDesc: "Crea flashcards para esta carpeta o subcarpeta.",
      gotItRight: "Acerté",
      gotItWrong: "Fallé",
      performanceTitle: "Rendimiento de flashcards",
      reviews: "Revisiones de flashcards",
      noReviews: "Aún no hay revisiones de flashcards en este contexto.",
    },
    en: {
      quizTitleFolder: "Folder mock exams",
      quizTitleSubfolder: "Subfolder mock exams",
      quizDescription: "Configure the mock exam type for this context. When the AI is enabled, it will use these choices to generate questions.",
      configure: "Configure",
      generateQuiz: "Generate mock exam",
      quizConfigTitle: "Mock exam settings",
      quizConfigDescription: "Choose how this mock exam should be built for this context.",
      quizType: "Mock exam type",
      difficulty: "Difficulty",
      questionCount: "Number of questions",
      correctionMode: "Correction mode",
      timer: "Timer",
      enableTimer: "Enable timer",
      timeMinutes: "Time in minutes",
      saveAndGenerate: "Save and generate mock exam",
      close: "Close",
      history: "History for this context",
      correct: "Correct",
      wrong: "Wrong",
      correctRate: "Correct rate",
      wrongRate: "Wrong rate",
      noTimer: "No timer",
      flashTitleFolder: "Folder flashcards",
      flashTitleSubfolder: "Subfolder flashcards",
      flashDescription: "Define how cards should be displayed in this context. Later, when the AI is enabled, it can generate cards in this format.",
      newFlashcard: "New flashcard",
      flashConfigTitle: "Flashcard settings",
      flashConfigDescription: "Choose how cards should be displayed in this context.",
      displayMode: "Display mode",
      answerPosition: "Answer position",
      clickToFlip: "Flip on click",
      frontBackVisible: "Front and back visible",
      answerBack: "Answer on back",
      answerFront: "Answer on front",
      saveConfig: "Save settings",
      restoreDefault: "Restore default",
      createFlashcard: "Create flashcard",
      frontCard: "Card front",
      backCard: "Card back",
      saveFlashcard: "Save flashcard",
      noFlashcards: "No flashcards in this context",
      noFlashcardsDesc: "Create flashcards for this folder or subfolder.",
      gotItRight: "Got it right",
      gotItWrong: "Got it wrong",
      performanceTitle: "Flashcard performance",
      reviews: "Flashcard reviews",
      noReviews: "There are no flashcard reviews in this context yet.",
    }
  }[language];

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
  const [materialFile, setMaterialFile] = useState<{ name: string; mime: string; size: number; dataUrl: string; } | null>(null);
  const [fileUploadError, setFileUploadError] = useState<string>("");

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>(defaultQuizConfig);
  const [showQuizConfig, setShowQuizConfig] = useState(false);

  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [flashcardConfig, setFlashcardConfig] = useState<FlashcardConfig>(defaultFlashcardConfig);
  const [flashcardReviews, setFlashcardReviews] = useState<FlashcardReviewItem[]>([]);
  const [showFlashcardSettings, setShowFlashcardSettings] = useState(false);
  const [showFlashcardForm, setShowFlashcardForm] = useState(false);
  const [flashFront, setFlashFront] = useState("");
  const [flashBack, setFlashBack] = useState("");

  useEffect(() => {
    const savedFolders = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (savedFolders) {
      try { setStoredFolders(JSON.parse(savedFolders)); } catch { setStoredFolders([]); }
    }
  }, []);

  const folder = storedFolders.find((f) => f.id === folderId);

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
      try { setFolderMaterials(JSON.parse(saved)); } catch {
        localStorage.removeItem(FOLDER_MATERIALS_STORAGE_KEY);
        setFolderMaterials([]);
      }
    } else { setFolderMaterials([]); }
  }, [folderId, FOLDER_MATERIALS_STORAGE_KEY]);

  useEffect(() => {
    if (!folderId) return;
    localStorage.setItem(FOLDER_MATERIALS_STORAGE_KEY, JSON.stringify(folderMaterials));
  }, [folderMaterials, folderId, FOLDER_MATERIALS_STORAGE_KEY]);

  const selectedSubFolder = subFolders.find((subFolder) => subFolder.id === selectedSubFolderId) || null;
  const activeContextId = selectedSubFolder ? `folder:${folderId}/subfolder:${selectedSubFolder.id}` : folderId ? `folder:${folderId}` : "";
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
    const data: StudyContextData = { chatHistory, quizHistory, flashcards, flashcardReviews, quizConfig, flashcardConfig };
    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(data));
  }, [chatHistory, quizHistory, flashcards, quizConfig, flashcardConfig, CONTEXT_STORAGE_KEY, activeContextId, flashcardReviews]);

  const totalReviews = flashcardReviews.length;
  const correctReviews = flashcardReviews.filter((review) => review.result === "correct").length;
  const correctRate = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;
  const wrongRate = totalReviews > 0 ? Math.round(((totalReviews - correctReviews) / totalReviews) * 100) : 0;

  const createSubFolder = () => {
    if (!newSubFolderName.trim() || !folderId) return;
    const newFolder: SubFolder = {
      id: crypto.randomUUID(),
      name: newSubFolderName.trim(),
      color: newSubFolderColor,
      createdAt: new Date().toISOString(),
      materials: [],
    };
    const updatedSubFolders = [newFolder, ...subFolders];
    setSubFolders(updatedSubFolders);
    localStorage.setItem(SUBFOLDERS_STORAGE_KEY, JSON.stringify(updatedSubFolders));
    setNewSubFolderName("");
    setNewSubFolderColor(folderColors[0]);
    setShowCreateSubFolder(false);
    navigate(`/folders/${folderId}/sub/${newFolder.id}`);
  };

  const resetMaterialForm = () => {
    setMaterialTitle("");
    setMaterialContent("");
    setMaterialUrl("");
    setMaterialType("note");
    setMaterialFile(null);
    setFileUploadError("");
  };

  const buildMaterial = (): MaterialItem | null => {
    if (!materialTitle.trim() && materialType !== "file") return null;
    if (materialType === "note" && !materialContent.trim()) return null;
    if (materialType === "youtube" && !materialUrl.trim()) return null;
    if (materialType === "file" && !materialFile) return null;

    const isPdf = materialType === "file" && materialFile?.mime === "application/pdf";
    const finalTitle = materialTitle.trim() || (materialType === "file" ? materialFile?.name ?? "Arquivo" : "");

    return {
      id: crypto.randomUUID(),
      title: finalTitle,
      type: materialType,
      content: materialType === "note" ? materialContent.trim() : undefined,
      url: materialType === "youtube" ? materialUrl.trim() : undefined,
      fileName: materialType === "file" ? materialFile?.name : undefined,
      fileMime: materialType === "file" ? materialFile?.mime : undefined,
      fileSize: materialType === "file" ? materialFile?.size : undefined,
      fileDataUrl: materialType === "file" ? materialFile?.dataUrl : undefined,
      createdAt: new Date().toISOString(),
      sourceType: materialType === "youtube" ? "video" : materialType === "file" ? (isPdf ? "pdf" : "file") : "note",
      sourceTitle: finalTitle,
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
    setSubFolders((prev) => prev.map((subFolder) => subFolder.id === selectedSubFolder.id ? { ...subFolder, materials: [newMaterial, ...subFolder.materials] } : subFolder));
    resetMaterialForm();
    setShowAddMaterial(false);
  };

  // FUNÇÃO REAL DO CHAT CONECTADA COM O GEMINI API GRÁTIS
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: chatInput.trim(),
      createdAt: new Date().toISOString(),
    };

    const currentHistory = [...chatHistory, userMessage];
    setChatHistory(currentHistory);
    setChatInput("");

    if (!ai) {
      setChatHistory([...currentHistory, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "⚠️ IA Desconectada: Configure a variável VITE_GEMINI_API_KEY no painel da Vercel para ativar as respostas reais do Gemini.",
        createdAt: new Date().toISOString()
      }]);
      return;
    }

    try {
      const contextMaterials = selectedSubFolder ? selectedSubFolder.materials : folderMaterials;
      
      const materialsContextText = contextMaterials?.map((m, index) => {
        if (m.type === "note") return `[Material ${index + 1} - Nota]: ${m.content}`;
        if (m.type === "youtube") return `[Material ${index + 1} - Link Vídeo]: Título: ${m.title} (URL: ${m.url})`;
        if (m.type === "file") return `[Material ${index + 1} - Arquivo Local]: Nome: ${m.fileName}`;
        return "";
      }).join("\n\n") || "";

      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        systemInstruction: "Você é o MedLearn AI, um tutor especialista em medicina. Seu objetivo é ajudar o estudante baseado estritamente nos materiais de estudo fornecidos no contexto da pasta. Seja preciso, use termos semiológicos e acadêmicos corretos. Sempre cite qual material fornecido você usou como base para responder."
      });

      const promptCompleto = `
CONTEXTO ACADÊMICO DISPONÍVEL NA PASTA DE ESTUDO:
${materialsContextText || "Nenhum material foi anexado a esta pasta ainda pelo aluno."}

---
DÚVIDA DO ESTUDANTE DE MEDICINA:
${userMessage.content}
      `;

      const response = await model.generateContent(promptCompleto);
      const aiTextResponse = response.text;

      setChatHistory([...currentHistory, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiTextResponse,
        createdAt: new Date().toISOString()
      }]);

    } catch (error) {
      console.error(error);
      setChatHistory([...currentHistory, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "❌ Erro ao processar resposta com o servidor do Gemini. Verifique a cota diária ou sua chave de API.",
        createdAt: new Date().toISOString()
      }]);
    }
  };

  const createMockQuiz = () => {
    const total = Math.max(1, quizConfig.questionCount);
    const correct = Math.floor(Math.random() * (total + 1));
    const wrong = total - correct;
    const correctPercentage = Math.round((correct / total) * 100);

    const newQuiz: QuizHistoryItem = {
      id: crypto.randomUUID(),
      title: selectedSubFolder ? `Simulado - ${selectedSubFolder.name}` : `Simulado - ${folder?.name}`,
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
      wrongPercentage: 100 - correctPercentage,
    };

    setQuizHistory((prev) => [newQuiz, ...prev]);
    setShowQuizConfig(false);
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

  return (
    <div className="min-h-screen bg-hero text-hero-foreground flex">
      {/* Sidebar de Contexto */}
      <div className={cn("border-r border-white/10 bg-white/5 flex flex-col transition-all duration-300", sidebarOpen ? "w-80" : "w-0 overflow-hidden border-r-0")}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <span className="font-bold truncate max-w-[180px]">{folder?.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 border-b border-white/10">
          <Button className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/10 text-hero-foreground" onClick={() => navigate("/folders")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Pastas
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Subpastas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-hero-muted">Subpastas</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateSubFolder(!showCreateSubFolder)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {showCreateSubFolder && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <input
                  type="text"
                  placeholder="Nome da subpasta"
                  value={newSubFolderName}
                  onChange={(e) => setNewSubFolderName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs outline-none"
                />
                <div className="flex gap-1 flex-wrap">
                  {folderColors.map((c) => (
                    <button key={c} type="button" className={cn("w-5 h-5 rounded-full border border-white/20", newSubFolderColor === c && "ring-2 ring-primary")} style={{ backgroundColor: c }} onClick={() => setNewSubFolderColor(c)} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 text-xs h-7" onClick={createSubFolder}>Criar</Button>
                  <Button size="sm" variant="ghost" className="flex-1 text-xs h-7" onClick={() => setShowCreateSubFolder(false)}>Cancelar</Button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={() => { setSelectedSubFolderId(null); navigate(`/folders/${folderId}`); }}
                className={cn("w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between transition", !selectedSubFolderId ? "bg-primary text-white" : "hover:bg-white/5")}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className="h-4 w-4" style={{ color: !selectedSubFolderId ? '#fff' : folder?.color }} />
                  <span className="truncate">Contexto Geral</span>
                </div>
              </button>

              {subFolders.map((sub) => (
                <div key={sub.id} className="group relative flex items-center">
                  <button
                    onClick={() => { setSelectedSubFolderId(sub.id); navigate(`/folders/${folderId}/sub/${sub.id}`); }}
                    className={cn("w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between transition pr-8", selectedSubFolderId === sub.id ? "bg-primary text-white" : "hover:bg-white/5")}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Layers3 className="h-4 w-4" style={{ color: selectedSubFolderId === sub.id ? '#fff' : sub.color }} />
                      <span className="truncate">{sub.name}</span>
                    </div>
                  </button>
                  <button onClick={() => { setSubFolders(prev => prev.filter(s => s.id !== sub.id)); if (selectedSubFolderId === sub.id) navigate(`/folders/${folderId}`); }} className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-hero-muted hover:text-destructive transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botão de abrir Sidebar */}
      {!sidebarOpen && (
        <div className="absolute top-4 left-4 z-10">
          <Button variant="outline" size="icon" className="bg-white/5 border-white/10" onClick={() => setSidebarOpen(true)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Conteúdo Principal (Abas e Interfaces de Estudo) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div>
            <h1 className="text-xl font-bold">{selectedSubFolder ? selectedSubFolder.name : folder?.name}</h1>
            <p className="text-xs text-hero-muted mt-0.5">{selectedSubFolder ? "Subpasta de estudos ativa" : "Contexto raiz da pasta"}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-hero-muted hover:text-hero-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </header>

        <Tabs defaultValue="materials" className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="px-6 pt-4 border-b border-white/10 bg-white/5">
            <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10">
              <TabsTrigger value="materials" className={tabTriggerClass}><FileText className="mr-2 h-4 w-4" /> Materiais</TabsTrigger>
              <TabsTrigger value="chat" className={tabTriggerClass}><MessageSquare className="mr-2 h-4 w-4" /> Chat Tutor</TabsTrigger>
              <TabsTrigger value="quiz" className={tabTriggerClass}><Target className="mr-2 h-4 w-4" /> Simulados</TabsTrigger>
              <TabsTrigger value="flashcards" className={tabTriggerClass}><Layers3 className="mr-2 h-4 w-4" /> Flashcards</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Aba Materiais */}
            <TabsContent value="materials" className="m-0 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Materiais de Estudo ({selectedSubFolder ? selectedSubFolder.materials.length : folderMaterials.length})</h2>
                <Button onClick={() => selectedSubFolder ? setShowAddMaterial(true) : setShowAddFolderMaterial(true)}><Plus className="mr-2 h-4 w-4" /> Adicionar Material</Button>
              </div>

              {((selectedSubFolder ? showAddMaterial : showAddFolderMaterial)) && (
                <div className="max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                  <div className="flex gap-2">
                    <Button variant={materialType === "note" ? "default" : "outline"} onClick={() => setMaterialType("note")}><NotebookPen className="mr-2 h-4 w-4" /> Nota</Button>
                    <Button variant={materialType === "youtube" ? "default" : "outline"} onClick={() => setMaterialType("youtube")}><Youtube className="mr-2 h-4 w-4" /> Link YouTube</Button>
                  </div>
                  <input type="text" placeholder="Título do material" value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none" />
                  {materialType === "note" ? (
                    <textarea placeholder="Escreva suas anotações médicas..." value={materialContent} onChange={(e) => setMaterialContent(e.target.value)} className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none" />
                  ) : (
                    <input type="text" placeholder="URL do vídeo do YouTube" value={materialUrl} onChange={(e) => setMaterialUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none" />
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => { resetMaterialForm(); setShowAddMaterial(false); setShowAddFolderMaterial(false); }}>Cancelar</Button>
                    <Button onClick={selectedSubFolder ? addMaterialToSubFolder : addFolderMaterial}>Salvar</Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedSubFolder ? selectedSubFolder.materials : folderMaterials).map((m) => (
                  <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative group">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {m.type === "note" ? <NotebookPen className="h-4 w-4 text-amber-500" /> : <Youtube className="h-4 w-4 text-red-500" />}
                        <span className="text-xs uppercase tracking-wider text-hero-muted">{m.type === "note" ? "Nota de Texto" : "VídeoAula"}</span>
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-2">{m.title}</h3>
                      {m.content && <p className="text-xs text-hero-muted mt-2 line-clamp-3 bg-white/5 p-2 rounded-lg">{m.content}</p>}
                      {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-primary truncate block mt-2 hover:underline">{m.url}</a>}
                    </div>
                    <Button variant="ghost" size="icon" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-hero-muted hover:text-destructive transition" onClick={() => selectedSubFolder ? deleteSubFolderMaterial(m.id) : deleteFolderMaterial(m.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Aba Chat Tutor */}
            <TabsContent value="chat" className="m-0 h-full flex flex-col">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex flex-col h-[55vh]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-hero-muted p-6">
                      <Brain className="h-12 w-12 text-primary/40 mb-3" />
                      <p className="text-sm font-medium">Faça perguntas sobre os materiais desta pasta!</p>
                      <p className="text-xs max-w-sm mt-1">O Gemini 1.5 Flash lerá as notas e links salvos acima para estruturar respostas médicas precisas.</p>
                    </div>
                  ) : (
                    chatHistory.map((msg) => (
                      <div key={msg.id} className={cn("flex flex-col max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed", msg.role === "user" ? "bg-primary text-white self-end rounded-tr-none" : "bg-white/5 border border-white/10 text-hero-foreground self-start rounded-tl-none")}>
                        <span className="text-[10px] uppercase tracking-wider opacity-60 mb-1">{msg.role === "user" ? "Você (Estudante)" : "MedLearn AI"}</span>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-white/10 bg-white/5 flex gap-2 rounded-b-2xl">
                  <input type="text" placeholder="Digite sua dúvida clínica ou acadêmica..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendChatMessage(); }} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none" />
                  <Button size="icon" onClick={sendChatMessage}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </TabsContent>

            {/* Aba Simulados */}
            <TabsContent value="quiz" className="m-0">
              <SimuladosTab
                quizHistory={quizHistory}
                quizConfig={quizConfig}
                setQuizConfig={setQuizConfig}
                showQuizConfig={showQuizConfig}
                setShowQuizConfig={setShowQuizConfig}
                createMockQuiz={createMockQuiz}
                deleteQuiz={deleteQuiz}
                sectionText={sectionText}
                difficultyLabel={difficultyLabel}
              />
            </TabsContent>

            {/* Aba Flashcards */}
            <TabsContent value="flashcards" className="m-0 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Gerenciador de Memorização Ativa</h2>
                <Button onClick={() => setShowFlashcardForm(true)}><Plus className="mr-2 h-4 w-4" /> Criar Card</Button>
              </div>

              {showFlashcardForm && (
                <div className="max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                  <input type="text" placeholder="Frente: Pergunta ou conceito (Ex: Sinal de Murphy)" value={flashFront} onChange={(e) => setFlashFront(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none" />
                  <input type="text" placeholder="Verso: Resposta ou explicação clínica" value={flashBack} onChange={(e) => setFlashBack(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none" />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setShowFlashcardForm(false)}>Cancelar</Button>
                    <Button onClick={createFlashcard}>Salvar Card</Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {flashcards.map((card) => (
                  <div key={card.id} className="relative group">
                    <FlashcardPreview card={card} config={flashcardConfig} />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-hero-muted hover:text-destructive transition" onClick={() => deleteFlashcard(card.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default FolderDetail;
