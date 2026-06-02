import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  ArrowLeft,
  Brain,
  Loader2,
  LogOut,
  MessageSquarePlus,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Thread = { id: string; title: string; language: string; updated_at: string };
type Message = { id: string; role: "user" | "assistant" | "system"; content: string };

const PLACEHOLDER: Record<string, string> = {
  pt: "Pergunte ao tutor sobre qualquer tema médico...",
  en: "Ask the tutor anything about medicine...",
  es: "Pregúntale al tutor sobre cualquier tema médico...",
};
const EMPTY_TITLE: Record<string, string> = {
  pt: "Tutor IA Médico",
  en: "AI Medical Tutor",
  es: "Tutor IA Médico",
};
const EMPTY_HINT: Record<string, string> = {
  pt: "Faça uma pergunta para começar uma nova conversa.",
  en: "Ask a question to start a new conversation.",
  es: "Haz una pregunta para iniciar una nueva conversación.",
};
const NEW_LABEL: Record<string, string> = { pt: "Nova conversa", en: "New chat", es: "Nuevo chat" };

const Tutor = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language } = useLanguage();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load threads
  useEffect(() => {
    if (!user) return;
    supabase
      .from("chat_threads")
      .select("id,title,language,updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setThreads((data as Thread[]) ?? []));
  }, [user]);

  // Ensure there's an active thread; if no threadId, create or pick one
  useEffect(() => {
    if (!user) return;
    if (threadId) return;
    (async () => {
      const { data: existing } = await supabase
        .from("chat_threads")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing?.id) {
        navigate(`/tutor/${existing.id}`, { replace: true });
        return;
      }
      const { data: created, error } = await supabase
        .from("chat_threads")
        .insert({ user_id: user.id, title: NEW_LABEL[language] ?? "Nova conversa", language })
        .select("id")
        .single();
      if (error || !created) {
        toast.error(error?.message ?? "Erro ao criar conversa");
        return;
      }
      navigate(`/tutor/${created.id}`, { replace: true });
    })();
  }, [user, threadId, navigate, language]);

  // Load messages for active thread
  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }
    setLoadingThread(true);
    supabase
      .from("chat_messages")
      .select("id,role,content")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data as Message[]) ?? []);
        setLoadingThread(false);
        setTimeout(() => textareaRef.current?.focus(), 50);
      });
  }, [threadId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const createThread = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: user.id, title: NEW_LABEL[language] ?? "Nova conversa", language })
      .select("id,title,language,updated_at")
      .single();
    if (error || !data) {
      toast.error(error?.message ?? "Erro");
      return;
    }
    setThreads((t) => [data as Thread, ...t]);
    navigate(`/tutor/${data.id}`);
  };

  const deleteThread = async (id: string) => {
    const { error } = await supabase.from("chat_threads").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setThreads((t) => t.filter((x) => x.id !== id));
    if (id === threadId) navigate("/tutor", { replace: true });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !threadId || sending) return;
    setInput("");
    setSending(true);
    const optimisticUser: Message = { id: `tmp-${Date.now()}`, role: "user", content: text };
    setMessages((m) => [...m, optimisticUser]);

    try {
      const { data, error } = await supabase.functions.invoke("tutor-chat", {
        body: { threadId, message: text, language },
      });
      if (error) throw error;
      const reply = (data as { reply?: string; error?: string })?.reply;
      const errMsg = (data as { error?: string })?.error;
      if (!reply) throw new Error(errMsg ?? "Sem resposta");
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", content: reply },
      ]);
      // refresh thread title list
      supabase
        .from("chat_threads")
        .select("id,title,language,updated_at")
        .order("updated_at", { ascending: false })
        .then(({ data: t }) => setThreads((t as Thread[]) ?? []));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao falar com a IA";
      toast.error(msg);
    } finally {
      setSending(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-white flex">
      {/* Sidebar */}
      <aside className="w-72 hidden md:flex flex-col border-r border-white/5 bg-[#0a0e1a]">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-xs text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
          <LanguageSwitcher />
        </div>
        <div className="p-3">
          <Button
            onClick={createThread}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl text-xs h-9"
          >
            <MessageSquarePlus className="h-4 w-4 mr-1" /> {NEW_LABEL[language]}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {threads.length === 0 && (
            <p className="text-[10px] text-slate-500 px-3 py-4 text-center">—</p>
          )}
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2 text-xs transition cursor-pointer",
                t.id === threadId
                  ? "bg-primary/15 text-white"
                  : "hover:bg-white/5 text-slate-300",
              )}
            >
              <button
                onClick={() => navigate(`/tutor/${t.id}`)}
                className="flex-1 text-left truncate"
              >
                {t.title || NEW_LABEL[language]}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(t.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 ml-2"
                aria-label="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={async () => {
            await signOut();
            navigate("/auth");
          }}
          className="p-4 border-t border-white/5 text-xs text-slate-400 hover:text-white flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/5 flex items-center px-4 md:px-6 gap-3 bg-[#0a0e1a]">
          <button
            onClick={() => navigate("/dashboard")}
            className="md:hidden text-slate-300"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Brain className="h-5 w-5 text-primary" />
          <h1 className="text-sm font-bold">{EMPTY_TITLE[language]}</h1>
          <div className="ml-auto md:hidden">
            <LanguageSwitcher />
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-10 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {loadingThread && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
            {!loadingThread && messages.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{EMPTY_TITLE[language]}</h2>
                <p className="text-sm text-slate-400">{EMPTY_HINT[language]}</p>
              </div>
            )}

            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="text-slate-100 text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-headings:text-white prose-strong:text-white prose-a:text-primary">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ),
            )}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {language === "en" ? "Thinking..." : language === "es" ? "Pensando..." : "Pensando..."}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/5 bg-[#0a0e1a] px-4 md:px-10 py-4">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={PLACEHOLDER[language]}
              rows={1}
              className="flex-1 resize-none bg-[#060913] border-white/10 text-sm rounded-2xl min-h-[44px] max-h-40"
              disabled={sending || !threadId}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !input.trim() || !threadId}
              size="icon"
              className="h-11 w-11 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tutor;
