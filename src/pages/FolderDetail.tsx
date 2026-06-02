import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Target,
  FolderOpen,
  Plus,
  Trash2,
  Youtube,
  CheckCircle2,
  Send,
  Layers3,
  Upload,
  ChevronLeft,
  SlidersHorizontal,
  Folder,
  BookOpen,
  Sparkles,
  RefreshCw,
  Award
} from "lucide-react";
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
  fileDataUrl?: string;
  createdAt: string;
  sourceType?: "pdf" | "video" | "note" | "chat" | "file" | "image";
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type QuizType = "multiple_choice" | "case_study" | "mixed";
type Difficulty = "easy" | "medium" | "hard" | "expert";

type QuizConfig = {
  quizType: QuizType;
  difficulty: Difficulty;
  questionCount: number;
};

type QuizQuestion = {
  id: string;
  type: "multiple" | "open";
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
  aiFeedback?: string;
};

type QuizHistoryItem = {
  id: string;
  title: string;
  createdAt: string;
  questions: QuizQuestion[];
  correctCount: number;
  wrongCount: number;
  correctPercentage: number;
  completed: boolean;
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

const FOLDERS_STORAGE_KEY = "medlearn_folders";
const folderColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

const defaultQuizConfig: QuizConfig = {
  quizType: "mixed",
  difficulty: "medium",
  questionCount: 4,
};

const FolderDetail = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { folderId, subFolderId } = useParams<{ folderId: string; subFolderId?: string }>();
  const navigate = useNavigate();

  const [storedFolders, setStoredFolders] = useState<FolderItem[]>([]);
  const SUBFOLDERS_STORAGE_KEY = `folder_${folderId}_subfolders`;
  const FOLDER_MATERIALS_STORAGE_KEY = `folder_${folderId}_materials`;

  const [folderMaterials, setFolderMaterials] = useState<MaterialItem[]>([]);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [subFolders, setSubFolders] = useState<SubFolder[]>([]);
  const [newSubFolderName, setNewSubFolderName] = useState("");
  const [newSubFolderColor, setNewSubFolderColor] = useState(folderColors[0]);
  const [showCreateSubFolder, setShowCreateSubFolder] = useState(false);

  const [materialType, setMaterialType] = useState<MaterialType>("file");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialContent, setMaterialContent] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ name: string; mime: string; size: number; dataUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeWorkspaceMaterial, setActiveWorkspaceMaterial] = useState<MaterialItem | null>(null);
  const [workspaceToolTab, setWorkspaceToolTab] = useState<string>("chat");

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiCorrecting, setIsAiCorrecting] = useState(false);
  const [chatInputs, setChatInputs] = useState<{ [id: string]: string }>({});
  const [chatHistories, setChatHistories] = useState<{ [id: string]: ChatMessage[] }>({});
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizHistoryItem | null>(null);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>(defaultQuizConfig);
  const [showQuizConfig, setShowQuizConfig] = useState(false);

  const [contextFlashcards, setContextFlashcards] = useState<{ [id: string]: FlashcardItem[] }>({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [selectionMenu, setSelectionMenu] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (saved) { try { setStoredFolders(JSON.parse(saved)); } catch {} }
  }, []);

  const folder = storedFolders.find((f) => f.id === folderId);

  useEffect(() => {
    if (!folderId) return;
    const saved = localStorage.getItem(SUBFOLDERS_STORAGE_KEY);
    if (saved) { try { setSubFolders(JSON.parse(saved)); } catch {} }
  }, [folderId, SUBFOLDERS_STORAGE_KEY]);

  useEffect(() => {
    if (!folderId) return;
    localStorage.setItem(SUBFOLDERS_STORAGE_KEY, JSON.stringify(subFolders));
  }, [subFolders, folderId, SUBFOLDERS_STORAGE_KEY]);

  useEffect(() => {
    if (!folderId) return;
    const saved = localStorage.getItem(FOLDER_MATERIALS_STORAGE_KEY);
    if (saved) { try { setFolderMaterials(JSON.parse(saved)); } catch {} }
  }, [folderId, FOLDER_MATERIALS_STORAGE_KEY]);

  useEffect(() => {
    if (!folderId) return;
    localStorage.setItem(FOLDER_MATERIALS_STORAGE_KEY, JSON.stringify(folderMaterials));
  }, [folderMaterials, folderId, FOLDER_MATERIALS_STORAGE_KEY]);

  const currentMaterials = useMemo(() => {
    const sub = subFolders.find(s => s.id === subFolderId);
    return sub ? sub.materials : folderMaterials;
  }, [subFolderId, subFolders, folderMaterials]);

  const currentActiveContextId = useMemo(() => {
    if (activeWorkspaceMaterial) return `material:${activeWorkspaceMaterial.id}`;
    return subFolderId ? `subfolder:${subFolderId}` : `folder:${folderId}`;
  }, [activeWorkspaceMaterial, subFolderId, folderId]);

  useEffect(() => {
    const contextKey = `ctx_data_${currentActiveContextId}`;
    const saved = localStorage.getItem(contextKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.chat) setChatHistories(prev => ({ ...prev, [currentActiveContextId]: parsed.chat }));
        if (parsed.quiz) setQuizHistory(parsed.quiz);
        if (parsed.flashcards) setContextFlashcards(prev => ({ ...prev, [currentActiveContextId]: parsed.flashcards }));
      } catch {}
    }
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setActiveQuiz(null);
  }, [currentActiveContextId]);

  useEffect(() => {
    if (!currentActiveContextId) return;
    const contextKey = `ctx_data_${currentActiveContextId}`;
    const data = {
      chat: chatHistories[currentActiveContextId] || [],
      quiz: quizHistory,
      flashcards: contextFlashcards[currentActiveContextId] || []
    };
    localStorage.setItem(contextKey, JSON.stringify(data));
  }, [chatHistories, quizHistory, contextFlashcards, currentActiveContextId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({ name: file.name, mime: file.type, size: file.size, dataUrl: reader.result as string });
      if (!materialTitle) setMaterialTitle(file.name.split('.').slice(0, -1).join('.'));
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

    if (subFolderId) {
      setSubFolders(subFolders.map(s => s.id === subFolderId ? { ...s, materials: [newMaterial, ...s.materials] } : s));
    } else {
      setFolderMaterials([newMaterial, ...folderMaterials]);
    }
    setMaterialTitle(""); setMaterialContent(""); setMaterialUrl(""); setSelectedFile(null); setShowAddMaterial(false);
  };

  const deleteMaterial = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (subFolderId) {
      setSubFolders(subFolders.map(s => s.id === subFolderId ? { ...s, materials: s.materials.filter(m => m.id !== id) } : s));
    } else {
      setFolderMaterials(folderMaterials.filter(m => m.id !== id));
    }
    if (activeWorkspaceMaterial?.id === id) setActiveWorkspaceMaterial(null);
  };

  const executeGeminiCall = async (prompt: string) => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error("VITE_GEMINI_API_KEY ausente.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!res.ok) throw new Error("Rejeição da API.");
    const json = await res.json();
    return json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  };

  const handleSendWorkspaceChat = async () => {
    const currentInput = chatInputs[currentActiveContextId]?.trim();
    if (!currentInput) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: currentInput, createdAt: new Date().toISOString() };
    const previousHistory = chatHistories[currentActiveContextId] || [];
    const nextHistory = [...previousHistory, userMsg];

    setChatHistories(prev => ({ ...prev, [currentActiveContextId]: nextHistory }));
    setChatInputs(prev => ({ ...prev, [currentActiveContextId]: "" }));
    setIsAiLoading(true);

    try {
      let promptPayload = "";
      if (activeWorkspaceMaterial) {
        promptPayload = `Você é o MedLearn AI, um Tutor Médico Inteligente. Analise este documento e responda com precisão semiológica. Forneça a Fonte no final.\nArquivo: ${activeWorkspaceMaterial.title}\nConteúdo: ${activeWorkspaceMaterial.content || activeWorkspaceMaterial.fileName || ""}\n\nPergunta: ${userMsg.content}`;
      } else {
        const aggregator = currentMaterials.map((m, i) => `[Doc ${i+1} - ${m.title}]: ${m.content || m.fileName || ""}`).join("\n\n");
        promptPayload = `Você é o MedLearn AI. Analise a pasta de estudos inteira que contém os seguintes materiais e responda cruzando os dados.\nMateriais:\n${aggregator}\n\nPergunta: ${userMsg.content}`;
      }

      const aiReply = await executeGeminiCall(promptPayload);
      setChatHistories(prev => ({
        ...prev,
        [currentActiveContextId]: [...nextHistory, { id: crypto.randomUUID(), role: "assistant", content: aiReply, createdAt: new Date().toISOString() }]
      }));
    } catch (err: any) {
      setChatHistories(prev => ({
        ...prev,
        [currentActiveContextId]: [...nextHistory, { id: crypto.randomUUID(), role: "assistant", content: `⚠️ Erro: ${err.message}`, createdAt: new Date().toISOString() }]
      }));
    } finally { setIsAiLoading(false); }
  };

  const handleGenerateWorkspaceQuiz = async () => {
    setIsAiLoading(true);
    setShowQuizConfig(false);

    let contextData = activeWorkspaceMaterial ? (activeWorkspaceMaterial.content || activeWorkspaceMaterial.title) : currentMaterials.map(m => m.content || m.title).join("\n");

    const prompt = `Gere uma avaliação médica de alta qualidade em formato JSON puro (sem marcação de bloco \`\`\`json), contendo uma mescla de questões de múltipla escolha e casos clínicos abertos dissertativos. Baseie-se estritamente neste contexto:
${contextData || "Conceitos fundamentais da medicina clínica."}

Configurações do simulado:
- Quantidade total de itens: ${quizConfig.questionCount}
- Nível de Rigor Técnico: ${quizConfig.difficulty}
- Distribuição: mescle itens onde o tipo é "multiple" (com opções de A a D) e itens onde o tipo é "open" (sem opções, para digitação analítica).

Responda unicamente a estrutura válida do Array JSON:
[
  {
    "id": "1",
    "type": "multiple",
    "questionText": "Enunciado da questão de múltipla escolha...",
    "options": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
    "correctAnswer": "A) Opção 1",
    "explanation": "Explicação anatômica ou fisiopatológica do gabarito."
  },
  {
    "id": "2",
    "type": "open",
    "questionText": "Apresentação de um caso clínico complexo exigindo que o aluno elabore a hipótese diagnóstica ou conduta imediata...",
    "correctAnswer": "Critérios obrigatórios e palavras-chave que devem constar em uma resposta de alto nível para este caso.",
    "explanation": "Espelho de correção médica completo detalhando os pilares que justificam a conduta correta."
  }
]`;

    try {
      const raw = await executeGeminiCall(prompt);
      const cleanJson = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const questions = JSON.parse(cleanJson) as QuizQuestion[];

      const newQuiz: QuizHistoryItem = {
        id: crypto.randomUUID(),
        title: activeWorkspaceMaterial ? `Simulado: ${activeWorkspaceMaterial.title}` : "Avaliação Dinâmica da Pasta",
        createdAt: new Date().toISOString(),
        questions,
        correctCount: 0,
        wrongCount: 0,
        correctPercentage: 0,
        completed: false
      };

      setQuizHistory([newQuiz]);
      setActiveQuiz(newQuiz);
    } catch {
      alert("Falha ao montar o mapeamento do simulado. Tente gerar novamente.");
    } finally { setIsAiLoading(false); }
  };

  const handleUpdateOpenAnswerText = (qId: string, txt: string) => {
    if (!activeQuiz) return;
    const questions = activeQuiz.questions.map(q => q.id === qId ? { ...q, userAnswer: txt } : q);
    setActiveQuiz({ ...activeQuiz, questions });
  };

  const handleAnswerMultipleQuestion = (qId: string, opt: string) => {
    if (!activeQuiz) return;
    const questions = activeQuiz.questions.map(q => q.id === qId ? { ...q, userAnswer: opt, isCorrect: q.correctAnswer === opt } : q);
    setActiveQuiz({ ...activeQuiz, questions });
  };

  const handleFinalizeAndCorrectQuiz = async () => {
    if (!activeQuiz) return;
    setIsAiCorrecting(true);

    const openQuestions = activeQuiz.questions.filter(q => q.type === "open");
    let questionsWithAiFeedback = [...activeQuiz.questions];

    if (openQuestions.length > 0) {
      for (let i = 0; i < questionsWithAiFeedback.length; i++) {
        const q = questionsWithAiFeedback[i];
        if (q.type === "open" && q.userAnswer) {
          const correctionPrompt = `Aja como uma banca examinadora de Residência Médica. Avalie a resposta dissertativa digitada pelo aluno para a seguinte questão:
Enunciado: ${q.questionText}
Espelho Esperado de Correção: ${q.correctAnswer}

Resposta redigida pelo Aluno: "${q.userAnswer}"

Analise se a resposta está semanticamente correta, se contém os termos técnicos adequados e se a conduta foi precisa.
Responda exclusivamente em formato JSON com esta estrutura (sem blocos markdown):
{"isCorrect": true ou false, "feedback": "Crítica construtiva de até 3 linhas detalhando o que faltou ou validando o acerto do aluno."}`;

          try {
            const rawEvaluation = await executeGeminiCall(correctionPrompt);
            const cleanEval = rawEvaluation.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsedEval = JSON.parse(cleanEval);
            
            questionsWithAiFeedback[i] = {
              ...q,
              isCorrect: parsedEval.isCorrect,
              aiFeedback: parsedEval.feedback
            };
          } catch {
            questionsWithAiFeedback[i] = { ...q, isCorrect: true, aiFeedback: "Resposta aceita pela banca automática." };
          }
        } else if (q.type === "open" && !q.userAnswer) {
          questionsWithAiFeedback[i] = { ...q, isCorrect: false, aiFeedback: "Questão deixada em branco pelo candidato." };
        }
      }
    }

    const totalCorrect = questionsWithAiFeedback.filter(q => q.isCorrect).length;
    const percent = Math.round((totalCorrect / questionsWithAiFeedback.length) * 100);

    const finalizedQuiz: QuizHistoryItem = {
      ...activeQuiz,
      questions: questionsWithAiFeedback,
      correctCount: totalCorrect,
      wrongCount: questionsWithAiFeedback.length - totalCorrect,
      correctPercentage: percent,
      completed: true
    };

    setActiveQuiz(finalizedQuiz);
    setIsAiCorrecting(false);
  };

  const handleGenerateWorkspaceFlashcards = async () => {
    setIsAiLoading(true);
    let referenceText = activeWorkspaceMaterial ? (activeWorkspaceMaterial.content || activeWorkspaceMaterial.title) : currentMaterials.map(m => m.title).join("\n");

    const prompt = `Gere 4 Flashcards em formato JSON puro (sem markdown) baseados neste contexto: ${referenceText}\n\nEstrutura: [{"id":"1","front":"Pergunta?","back":"Resposta."}]`;
    try {
      const raw = await executeGeminiCall(prompt);
      const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      setContextFlashcards(prev => ({ ...prev, [currentActiveContextId]: JSON.parse(clean) }));
      setCurrentCardIndex(0); setIsCardFlipped(false);
    } catch { alert("Erro na geração."); }
    finally { setIsAiLoading(false); }
  };

  const handleCardEvaluation = (result: "correct" | "wrong") => {
    const cards = contextFlashcards[currentActiveContextId] || [];
    const updatedCards = cards.map((c, i) => i === currentCardIndex ? { ...c, lastResult: result } : c);
    setContextFlashcards(prev => ({ ...prev, [currentActiveContextId]: updatedCards }));

    if (currentCardIndex < cards.length - 1) {
      setIsCardFlipped(false);
      setTimeout(() => { setCurrentCardIndex(prev => prev + 1); }, 200);
    } else { alert("Fim deste bloco de revisão espaçada!"); }
  };

  const handleTextSelection = (e: React.MouseEvent) => {
    const txt = window.getSelection()?.toString().trim();
    if (txt && txt.length > 5) {
      setSelectionMenu({ text: txt, x: e.clientX, y: e.clientY - 45 });
    } else { setSelectionMenu(null); }
  };

  const handleExplainSelection = async () => {
    if (!selectionMenu) return;
    const txt = selectionMenu.text; setSelectionMenu(null);

    const oldHistory = chatHistories[currentActiveContextId] || [];
    const triggerMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: `Explique o seguinte trecho:\n"${txt}"`, createdAt: new Date().toISOString() };
    const nextHistory = [...oldHistory, triggerMsg];

    setChatHistories(prev => ({ ...prev, [currentActiveContextId]: nextHistory }));
    setIsAiLoading(true); setWorkspaceToolTab("chat");

    try {
      const reply = await executeGeminiCall(`Como um preceptor médico, explique resumidamente este trecho de estudo selecionado:\n\n"${txt}"`);
      setChatHistories(prev => ({
        ...prev,
        [currentActiveContextId]: [...nextHistory, { id: crypto.randomUUID(), role: "assistant", content: reply, createdAt: new Date().toISOString() }]
      }));
    } catch (err: any) {
      setChatHistories(prev => ({
        ...prev,
        [currentActiveContextId]: [...nextHistory, { id: crypto.randomUUID(), role: "assistant", content: `⚠️ Erro`, createdAt: new Date().toISOString() }]
      }));
    } finally { setIsAiLoading(false); }
  };

  const activeCardsList = contextFlashcards[currentActiveContextId] || [];
  const activeCard = activeCardsList[currentCardIndex] || null;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex font-sans antialiased selection:bg-primary/30 select-none">
      
      {/* SIDEBAR GERAL */}
      <div className={cn("border-r border-white/5 bg-[#0a0e1a] flex flex-col transition-all duration-300 relative z-20", sidebarOpen ? "w-80" : "w-0 overflow-hidden border-r-0")}>
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0e1324]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-sm truncate max-w-[150px] text-white">{folder?.name || "MedLearn"}</span>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => setSidebarOpen(false)}>
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subpastas Médicas</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10 rounded-lg" onClick={() => setShowCreateSubFolder(!showCreateSubFolder)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {showCreateSubFolder && (
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <input type="text" placeholder="Nome do sub-bloco" value={newSubFolderName} onChange={(e) => setNewSubFolderName(e.target.value)} className="w-full bg-[#060913] border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 text-xs h-7 bg-primary text-white" onClick={createSubFolder}>Criar</Button>
                  <Button size="sm" variant="ghost" className="flex-1 text-xs h-7 text-slate-400" onClick={() => setShowCreateSubFolder(false)}>Cancelar</Button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <button onClick={() => { navigate(`/folders/${folderId}`); setActiveWorkspaceMaterial(null); }} className={cn("w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2.5 transition", !subFolderId ? "bg-primary text-white font-medium" : "hover:bg-white/5 text-slate-400")}>
                <Folder className="h-4 w-4" /> Contexto Geral da Pasta
              </button>
              {subFolders.map(s => (
                <button key={s.id} onClick={() => { navigate(`/folders/${folderId}/sub/${s.id}`); setActiveWorkspaceMaterial(null); }} className={cn("w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2.5 transition", subFolderId === s.id ? "bg-primary text-white font-medium" : "hover:bg-white/5 text-slate-400")}>
                  <Folder className="h-4 w-4" /> {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL ESPACIAL CENTRAL */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060913]">
        <header className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-[#0a0e1a]">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" className="text-slate-300" onClick={() => setSidebarOpen(true)}>
                <FolderOpen className="h-5 w-5 text-primary" />
              </Button>
            )}
            <h1 className="text-xs font-bold text-slate-200">
              {folder?.name} {subFolderId && `> ${subFolders.find(s => s.id === subFolderId)?.name}`}
            </h1>
          </div>
          {activeWorkspaceMaterial && (
            <Button size="sm" variant="ghost" className="text-xs text-slate-400 hover:text-white h-8" onClick={() => setActiveWorkspaceMaterial(null)}>
              ← Sair do Documento
            </Button>
          )}
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* PAINEL ESQUERDO: MATERIAL DA GRADE OU LEITOR DE ARQUIVOS */}
          <div className="lg:col-span-7 border-r border-white/5 flex flex-col overflow-y-auto p-6 bg-[#080c16]">
            {activeWorkspaceMaterial ? (
              <div className="flex flex-col h-full space-y-4" onMouseUp={handleTextSelection}>
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-wider">{activeWorkspaceMaterial.sourceType}</span>
                  <h2 className="text-xs font-bold text-white">{activeWorkspaceMaterial.title}</h2>
                </div>

                <div className="flex-1 bg-[#090e1c] rounded-xl border border-white/5 overflow-hidden relative shadow-inner p-3 min-h-[460px]">
                  {activeWorkspaceMaterial.sourceType === "pdf" && activeWorkspaceMaterial.fileDataUrl && (
                    <iframe src={activeWorkspaceMaterial.fileDataUrl} className="w-full h-full rounded-lg" title="PDF workspace" />
                  )}
                  {activeWorkspaceMaterial.sourceType === "image" && activeWorkspaceMaterial.fileDataUrl && (
                    <div className="w-full h-full flex items-center justify-center">
                      <img src={activeWorkspaceMaterial.fileDataUrl} alt="Clinical view" className="max-w-full max-h-full rounded-xl object-contain" />
                    </div>
                  )}
                  {activeWorkspaceMaterial.sourceType === "note" && (
                    <div className="text-slate-300 text-xs leading-relaxed font-sans whitespace-pre-wrap select-text p-2">
                      {activeWorkspaceMaterial.content}
                    </div>
                  )}
                  {activeWorkspaceMaterial.sourceType === "video" && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-black/10">
                      <Youtube className="h-10 w-10 text-red-500 mb-1" />
                      <a href={activeWorkspaceMaterial.url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Ver Vídeo Aula Completa ↗</a>
                    </div>
                  )}

                  {/* Popover IA flutuante */}
                  <AnimatePresence>
                    {selectionMenu && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute z-50 bg-[#121729] border border-primary/30 p-1 rounded-xl shadow-2xl" style={{ top: selectionMenu.y - 40, left: Math.min(selectionMenu.x - 120, 360) }}>
                        <button onClick={handleExplainSelection} className="text-[10px] bg-primary text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition">
                          <Sparkles className="h-3 w-3" /> Explicar Trecho Selecionado
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">Central de Documentos de Apoio ({currentMaterials.length})</h2>
                    <p className="text-[10px] text-slate-400">Abra um documento local para desbloquear simulados dissertativos e revisões por IA.</p>
                  </div>
                  <Button className="bg-primary text-white rounded-xl text-xs h-9" onClick={() => setShowAddMaterial(!showAddMaterial)}>
                    <Plus className="h-4 w-4 mr-1" /> Novo Arquivo
                  </Button>
                </div>

                {showAddMaterial && (
                  <div className="p-4 bg-[#0a0e1c] border border-white/5 rounded-xl space-y-3 shadow-2xl">
                    <div className="flex gap-1 border-b border-white/5 pb-2">
                      <Button variant={materialType === "file" ? "default" : "ghost"} size="sm" className="text-[10px] h-6" onClick={() => setMaterialType("file")}>📎 Upload PDF/Imagem</Button>
                      <Button variant={materialType === "note" ? "default" : "ghost"} size="sm" className="text-[10px] h-6" onClick={() => setMaterialType("note")}>📝 Escrever Nota</Button>
                    </div>

                    <input type="text" placeholder="Nome do arquivo ou anotação..." value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} className="w-full bg-[#060913] border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />

                    {materialType === "file" && (
                      <div className="border border-dashed border-white/10 rounded-xl p-4 text-center bg-[#060913]" onClick={() => fileInputRef.current?.click()}>
                        <input type="file" ref={fileInputRef} accept="application/pdf,image/*" onChange={handleFileChange} className="hidden" />
                        <Upload className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                        <span className="text-[10px] text-slate-300 block">{selectedFile ? selectedFile.name : "Clique para carregar arquivo do aparelho"}</span>
                      </div>
                    )}
                    {materialType === "note" && (
                      <textarea rows={3} placeholder="Texto do resumo..." value={materialContent} onChange={(e) => setMaterialContent(e.target.value)} className="w-full bg-[#060913] border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                    )}

                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" className="text-xs h-8 text-slate-400" onClick={() => setShowAddMaterial(false)}>Cancelar</Button>
                      <Button size="sm" className="text-xs h-8 bg-primary text-white px-4" onClick={saveMaterial}>Salvar no Contexto</Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentMaterials.map(m => (
                    <div key={m.id} onClick={() => setActiveWorkspaceMaterial(m)} className="p-4 rounded-xl border border-white/5 bg-[#0a0f1d] hover:border-primary/40 cursor-pointer transition flex flex-col justify-between h-32 group relative shadow-lg">
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-300 uppercase">{m.sourceType}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition" onClick={(e) => deleteMaterial(m.id, e)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <h3 className="text-xs font-bold text-slate-200 mt-2 line-clamp-1">{m.title}</h3>
                      </div>
                      <span className="text-[9px] text-slate-500">Adicionado em {new Date(m.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PAINEL DIREITO: ABAS DE IA INTEGRADA */}
          <div className="lg:col-span-5 flex flex-col bg-[#070a14] overflow-hidden">
            <Tabs value={workspaceToolTab} onValueChange={setWorkspaceToolTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-3 bg-[#0a0e1a] rounded-none border-b border-white/5 h-12 p-0">
                <TabsTrigger value="chat" className="text-xs rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/5 text-slate-400 data-[state=active]:text-white">💬 Chat Tutor</TabsTrigger>
                <TabsTrigger value="quiz" className="text-xs rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/5 text-slate-400 data-[state=active]:text-white">🎯 Simulados</TabsTrigger>
                <TabsTrigger value="cards" className="text-xs rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white/5 text-slate-400 data-[state=active]:text-white">🃏 Flashcards</TabsTrigger>
              </TabsList>

              {/* ABA CHAT */}
              <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 p-4 space-y-4">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {(chatHistories[currentActiveContextId] || []).map(msg => (
                    <div key={msg.id} className={cn("p-3 rounded-xl max-w-[85%] text-xs leading-relaxed font-sans shadow", msg.role === "user" ? "bg-primary text-white ml-auto" : "bg-[#0d1224] text-slate-200 border border-white/5")}>
                      {msg.content}
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="bg-[#0d1224] text-slate-400 p-3 rounded-xl text-xs border border-white/5 w-fit flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 animate-spin text-primary" /> MedLearn AI analisando conduta...
                    </div>
                  )}
                </div>
                <div className="flex gap-2 bg-[#0a0e1a] border border-white/5 p-2 rounded-xl">
                  <input type="text" placeholder="Pergunte ao preceptor sobre a matéria..." value={chatInputs[currentActiveContextId] || ""} onChange={(e) => setChatInputs({ ...chatInputs, [currentActiveContextId]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleSendWorkspaceChat()} className="flex-1 bg-transparent text-xs text-white outline-none px-2" />
                  <Button size="icon" className="h-8 w-8 bg-primary text-white rounded-lg" onClick={handleSendWorkspaceChat}>
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </TabsContent>

              {/* ABA SIMULADOS */}
              <TabsContent value="quiz" className="flex-1 flex flex-col overflow-y-auto m-0 p-4">
                {!activeQuiz ? (
                  <div className="text-center py-12 space-y-4">
                    <Target className="h-10 w-10 text-slate-600 mx-auto" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">Banca Examinadora de IA</h3>
                      <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto mt-1">Gere testes mistos (questões objetivas + casos clínicos dissertativos) baseados no seu material.</p>
                    </div>
                    <Button className="bg-primary text-white text-xs rounded-xl px-6 shadow-md" onClick={() => setShowQuizConfig(true)}> Gerar Nova Avaliação</Button>

                    {showQuizConfig && (
                      <div className="p-4 bg-[#0a0e1a] border border-white/5 rounded-xl text-left space-y-3 max-w-sm mx-auto shadow-2xl mt-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Questões</label>
                        <input type="number" min={2} max={10} value={quizConfig.questionCount} onChange={(e) => setQuizConfig({ ...quizConfig, questionCount: parseInt(e.target.value) || 4 })} className="w-full bg-[#060913] border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                        <Button className="w-full bg-primary text-white text-xs h-9 rounded-lg font-bold" onClick={handleGenerateWorkspaceQuiz}>Confirmar e Iniciar</Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-xs font-bold text-white">{activeQuiz.title}</h3>
                      <Button size="sm" variant="ghost" className="text-[10px] text-red-400 h-6" onClick={() => setActiveQuiz(null)}>Abandonar</Button>
                    </div>

                    <div className="space-y-6">
                      {activeQuiz.questions.map((q, idx) => (
                        <div key={q.id} className="p-4 bg-[#0d1224] border border-white/5 rounded-xl space-y-3 relative shadow-md">
                          <span className="text-[9px] font-black uppercase text-primary tracking-widest block">Questão {idx + 1} ({q.type === "multiple" ? "Múltipla Escolha" : "Dissertativa"})</span>
                          <p className="text-xs text-slate-200 font-medium leading-relaxed">{q.questionText}</p>

                          {q.type === "multiple" && q.options && (
                            <div className="space-y-1.5 pt-1">
                              {q.options.map(opt => {
                                const isSelected = q.userAnswer === opt;
                                return (
                                  <button key={opt} disabled={activeQuiz.completed} onClick={() => handleAnswerMultipleQuestion(q.id, opt)} className={cn("w-full text-left p-2.5 rounded-lg text-xs border transition flex items-center justify-between", isSelected ? "bg-primary/20 border-primary text-white" : "bg-[#060913] border-white/5 text-slate-400 hover:bg-white/5")}>
                                    <span>{opt}</span>
                                    {activeQuiz.completed && q.correctAnswer === opt && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "open" && (
                            <div className="space-y-2 pt-1">
                              <textarea rows={3} disabled={activeQuiz.completed} placeholder="Digite sua conduta médica detalhada..." value={q.userAnswer || ""} onChange={(e) => handleUpdateOpenAnswerText(q.id, e.target.value)} className="w-full bg-[#060913] border border-white/10 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-primary/50" />
                              {activeQuiz.completed && q.aiFeedback && (
                                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg space-y-1.5 mt-2">
                                  <span className="text-[9px] font-bold text-primary block flex items-center gap-1"><Award className="h-3 w-3" /> Avaliação da Banca AI:</span>
                                  <p className="text-[11px] text-slate-300 italic">"{q.aiFeedback}"</p>
                                  <p className="text-[11px] text-slate-400 mt-1"><strong className="text-[10px] text-emerald-400">Gabarito Esperado:</strong> {q.correctAnswer}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {activeQuiz.completed && (
                            <div className={cn("text-[10px] font-bold flex items-center gap-1 mt-2", q.isCorrect ? "text-emerald-400" : "text-red-400")}>
                              {q.isCorrect ? "✓ Resposta Correta" : "✕ Resposta Incorreta"}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {!activeQuiz.completed ? (
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl mt-4 shadow-lg" disabled={isAiCorrecting} onClick={handleFinalizeAndCorrectQuiz}>
                        {isAiCorrecting ? "Banca Avaliando Escrita..." : "Finalizar e Entregar para Correção"}
                      </Button>
                    ) : (
                      <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2 mt-4">
                        <h4 className="text-xs font-bold text-white">Resultado Consolidado</h4>
                        <p className="text-2xl font-black text-primary">{activeQuiz.correctPercentage}%</p>
                        <p className="text-[10px] text-slate-400">Você acertou {activeQuiz.correctCount} de {activeQuiz.questions.length} questões.</p>
                        <Button size="sm" variant="ghost" className="text-xs text-primary mt-1" onClick={() => setActiveQuiz(null)}>Gerar Outro Teste</Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* ABA FLASHCARDS */}
              <TabsContent value="cards" className="flex-1 flex flex-col overflow-y-auto m-0 p-4">
                {activeCardsList.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">Revisão Espaçada (Anki)</h3>
                      <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto mt-1">Crie cards de memorização ativa gerados por inteligência artificial.</p>
                    </div>
                    <Button className="bg-primary text-white text-xs rounded-xl px-5 shadow" onClick={handleGenerateWorkspaceFlashcards}>Gerar Flashcards</Button>
                  </div>
                ) : (
                  <div className="space-y-6 flex flex-col items-center justify-center py-4">
                    <div className="w-full max-w-sm h-48 perspective cursor-pointer" onClick={() => setIsCardFlipped(!isCardFlipped)}>
                      <div className={cn("w-full h-full duration-500 transform-style relative rounded-2xl border border-white/5 shadow-2xl p-6 flex flex-col items-center justify-center text-center select-text transition-transform", isCardFlipped ? "rotate-y-180 bg-[#0e1424]" : "bg-[#0a0f1d]")}>
                        {!isCardFlipped ? (
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest block">Frente (Pergunta)</span>
                            <p className="text-xs font-bold text-white leading-relaxed">{activeCard?.front}</p>
                          </div>
                        ) : (
                          <div className="space-y-2 rotate-y-180">
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Verso (Resposta)</span>
                            <p className="text-xs text-slate-200 leading-relaxed font-sans">{activeCard?.back}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-slate-500">Card {currentCardIndex + 1} de {activeCardsList.length}</div>

                    {isCardFlipped && (
                      <div className="flex gap-3 w-full max-w-sm justify-center">
                        <Button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold flex-1 h-9 rounded-xl border border-red-500/30" onClick={() => handleCardEvaluation("wrong")}>Errei</Button>
                        <Button className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold flex-1 h-9 rounded-xl border border-emerald-500/30" onClick={() => handleCardEvaluation("correct")}>Acertei</Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderDetail;
