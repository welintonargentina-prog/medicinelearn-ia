import { useParams, Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye,
  FileCode,
  Sparkles,
  RefreshCw,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";

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
  fileDataUrl?: string; // Armazena o arquivo em Base64 para visualização direta
  createdAt: string;
  sourceType?: "pdf" | "video" | "note" | "chat" | "file" | "image";
  sourceTitle?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type QuizType = "multiple_choice" | "open" | "mixed" | "case_study";
type Difficulty = "easy" | "medium" | "hard" | "expert";
type CorrectionMode = "instant" | "end";

type QuizConfig = {
  quizType: QuizType;
  difficulty: Difficulty;
  questionCount: number;
  timerEnabled: boolean;
  timerMinutes: number;
  correctionMode: CorrectionMode;
};

type QuizQuestion = {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
};

type QuizHistoryItem = {
  id: string;
  title: string;
  createdAt: string;
  type: string;
  questionCount: number;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  correctCount: number;
  wrongCount: number;
  correctPercentage: number;
  completed: boolean;
};

type FlashcardDisplayMode = "click-to-flip";
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
  lastResult?: "correct" | "wrong";
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
const folderColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

const defaultQuizConfig: QuizConfig = {
  quizType: "multiple_choice",
  difficulty: "medium",
  questionCount: 5,
  timerEnabled: false,
  timerMinutes: 15,
  correctionMode: "end",
};

const defaultFlashcardConfig: FlashcardConfig = {
  displayMode: "click-to-flip",
  answerPosition: "back",
};

const createEmptyContext = (): StudyContextData => ({
  chatHistory: [],
  quizHistory: [],
  flashcards: [],
  flashcardReviews: [],
  quizConfig: defaultQuizConfig,
  flashcardConfig: defaultFlashcardConfig,
});

const tabTriggerClass = "data-[state=active]:bg-white/15 data-[state=active]:border data-[state=active]:border-white/20 data-[state=active]:text-hero-foreground data-[state=active]:shadow-md text-hero-muted px-4 py-2.5 transition-all text-sm font-medium";

const FolderDetail = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { folderId, subFolderId } = useParams<{ folderId: string; subFolderId?: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Estados principais de dados
  const [storedFolders, setStoredFolders] = useState<FolderItem[]>([]);
  const SUBFOLDERS_STORAGE_KEY = `folder_${folderId}_subfolders`;
  const FOLDER_MATERIALS_STORAGE_KEY = `folder_${folderId}_materials`;

  const [folderMaterials, setFolderMaterials] = useState<MaterialItem[]>([]);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [subFolders, setSubFolders] = useState<SubFolder[]>([]);
  const [selectedSubFolderId, setSelectedSubFolderId] = useState<string | null>(null);
  const [showCreateSubFolder, setShowCreateSubFolder] = useState(false);
  const [newSubFolderName, setNewSubFolderName] = useState("");
  const [newSubFolderColor, setNewSubFolderColor] = useState(folderColors[0]);

  // Estados do formulário de criação de material
  const [materialType, setMaterialType] = useState<MaterialType>("note");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialContent, setMaterialContent] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ name: string; mime: string; size: number; dataUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de visualização premium e chats dedicados por arquivo
  const [activePreviewMaterial, setActivePreviewMaterial] = useState<MaterialItem | null>(null);
  const [documentChatInput, setDocumentChatInput] = useState("");
  const [documentChats, setDocumentChats] = useState<{ [materialId: string]: ChatMessage[] }>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectionMenu, setSelectionMenu] = useState<{ text: string; x: number; y: number } | null>(null);

  // Estados de Chat Global, Simulados e Flashcards
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>(defaultQuizConfig);
  const [activeQuiz, setActiveQuiz] = useState<QuizHistoryItem | null>(null);
  const [showQuizConfig, setShowQuizConfig] = useState(false);

  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [flashcardConfig, setFlashcardConfig] = useState<FlashcardConfig>(defaultFlashcardConfig);
  const [flashcardReviews, setFlashcardReviews] = useState<FlashcardReviewItem[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [showFlashcardForm, setShowFlashcardForm] = useState(false);
  const [flashFront, setFlashFront] = useState("");
  const [flashBack, setFlashBack] = useState("");
  const [reviewFilterWrong, setReviewFilterWrong] = useState(false);

  // Carregar pastas principais
  useEffect(() => {
    const savedFolders = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (savedFolders) {
      try { setStoredFolders(JSON.parse(savedFolders)); } catch { setStoredFolders([]); }
    }
  }, []);

  const folder = storedFolders.find((f) => f.id === folderId);

  // Carregar subpastas
  useEffect(() => {
    if (!folderId) return;
    const saved = localStorage.getItem(SUBFOLDERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SubFolder[];
        setSubFolders(parsed);
        if (subFolderId) {
          setSelectedSubFolderId(parsed.some((sub) => sub.id === subFolderId) ? subFolderId : null);
        }
      } catch { setSubFolders([]); }
    }
  }, [folderId, subFolderId, SUBFOLDERS_STORAGE_KEY]);

  useEffect(() => {
    if (!folderId) return;
    localStorage.setItem(SUBFOLDERS_STORAGE_KEY, JSON.stringify(subFolders));
  }, [subFolders, folderId, SUBFOLDERS_STORAGE_KEY]);

  // Carregar materiais da pasta raiz
  useEffect(() => {
    if (!folderId) return;
    const saved = localStorage.getItem(FOLDER_MATERIALS_STORAGE_KEY);
    if (saved) {
      try { setFolderMaterials(JSON.parse(saved)); } catch { setFolderMaterials([]); }
    }
  }, [folderId, FOLDER_MATERIALS_STORAGE_KEY]);

  useEffect(() => {
    if (!folderId) return;
    localStorage.setItem(FOLDER_MATERIALS_STORAGE_KEY, JSON.stringify(folderMaterials));
  }, [folderMaterials, folderId, FOLDER_MATERIALS_STORAGE_KEY]);

  const selectedSubFolder = subFolders.find((sub) => sub.id === selectedSubFolderId) || null;
  const activeContextId = selectedSubFolder ? `folder:${folderId}/subfolder:${selectedSubFolder.id}` : `folder:${folderId}`;
  const CONTEXT_STORAGE_KEY = `study_context_${activeContextId}`;
  const DOC_CHATS_STORAGE_KEY = `doc_chats_${activeContextId}`;

  // Carregar contextos isolados de estudo e histórico de chats locais
  useEffect(() => {
    if (!activeContextId) return;
    const saved = localStorage.getItem(CONTEXT_STORAGE_KEY);
    const savedDocChats = localStorage.getItem(DOC_CHATS_STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StudyContextData;
        setChatHistory(parsed.chatHistory || []);
        setQuizHistory(parsed.quizHistory || []);
        setFlashcards(parsed.flashcards || []);
        setQuizConfig(parsed.quizConfig || defaultQuizConfig);
        setFlashcardConfig(parsed.flashcardConfig || defaultFlashcardConfig);
        setFlashcardReviews(parsed.flashcardReviews || []);
      } catch { setChatHistory([]); }
    } else {
      const empty = createEmptyContext();
      setChatHistory(empty.chatHistory);
      setQuizHistory(empty.quizHistory);
      setFlashcards(empty.flashcards);
    }

    if (savedDocChats) {
      try { setDocumentChats(JSON.parse(savedDocChats)); } catch { setDocumentChats({}); }
    } else { setDocumentChats({}); }

    setActivePreviewMaterial(null);
    setCurrentFlashcardIndex(0);
    setIsFlashcardFlipped(false);
    setActiveQuiz(null);
  }, [CONTEXT_STORAGE_KEY, DOC_CHATS_STORAGE_KEY, activeContextId]);

  // Salvar contextos automáticos
  useEffect(() => {
    if (!activeContextId) return;
    const data: StudyContextData = { chatHistory, quizHistory, flashcards, flashcardReviews, quizConfig, flashcardConfig };
    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(data));
  }, [chatHistory, quizHistory, flashcards, quizConfig, flashcardConfig, flashcardReviews, CONTEXT_STORAGE_KEY, activeContextId]);

  useEffect(() => {
    if (!activeContextId) return;
    localStorage.setItem(DOC_CHATS_STORAGE_KEY, JSON.stringify(documentChats));
  }, [documentChats, DOC_CHATS_STORAGE_KEY, activeContextId]);

  const currentMaterials = useMemo(() => {
    return selectedSubFolder ? selectedSubFolder.materials : folderMaterials;
  }, [selectedSubFolder, folderMaterials]);

  // Utilitários de Upload de Arquivos Locais para Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        name: file.name,
        mime: file.type,
        size: file.size,
        dataUrl: reader.result as string,
      });
      if (!materialTitle) {
        setMaterialTitle(file.name.split('.').slice(0, -1).join('.'));
      }
    };
    reader.readAsDataURL(file);
  };

  const createSubFolder = () => {
    if (!newSubFolderName.trim() || !folderId) return;
    const newFolder: SubFolder = {
      id: crypto.randomUUID(),
      name: newSubFolderName.trim(),
      color: newSubFolderColor,
      createdAt: new Date().toISOString(),
      materials: [],
    };
    setSubFolders([newFolder, ...subFolders]);
    setNewSubFolderName("");
    setShowCreateSubFolder(false);
    navigate(`/folders/${folderId}/sub/${newFolder.id}`);
  };

  const saveMaterial = () => {
    if (!materialTitle.trim() && materialType !== "file") return;

    const isPdf = selectedFile?.mime === "application/pdf";
    const isImage = selectedFile?.mime.startsWith("image/");

    const newMaterial: MaterialItem = {
      id: crypto.randomUUID(),
      title: materialTitle.trim() || selectedFile?.name || "Arquivo",
      type: materialType,
      content: materialType === "note" ? materialContent : undefined,
      url: materialType === "youtube" ? materialUrl : undefined,
      fileName: materialType === "file" ? selectedFile?.name : undefined,
      fileMime: materialType === "file" ? selectedFile?.mime : undefined,
      fileSize: materialType === "file" ? selectedFile?.size : undefined,
      fileDataUrl: materialType === "file" ? selectedFile?.dataUrl : undefined,
      createdAt: new Date().toISOString(),
      sourceType: materialType === "youtube" ? "video" : materialType === "file" ? (isPdf ? "pdf" : isImage ? "image" : "file") : "note",
    };

    if (selectedSubFolder) {
      setSubFolders(subFolders.map(sub => sub.id === selectedSubFolder.id ? { ...sub, materials: [newMaterial, ...sub.materials] } : sub));
    } else {
      setFolderMaterials([newMaterial, ...folderMaterials]);
    }

    setMaterialTitle("");
    setMaterialContent("");
    setMaterialUrl("");
    setSelectedFile(null);
    setShowAddMaterial(false);
  };

  const deleteMaterial = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedSubFolder) {
      setSubFolders(subFolders.map(sub => sub.id === selectedSubFolder.id ? { ...sub, materials: sub.materials.filter(m => m.id !== id) } : sub));
    } else {
      setFolderMaterials(folderMaterials.filter(m => m.id !== id));
    }
    if (activePreviewMaterial?.id === id) setActivePreviewMaterial(null);
  };

  // INTERFACE DE REQUISIÇÃO DIRETA AO SERVIDOR DO GEMINI (Cura Definitiva do erro 404 V1)
  const callGeminiApi = async (prompt: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Chave VITE_GEMINI_API_KEY não configurada no painel da Vercel.");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      throw new Error("Erro na comunicação com os servidores centrais do Google Gemini.");
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível extrair dados estruturados.";
  };

  // CHAT 1: Chat Tutor Isolado (Dúvidas Gerais Rápidas)
  const sendGlobalChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: chatInput.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextHistory = [...chatHistory, userMessage];
    setChatHistory(nextHistory);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const prompt = `Você é o MedLearn AI, um tutor acadêmico em medicina de alta performance. Responda à seguinte dúvida isolada do aluno usando termos semiológicos precisos:\n\nPergunta: ${userMessage.content}`;
      const aiReply = await callGeminiApi(prompt);

      setChatHistory([...nextHistory, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiReply,
        createdAt: new Date().toISOString(),
      }]);
    } catch (err: any) {
      setChatHistory([...nextHistory, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `❌ ${err.message || "Erro de conexão com o Gemini."}`,
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // CHAT 2: Chat de Pasta/Contexto Completo (Cruza informações de múltiplos documentos com Fontes)
  const sendPastaChatMessage = async () => {
    if (!documentChatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: documentChatInput.trim(),
      createdAt: new Date().toISOString(),
    };

    // Usamos o ID da pasta como chave geral do chat da pasta
    const currentChatId = activePreviewMaterial ? activePreviewMaterial.id : "PASTA_ROOT";
    const oldHistory = documentChats[currentChatId] || [];
    const nextHistory = [...oldHistory, userMessage];

    setDocumentChats({ ...documentChats, [currentChatId]: nextHistory });
    setDocumentChatInput("");
    setIsAiLoading(true);

    try {
      let prompt = "";
      if (activePreviewMaterial) {
        // Chat focado em um documento único
        prompt = `Você é o MedLearn AI. Analise o documento exclusivo abaixo fornecido pelo estudante de medicina.
Documento Ativo: [${activePreviewMaterial.title}]
Tipo: ${activePreviewMaterial.sourceType}
Conteúdo Base: ${activePreviewMaterial.content || activePreviewMaterial.fileName || "Arquivo carregado via armazenamento local."}

Responda à pergunta do aluno. No final da resposta, adicione uma linha em negrito chamada "Fonte de Evidência:" especificando o nome do arquivo, e se for possível estimar o trecho, a indicação de localização do dado.

Pergunta: ${userMessage.content}`;
      } else {
        // Chat cruzado de toda a pasta
        const contextText = currentMaterials.map((m, i) => `[Doc ${i+1} - ${m.title} (${m.sourceType})]: ${m.content || m.fileName || ""}`).join("\n\n");
        prompt = `Você é o MedLearn AI. Analise a pasta de estudos completa que contém múltiplos documentos cruzados.
Materiais da Pasta:
${contextText || "Nenhum documento adicionado ainda."}

Responda à pergunta correlacionando os documentos. No final de sua resposta, você DEVE gerar uma seção estruturada chamada "Fontes Citadas:", listando quais arquivos possuem aquela informação (ex: "Fonte: Nota de Aula de Anatomia" ou "Fonte: Página Ref/Timestamp estimado").

Pergunta: ${userMessage.content}`;
      }

      const aiReply = await callGeminiApi(prompt);
      setDocumentChats({
        ...documentChats,
        [currentChatId]: [...nextHistory, { id: crypto.randomUUID(), role: "assistant", content: aiReply, createdAt: new Date().toISOString() }]
      });
    } catch (err: any) {
      setDocumentChats({
        ...documentChats,
        [currentChatId]: [...nextHistory, { id: crypto.randomUUID(), role: "assistant", content: `⚠️ ${err.message}`, createdAt: new Date().toISOString() }]
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Gerenciador de Seleção de Texto para Atalhos de IA (Explicar/Copiar)
  const handleTextSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 5) {
      setSelectionMenu({
        text: selectedText,
        x: e.clientX,
        y: e.clientY - 45
      });
    } else {
      setSelectionMenu(null);
    }
  };

  const handleExplainSelection = async () => {
    if (!selectionMenu) return;
    const textToExplain = selectionMenu.text;
    setSelectionMenu(null);

    const currentChatId = activePreviewMaterial ? activePreviewMaterial.id : "PASTA_ROOT";
    const oldHistory = documentChats[currentChatId] || [];
    
    const userTriggerMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: `Explique o seguinte trecho selecionado deste material:\n"${textToExplain}"`,
      createdAt: new Date().toISOString()
    };

    const nextHistory = [...oldHistory, userTriggerMessage];
    setDocumentChats({ ...documentChats, [currentChatId]: nextHistory });
    setIsAiLoading(true);

    try {
      const prompt = `Como um Tutor Médico Inteligente, explique de forma didática e profunda o seguinte trecho acadêmico selecionado pelo aluno dentro de seus materiais:\n\n"${textToExplain}"`;
      const reply = await callGeminiApi(prompt);
      setDocumentChats({
        ...documentChats,
        [currentChatId]: [...nextHistory, { id: crypto.randomUUID(), role: "assistant", content: reply, createdAt: new Date().toISOString() }]
      });
    } catch (err: any) {
      setDocumentChats({
        ...documentChats,
        [currentChatId]: [...nextHistory, { id: crypto.randomUUID(), role: "assistant", content: `⚠️ Erro: ${err.message}`, createdAt: new Date().toISOString() }]
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // SISTEMA DE SIMULADOS DE ALTA PERFORMANCE (Geração Premium Real de Questões via Gemini)
  const generateAiQuiz = async () => {
    setIsAiLoading(true);
    setShowQuizConfig(false);

    const contextText = currentMaterials.map((m, i) => `[Material ${i+1}]: ${m.content || m.title}`).join("\n");

    const prompt = `Gere um simulado de medicina completo em formato JSON estrito, baseado no seguinte contexto de estudos:
${contextText || "Temas gerais de semiologia e prática clínica médica."}

Configurações requeridas:
- Quantidade de Questões: ${quizConfig.questionCount}
- Nível de Dificuldade: ${quizConfig.difficulty}
- Tipo: ${quizConfig.quizType === 'multiple_choice' ? 'Múltipla Escolha' : 'Caso Clínico/Abertas'}

Você DEVE responder UNICAMENTE um array JSON puro, sem blocos markdown (\`\`\`json), contendo objetos com esta estrutura exata:
[
  {
    "id": "1",
    "questionText": "Frase da questão...",
    "options": ["A) opção", "B) opção", "C) opção", "D) opção"],
    "correctAnswer": "A) opção",
    "explanation": "Explicação médica detalhada do porquê está certa."
  }
]`;

    try {
      const rawJson = await callGeminiApi(prompt);
      // Tratamento preventivo de markdown injetado pela IA
      const cleanJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedQuestions = JSON.parse(cleanJson) as QuizQuestion[];

      const newQuiz: QuizHistoryItem = {
        id: crypto.randomUUID(),
        title: selectedSubFolder ? `Simulado IA - ${selectedSubFolder.name}` : `Simulado IA - ${folder?.name}`,
        createdAt: new Date().toISOString(),
        type: quizConfig.quizType,
        difficulty: quizConfig.difficulty,
        questionCount: parsedQuestions.length,
        questions: parsedQuestions,
        correctCount: 0,
        wrongCount: 0,
        correctPercentage: 0,
        completed: false
      };

      setQuizHistory([newQuiz, ...quizHistory]);
      setActiveQuiz(newQuiz);
    } catch (err) {
      console.error("Erro na montagem do JSON do simulado:", err);
      alert("O servidor do Gemini gerou um padrão de texto instável. Por favor, tente clicar para gerar novamente.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const answerQuizQuestion = (questionId: string, answer: string) => {
    if (!activeQuiz) return;

    const updatedQuestions = activeQuiz.questions.map(q => {
      if (q.id === questionId) {
        const isCorrect = q.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase();
        return { ...q, userAnswer: answer, isCorrect };
      }
      return q;
    });

    const isInstant = quizConfig.correctionMode === "instant";
    const isLastQuestion = updatedQuestions.every(q => q.userAnswer !== undefined);

    let correctCount = updatedQuestions.filter(q => q.isCorrect).length;
    let wrongCount = updatedQuestions.filter(q => q.userAnswer && !q.isCorrect).length;
    let percent = Math.round((correctCount / updatedQuestions.length) * 100);

    const updatedQuiz: QuizHistoryItem = {
      ...activeQuiz,
      questions: updatedQuestions,
      correctCount,
      wrongCount,
      correctPercentage: percent,
      completed: quizConfig.correctionMode === "end" ? isLastQuestion : activeQuiz.completed
    };

    setActiveQuiz(updatedQuiz);
    setQuizHistory(quizHistory.map(q => q.id === activeQuiz.id ? updatedQuiz : q));
  };

  const finalizeQuiz = () => {
    if (!activeQuiz) return;
    const finalQuiz = { ...activeQuiz, completed: true };
    setActiveQuiz(finalQuiz);
    setQuizHistory(quizHistory.map(q => q.id === activeQuiz.id ? finalQuiz : q));
  };

  // SISTEMA DE FLASHCARDS INTERATIVOS PREMIUM COM REPASSO DE ERROS
  const generateAiFlashcards = async () => {
    setIsAiLoading(true);
    const contextText = currentMaterials.map(m => m.content || m.title).join("\n");

    const prompt = `Gere 5 Flashcards de alto rendimento para memorização em medicina baseados neste contexto:
${contextText || "Prática médica diária."}

Responda UNICAMENTE um array JSON puro, sem marcações markdown:
[
  {
    "id": "id_aleatorio",
    "front": "Pergunta concisa sobre conceito ou sinal clínico?",
    "back": "Resposta direta e mnemônica."
  }
]`;

    try {
      const rawJson = await callGeminiApi(prompt);
      const cleanJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedCards = JSON.parse(cleanJson) as FlashcardItem[];

      setFlashcards([...parsedCards, ...flashcards]);
      setCurrentFlashcardIndex(0);
      setIsFlashcardFlipped(false);
    } catch (err) {
      alert("Erro ao montar flashcards estruturados automaticamente.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const logFlashcardResult = (cardId: string, result: "correct" | "wrong") => {
    const newReview: FlashcardReviewItem = {
      id: crypto.randomUUID(),
      flashcardId: cardId,
      createdAt: new Date().toISOString(),
      result
    };

    setFlashcardReviews([newReview, ...flashcardReviews]);
    setFlashcards(flashcards.map(f => f.id === cardId ? { ...f, lastResult: result } : f));

    if (currentFlashcardIndex < filteredFlashcards.length - 1) {
      setIsFlashcardFlipped(false);
      setTimeout(() => {
        setCurrentFlashcardIndex(prev => prev + 1);
      }, 200);
    } else {
      alert("Você completou este bloco de flashcards de medicina!");
    }
  };

  const filteredFlashcards = useMemo(() => {
    if (reviewFilterWrong) {
      return flashcards.filter(f => f.lastResult === "wrong");
    }
    return flashcards;
  }, [flashcards, reviewFilterWrong]);

  const activeFlashcard = filteredFlashcards[currentFlashcardIndex] || null;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex font-sans antialiased selection:bg-primary/30 selection:text-white">
      
      {/* SIDEBAR DA PLATAFORMA */}
      <div className={cn("border-r border-white/5 bg-[#0f1424] flex flex-col transition-all duration-300 relative z-20", sidebarOpen ? "w-80" : "w-0 overflow-hidden border-r-0")}>
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#131a30]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-base tracking-tight truncate max-w-[160px] text-white">{folder?.name || "Pasta"}</span>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-white/5 text-slate-400" onClick={() => setSidebarOpen(false)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 border-b border-white/5">
          <Button className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 text-xs rounded-xl h-10 transition-all" onClick={() => navigate("/folders")}>
            <ArrowLeft className="mr-2 h-4 w-4 text-primary" /> Voltar para o Dashboard
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subpastas Médicas</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10 rounded-lg" onClick={() => setShowCreateSubFolder(!showCreateSubFolder)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {showCreateSubFolder && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3 shadow-xl">
                <input
                  type="text"
                  placeholder="Ex: Sistema Cardiovascular"
                  value={newSubFolderName}
                  onChange={(e) => setNewSubFolderName(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs outline-none text-white focus:border-primary/5
                  0"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {folderColors.map((c) => (
                    <button key={c} type="button" className={cn("w-5 h-5 rounded-full border border-white/10 transition", newSubFolderColor === c && "scale-125 ring-2 ring-primary")} style={{ backgroundColor: c }} onClick={() => setNewSubFolderColor(c)} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 text-xs h-8 bg-primary hover:bg-primary/90 text-white" onClick={createSubFolder}>Criar</Button>
                  <Button size="sm" variant="ghost" className="flex-1 text-xs h-8 text-slate-300 hover:bg-white/5" onClick={() => setShowCreateSubFolder(false)}>Cancelar</Button>
                </div>
              </motion.div>
            )}

            <div className="space-y-1">
              <button
                onClick={() => { setSelectedSubFolderId(null); navigate(`/folders/${folderId}`); }}
                className={cn("w-full text-left px-3.5 py-2.5 rounded-xl text-sm flex items-center justify-between transition border border-transparent", !selectedSubFolderId ? "bg-primary font-medium text-white shadow-lg shadow-primary/20 border-primary/20" : "hover:bg-white/5 text-slate-300")}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder className="h-4 w-4" style={{ color: !selectedSubFolderId ? '#fff' : folder?.color }} />
                  <span className="truncate">Contexto Geral</span>
                </div>
              </button>

              {subFolders.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => { setSelectedSubFolderId(sub.id); navigate(`/folders/${folderId}/sub/${sub.id}`); }}
                  className={cn("w-full text-left px-3.5 py-2.5 rounded-xl text-sm flex items-center justify-between transition border border-transparent", selectedSubFolderId === sub.id ? "bg-primary font-medium text-white shadow-lg shadow-primary/20 border-primary/20" : "hover:bg-white/5 text-slate-300")}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className="h-4 w-4" style={{ color: selectedSubFolderId === sub.id ? '#fff' : sub.color }} />
                    <span className="truncate">{sub.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA CENTRAL DE CONTEÚDO */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-[#0b0f19]">
        <header className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-[#0f1424]">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" className="hover:bg-white/5 text-slate-300 mr-2" onClick={() => setSidebarOpen(true)}>
                <FolderOpen className="h-5 w-5 text-primary" />
              </Button>
            )}
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {selectedSubFolder ? selectedSubFolder.name : "Contexto Geral da Pasta"}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="materials" className="w-full h-full flex flex-col">
            <div className="px-6 bg-[#0f1424] border-b border-white/5">
              <TabsList className="bg-transparent gap-2 h-12 p-0 border-b-0">
                <TabsTrigger value="materials" className={tabTriggerClass}>📋 Materiais</TabsTrigger>
                <TabsTrigger value="chat_pasta" className={tabTriggerClass}>🔬 Chat da Pasta ({currentMaterials.length} docs)</TabsTrigger>
                <TabsTrigger value="simulados" className={tabTriggerClass}>🎯 Simulados IA</TabsTrigger>
                <TabsTrigger value="flashcards" className={tabTriggerClass}>🎴 Flashcards Premium</TabsTrigger>
                <TabsTrigger value="chat_tutor" className={tabTriggerClass}>💬 Chat Tutor Isolado</TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: MATERIAIS DE ESTUDO (COM SUPORTE A UPLOAD DE ARQUIVOS LOCAIS REAL E LEITOR PREMIUM) */}
            <TabsContent value="materials" className="p-6 m-0 outline-none flex-1">
              <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Central de Materiais ({currentMaterials.length})</h2>
                    <p className="text-xs text-slate-400">Anexe PDFs, imagens médicas ou notas para alimentar o ecossistema de Inteligência Artificial.</p>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold px-4 py-2.5 flex items-center gap-2" onClick={() => setShowAddMaterial(true)}>
                    <Upload className="h-4 w-4" /> Adicionar Material Local
                  </Button>
                </div>

                {showAddMaterial && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-5 bg-[#121829] border border-white/5 rounded-2xl space-y-4 shadow-2xl">
                    <div className="flex gap-2 border-b border-white/5 pb-3">
                      <Button variant={materialType === "file" ? "default" : "ghost"} size="sm" className="text-xs rounded-lg" onClick={() => setMaterialType("file")}>📎 Arquivo do Aparelho (PDF/Imagem)</Button>
                      <Button variant={materialType === "note" ? "default" : "ghost"} size="sm" className="text-xs rounded-lg" onClick={() => setMaterialType("note")}>📝 Digitar Nota Médica</Button>
                      <Button variant={materialType === "youtube" ? "default" : "ghost"} size="sm" className="text-xs rounded-lg" onClick={() => setMaterialType("youtube")}>📺 Link YouTube</Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-300 block mb-1.5">Título Customizado do Material</label>
                        <input type="text" placeholder="Ex: Caderno de Semiologia Pulmonar" value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-primary/50" />
                      </div>

                      {materialType === "file" && (
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center bg-[#0b0f19] hover:border-primary/40 transition relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <input type="file" ref={fileInputRef} accept="application/pdf,image/*,text/plain" onChange={handleFileChange} className="hidden" />
                          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs font-medium text-slate-200">{selectedFile ? `Selecionado: ${selectedFile.name}` : "Clique para explorar os arquivos do seu celular ou computador"}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Suporta PDFs Acadêmicos, Imagens Clínicas (PNG/JPG) ou arquivos TXT</p>
                        </div>
                      )}

                      {materialType === "note" && (
                        <div>
                          <label className="text-xs font-medium text-slate-300 block mb-1.5">Conteúdo Textual</label>
                          <textarea rows={5} placeholder="Escreva aqui suas anotações médicas, resumos ou copie textos de artigos acadêmicos..." value={materialContent} onChange={(e) => setMaterialContent(e.target.value)} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-primary/50 resize-none font-mono" />
                        </div>
                      )}

                      {materialType === "youtube" && (
                        <div>
                          <label className="text-xs font-medium text-slate-300 block mb-1.5">Link Completo do Vídeo do YouTube</label>
                          <input type="text" placeholder="https://www.youtube.com/watch?v=..." value={materialUrl} onChange={(e) => setMaterialUrl(e.target.value)} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-primary/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="ghost" size="sm" className="text-slate-300 text-xs hover:bg-white/5 rounded-xl px-4" onClick={() => { setShowAddMaterial(false); setSelectedFile(null); }}>Cancelar</Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs rounded-xl px-5 font-semibold" onClick={saveMaterial}>Salvar na Grade</Button>
                    </div>
                  </motion.div>
                )}

                {/* VISUALIZADOR PREMIUM EM TELA DIVIDIDA (ESTILO YOULEARN / INTERACTIVE WORKSPACE) */}
                {activePreviewMaterial ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">
                    
                    {/* Painel Esquerdo: O Leitor Físico do Documento */}
                    <div className="lg:col-span-7 bg-[#101524] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
                      <div className="p-4 bg-[#141b2e] border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-xs font-bold text-white truncate max-w-[280px]">{activePreviewMaterial.title}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white" onClick={() => setActivePreviewMaterial(null)}>Fechar Leitor</Button>
                      </div>

                      {/* Espaço de Leitura com Seleção Inteligente de Texto */}
                      <div className="flex-1 p-6 overflow-y-auto bg-[#0b0f19]" onMouseUp={handleTextSelection}>
                        {activePreviewMaterial.sourceType === "pdf" && activePreviewMaterial.fileDataUrl && (
                          <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-4">
                            <iframe src={activePreviewMaterial.fileDataUrl} className="w-full h-full rounded-xl border border-white/5 shadow-inner" title="Leitor Integrado de PDF" />
                          </div>
                        )}

                        {activePreviewMaterial.sourceType === "image" && activePreviewMaterial.fileDataUrl && (
                          <div className="w-full h-full flex items-center justify-center p-2">
                            <img src={activePreviewMaterial.fileDataUrl} alt="Documentação Clínica" className="max-w-full max-h-full rounded-xl object-contain shadow-2xl border border-white/10" />
                          </div>
                        )}

                        {activePreviewMaterial.sourceType === "note" && (
                          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm select-text whitespace-pre-wrap font-sans">
                            {activePreviewMaterial.content}
                          </div>
                        )}

                        {activePreviewMaterial.sourceType === "video" && (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-black/20 rounded-xl border border-white/5">
                            <Youtube className="h-12 w-12 text-red-500 mb-2" />
                            <p className="text-xs font-semibold text-white mb-2">{activePreviewMaterial.title}</p>
                            <a href={activePreviewMaterial.url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Abrir vídeo completo em nova aba externa ↗</a>
                          </div>
                        )}

                        {/* Menu Popover Flutuante de IA na seleção de texto */}
                        <AnimatePresence>
                          {selectionMenu && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute z-50 bg-[#161d33] border border-primary/30 p-1 rounded-xl flex items-center gap-1 shadow-2xl" style={{ top: selectionMenu.y, left: selectionMenu.x }}>
                              <button onClick={handleExplainSelection} className="text-[10px] bg-primary/20 hover:bg-primary text-white font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition">
                                <Sparkles className="h-3 w-3 text-amber-400" /> Explicar Trecho com IA
                              </button>
                              <button onClick={() => { navigator.clipboard.writeText(selectionMenu.text); setSelectionMenu(null); }} className="text-[10px] hover:bg-white/5 text-slate-300 px-2 py-1.5 rounded-lg transition">
                                Copiar
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Painel Direito: Chat Exclusivo daquele Documento */}
                    <div className="lg:col-span-5 bg-[#101524] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                      <div className="p-4 bg-[#141b2e] border-b border-white/5 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold text-white">Chat Exclusivo do Documento</span>
                      </div>

                      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0d1222]">
                        {(documentChats[activePreviewMaterial.id] || []).length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6">
                            <MessageSquare className="h-8 w-8 mb-2 text-slate-600" />
                            <p className="text-xs font-medium">Faça perguntas exclusivas sobre este arquivo.</p>
                            <p className="text-[10px] text-slate-600 mt-1">Ex: "Quais os principais critérios diagnósticos citados na página 2?"</p>
                          </div>
                        ) : (
                          (documentChats[activePreviewMaterial.id] || []).map((msg) => (
                            <div key={msg.id} className={cn("p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-sm", msg.role === "user" ? "bg-primary text-white ml-auto" : "bg-white/5 border border-white/5 text-slate-200 mr-auto")}>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          ))
                        )}
                        {isAiLoading && (
                          <div className="bg-white/5 text-slate-400 p-3 rounded-2xl text-xs w-24 flex items-center gap-2 border border-white/5 animate-pulse">
                            <RefreshCw className="h-3 w-3 animate-spin text-primary" /> Processando...
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-[#141b2e] border-t border-white/5 flex gap-2">
                        <input type="text" placeholder="Discutir com a IA sobre este documento específico..." value={documentChatInput} onChange={(e) => setDocumentChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendPastaChatMessage()} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-3 text-xs text-white outline-none focus:border-primary/50" />
                        <Button size="icon" className="bg-primary hover:bg-primary/90 text-white rounded-xl h-9 w-9" onClick={sendPastaChatMessage}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Grade de Materiais Padrão */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentMaterials.length === 0 ? (
                      <div className="col-span-full border border-dashed border-white/10 rounded-2xl p-12 text-center text-slate-500">
                        <Folder className="h-10 w-10 mx-auto mb-2 text-slate-600" />
                        <p className="text-sm font-medium">Esta pasta médica está vazia no momento.</p>
                        <p className="text-xs text-slate-600 mt-1">Suba materiais locais para iniciar a leitura cruzada por IA.</p>
                      </div>
                    ) : (
                      currentMaterials.map((m) => (
                        <div key={m.id} onClick={() => setActivePreviewMaterial(m)} className="p-4 bg-[#101524] border border-white/5 rounded-2xl hover:border-primary/30 cursor-pointer transition flex flex-col justify-between group shadow-lg shadow-black/10">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider", m.sourceType === "pdf" ? "bg-red-500/10 text-red-400 border border-red-500/20" : m.sourceType === "image" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : m.sourceType === "video" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20")}>
                                {m.sourceType || m.type}
                              </span>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition rounded-lg" onClick={(e) => deleteMaterial(m.id, e)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition">{m.title}</h3>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {m.content || m.fileName || m.url || "Clique para abrir no painel interativo."}
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Abrir no Leitor IA</span>
                            <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: CHAT DA PASTA COMPLETO (ANÁLISE DE TODOS OS DOCUMENTOS CONJUNTOS COM FONTES) */}
            <TabsContent value="chat_pasta" className="p-6 m-0 outline-none flex-1">
              <div className="bg-[#101524] border border-white/5 rounded-2xl flex flex-col h-[550px] shadow-2xl">
                <div className="p-4 bg-[#141b2e] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Análise Cruzada com Inteligência Artificial</h3>
                      <p className="text-[10px] text-slate-400">Esta IA lê todos os {currentMaterials.length} documentos salvos juntos nesta pasta.</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0d1222]">
                  {(documentChats["PASTA_ROOT"] || []).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 max-w-sm mx-auto">
                      <Brain className="h-10 w-10 mb-2 text-primary/40" />
                      <p className="text-sm font-bold text-slate-300">Super Chat da Pasta Ativo</p>
                      <p className="text-xs text-slate-500 mt-1">Pergunte qualquer correlação. A IA gerará respostas contendo a citação das fontes estruturadas no final.</p>
                    </div>
                  ) : (
                    (documentChats["PASTA_ROOT"] || []).map((msg) => (
                      <div key={msg.id} className={cn("p-4 rounded-2xl text-xs max-w-[80%] leading-relaxed shadow-md whitespace-pre-wrap", msg.role === "user" ? "bg-primary text-white ml-auto" : "bg-white/5 border border-white/5 text-slate-200 mr-auto")}>
                        {msg.content}
                      </div>
                    ))
                  )}
                  {isAiLoading && (
                    <div className="bg-white/5 text-slate-400 p-3 rounded-2xl text-xs w-24 flex items-center gap-2 border border-white/5 animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin text-primary" /> Analisando...
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[#141b2e] border-t border-white/5 flex gap-3">
                  <input type="text" placeholder="Cruzar dados da pasta: 'Compare as condutas clínicas descritas nas minhas notas de aula...'" value={documentChatInput} onChange={(e) => setDocumentChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendPastaChatMessage()} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-4 text-xs text-white outline-none focus:border-primary/50" />
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold px-4 flex items-center gap-1.5" onClick={sendPastaChatMessage}>
                    <Send className="h-3.5 w-3.5" /> Enviar Prompt
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: SIMULADOS GERADOS EXCLUSIVAMENTE POR IA EM JSON REAL */}
            <TabsContent value="simulados" className="p-6 m-0 outline-none flex-1">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Simulados Clínicos Automatizados por IA</h2>
                    <p className="text-xs text-slate-400">Gere provas de múltipla escolha ou casos abertos com correção inteligente baseada em seus arquivos.</p>
                  </div>
                  {!activeQuiz && (
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold px-4 h-10" onClick={() => setShowQuizConfig(true)}>
                      <Target className="mr-2 h-4 w-4" /> Configurar Novo Simulado
                    </Button>
                  )}
                </div>

                {showQuizConfig && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-[#121829] border border-white/5 rounded-2xl space-y-4 shadow-2xl max-w-2xl">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" /> Ajustar Parâmetros da IA</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">Tipo de Questões</label>
                        <select value={quizConfig.quizType} onChange={(e) => setQuizConfig({ ...quizConfig, quizType: e.target.value as QuizType })} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none">
                          <option value="multiple_choice">Múltipla Escolha Clássica</option>
                          <option value="case_study">Casos Clínicos de Residência Médica</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">Nível de Rigor Intelectual</label>
                        <select value={quizConfig.difficulty} onChange={(e) => setQuizConfig({ ...quizConfig, difficulty: e.target.value as Difficulty })} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none">
                          <option value="easy">Graduação Inicial (Fácil)</option>
                          <option value="medium">Internato Clínico (Médio)</option>
                          <option value="hard">Residência Médica (Difícil)</option>
                          <option value="expert">Prova de Título de Especialista (Expert)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">Contagem de Questões</label>
                        <input type="number" min={1} max={20} value={quizConfig.questionCount} onChange={(e) => setQuizConfig({ ...quizConfig, questionCount: parseInt(e.target.value) || 5 })} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-2 text-xs text-white outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">Feedback de Correção</label>
                        <select value={quizConfig.correctionMode} onChange={(e) => setQuizConfig({ ...quizConfig, correctionMode: e.target.value as CorrectionMode })} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none">
                          <option value="end">Mostrar gabarito completo somente no final</option>
                          <option value="instant">Exibir correção detalhada após cada clique</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                      <Button variant="ghost" size="sm" className="text-xs rounded-xl" onClick={() => setShowQuizConfig(false)}>Cancelar</Button>
                      <Button size="sm" className="bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white font-semibold text-xs rounded-xl px-4 flex items-center gap-1" onClick={generateAiQuiz}>
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Compilar Questões com IA
                      </Button>
                    </div>
                  </motion.div>
                )}

                {isAiLoading && (
                  <div className="p-12 border border-white/5 rounded-2xl bg-[#101524] text-center space-y-3 max-w-md mx-auto">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <h3 className="text-sm font-bold text-white">O Gemini está lendo seus documentos...</h3>
                    <p className="text-xs text-slate-400">Cruzando terminologias semiológicas e estruturando uma avaliação de alto nível. Aguarde alguns segundos.</p>
                  </div>
                )}

                {/* Exibição Ativa do Simulado Rodando */}
                {activeQuiz && (
                  <div className="bg-[#101524] border border-white/5 rounded-2xl p-6 shadow-2xl max-w-3xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-white">{activeQuiz.title}</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-0.5 text-primary">Dificuldade: {activeQuiz.difficulty}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs text-red-400 hover:bg-red-500/10 rounded-xl" onClick={() => setActiveQuiz(null)}>Encerrar e Sair</Button>
                    </div>

                    <div className="space-y-6">
                      {activeQuiz.questions.map((q, idx) => {
                        const showGabarito = quizConfig.correctionMode === "instant" && q.userAnswer !== undefined || activeQuiz.completed;
                        return (
                          <div key={q.id} className="p-4 bg-[#0d1222] border border-white/5 rounded-xl space-y-3">
                            <p className="text-xs font-bold text-slate-300">Questão {idx + 1} de {activeQuiz.questionCount}</p>
                            <h4 className="text-sm font-semibold text-white leading-relaxed">{q.questionText}</h4>
                            
                            {q.options ? (
                              /* Múltipla Escolha */
                              <div className="grid grid-cols-1 gap-2 pt-2">
                                {q.options.map(opt => {
                                  const isSelected = q.userAnswer === opt;
                                  const isCorrectOpt = q.correctAnswer === opt;
                                  let optClass = "bg-white/5 border-white/5 text-slate-200 hover:bg-white/10";
                                  
                                  if (isSelected) optClass = "bg-primary/20 border-primary text-primary";
                                  if (showGabarito && isCorrectOpt) optClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-medium";
                                  if (showGabarito && isSelected && !q.isCorrect) optClass = "bg-red-500/20 border-red-500 text-red-400";

                                  return (
                                    <button key={opt} disabled={q.userAnswer !== undefined && quizConfig.correctionMode === "instant"} onClick={() => answerQuizQuestion(q.id, opt)} className={cn("w-full text-left p-3 border rounded-xl text-xs transition flex items-center justify-between", optClass)}>
                                      <span>{opt}</span>
                                      {showGabarito && isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              /* Caso Clínico Aberto */
                              <div className="space-y-2 pt-2">
                                <textarea disabled={showGabarito} rows={3} placeholder="Digite sua resposta analítica diagnóstica com embasamento..." onBlur={(e) => answerQuizQuestion(q.id, e.target.value)} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-xs text-white outline-none" />
                              </div>
                            )}

                            {showGabarito && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-white/5 rounded-xl border border-white/5 mt-3 text-[11px] text-slate-300 leading-relaxed">
                                <p className="font-bold text-amber-400">Gabarito comentado por IA:</p>
                                <p className="mt-1 font-medium text-slate-200">Resposta Correta: {q.correctAnswer}</p>
                                <p className="mt-1 text-slate-400">{q.explanation}</p>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!activeQuiz.completed && quizConfig.correctionMode === "end" && (
                      <div className="pt-4 border-t border-white/5 flex justify-end">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold px-5 h-10" onClick={finalizeQuiz}>
                          Finalizar e Corrigir Toda a Prova
                        </Button>
                      </div>
                    )}

                    {activeQuiz.completed && (
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                          <Award className="h-8 w-8 text-amber-400" />
                          <div>
                            <h4 className="text-sm font-bold text-white">Desempenho Geral do Aluno</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Acertos: {activeQuiz.correctCount} | Erros: {activeQuiz.wrongCount}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-white">{activeQuiz.correctPercentage}%</span>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Taxa de Acerto</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 4: FLASHCARDS COM LAYOUT PREMIUM DE CARTÃO EM GRADIENTE */}
            <TabsContent value="flashcards" className="p-6 m-0 outline-none flex-1">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Memorização Ativa e Repetição Espaçada</h2>
                    <p className="text-xs text-slate-400">Gere flashcards automaticamente com inteligência artificial para fixar termos severos de medicina.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className={cn("text-xs rounded-xl h-9", reviewFilterWrong && "bg-red-500/20 text-red-400 border border-red-500/30")} onClick={() => { setReviewFilterWrong(!reviewFilterWrong); setCurrentFlashcardIndex(0); }}>
                      {reviewFilterWrong ? "Mostrando apenas os que Errei" : "Filtrar por Erros"}
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold px-4 h-9" onClick={generateAiFlashcards}>
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> Gerar 5 com IA
                    </Button>
                  </div>
                </div>

                {isAiLoading && <div className="text-center text-xs p-12 text-slate-500 animate-pulse">Gerando novos cartões com o Gemini...</div>}

                {activeFlashcard ? (
                  <div className="flex flex-col items-center justify-center py-6 space-y-6 max-w-md mx-auto">
                    
                    {/* O Cartão Interativo que vira fisicamente */}
                    <div className="w-full [perspective:1000px] h-64" onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}>
                      <div className={cn("relative w-full h-full duration-500 [transform-style:preserve-3d] cursor-pointer rounded-2xl shadow-2xl border border-white/5", isFlashcardFlipped && "[transform:rotateY(180deg)]")}>
                        
                        {/* Frente */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1b233d] to-[#121829] p-6 flex flex-col justify-between rounded-2xl [backface-visibility:hidden]">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-primary">FRENTE: PERGUNTA</span>
                          <div className="flex-1 flex items-center justify-center text-center px-4">
                            <p className="text-base font-bold leading-relaxed text-white">{activeFlashcard.front}</p>
                          </div>
                          <span className="text-[10px] text-center text-slate-500">Clique em qualquer lugar para virar o cartão</span>
                        </div>

                        {/* Verso */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#122547] to-[#0d172a] p-6 flex flex-col justify-between rounded-2xl [transform:rotateY(180deg)] [backface-visibility:hidden] border border-primary/20">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">VERSO: GABARITO</span>
                          <div className="flex-1 flex items-center justify-center text-center px-4">
                            <p className="text-sm font-semibold leading-relaxed text-slate-200">{activeFlashcard.back}</p>
                          </div>
                          <span className="text-[10px] text-center text-slate-500">Avalie sua memória sincera abaixo</span>
                        </div>

                      </div>
                    </div>

                    <div className="text-xs font-medium text-slate-400">
                      Cartão {currentFlashcardIndex + 1} de {filteredFlashcards.length}
                    </div>

                    {/* Botões de Ação de Desempenho */}
                    {isFlashcardFlipped && (
                      <div className="flex gap-4 w-full">
                        <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-11 rounded-xl" onClick={() => logFlashcardResult(activeFlashcard.id, "wrong")}>
                          ❌ Errei (Repassar no final)
                        </Button>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 rounded-xl" onClick={() => logFlashcardResult(activeFlashcard.id, "correct")}>
                          ✅ Acertei de primeira!
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 border border-white/5 rounded-2xl text-center text-slate-500 max-w-sm mx-auto">
                    <Layers3 className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                    <p className="text-xs font-semibold">Nenhum flashcard ativo para revisar neste filtro.</p>
                  </div>
                )}

                {/* Dashboard do Aluno para as métricas dos Flashcards */}
                {flashcardReviews.length > 0 && (
                  <div className="bg-[#101524] border border-white/5 rounded-2xl p-4 max-w-md mx-auto grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-lg font-black text-emerald-400">{correctRate}%</span>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">Taxa de Sucesso</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-lg font-black text-red-400">{wrongRate}%</span>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">Taxa de Esquecimento</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 5: CHAT TUTOR ISOLADO (DÚVIDAS ACADÊMICAS RÁPIDAS QUE NÃO DEPENDEM DOS RESUMOS) */}
            <TabsContent value="chat_tutor" className="p-6 m-0 outline-none flex-1">
              <div className="bg-[#101524] border border-white/5 rounded-2xl flex flex-col h-[550px] shadow-2xl">
                <div className="p-4 bg-[#141b2e] border-b border-white/5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">💬 Consultório de Dúvidas Rápidas</h3>
                  <p className="text-[10px] text-slate-400">Use este canal para validações clínicas externas que não estão salvas nos seus documentos da pasta.</p>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0d1222]">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 max-w-xs mx-auto">
                      <MessageSquare className="h-8 w-8 mb-2 text-slate-600" />
                      <p className="text-xs font-bold text-slate-300">Faça perguntas isoladas à IA</p>
                      <p className="text-[10px] text-slate-600 mt-1">Ex: "Qual o mecanismo de ação farmacológico dos betabloqueadores adrenérgicos na insuficiência cardíaca crônica?"</p>
                    </div>
                  ) : (
                    chatHistory.map((msg) => (
                      <div key={msg.id} className={cn("p-3.5 rounded-2xl text-xs max-w-[80%] leading-relaxed shadow-md whitespace-pre-wrap", msg.role === "user" ? "bg-primary text-white ml-auto" : "bg-white/5 border border-white/5 text-slate-200 mr-auto")}>
                        {msg.content}
                      </div>
                    ))
                  )}
                  {isAiLoading && <div className="text-xs text-slate-500 animate-pulse pl-2">O Tutor está formulando a resposta acadêmica...</div>}
                </div>

                <div className="p-4 bg-[#141b2e] border-t border-white/5 flex gap-2">
                  <input type="text" placeholder="Pergunte qualquer dúvida acadêmica..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendGlobalChatMessage()} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-4 text-xs text-white outline-none focus:border-primary/50" />
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs px-4" onClick={sendGlobalChatMessage}>Enviar</Button>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>

    </div>
  );
};

export default FolderDetail;
