import { useState } from "react";
import { QuizResult, QuizQuestion } from "@/types/quiz";
import { QuizTaker } from "./QuizTaker";
import { QuizResults } from "./QuizResults";
import { QuizList } from "./QuizList";
import { Button } from "@/components/ui/button";
import { generateMockQuiz } from "@/data/mockQuizData";
import { getHistoryForFolder, saveQuizResult } from "@/lib/quizStorage";
import { Play, Flame, RotateCcw, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  folderId: string;
}

type View = "list" | "taking" | "result";

export function SimuladosTab({ folderId }: Props) {
  const [view, setView] = useState<View>("list");
  const [history, setHistory] = useState(() => getHistoryForFolder(folderId));
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion[]>([]);
  const [activeType, setActiveType] = useState<QuizResult["type"]>("standard");
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);

  const startQuiz = (type: QuizResult["type"]) => {
    setActiveType(type);
    setActiveQuiz(generateMockQuiz(folderId, type));
    setView("taking");
  };

  const handleComplete = (result: QuizResult) => {
    saveQuizResult(result);
    setHistory(getHistoryForFolder(folderId));
    setLastResult(result);
    setView("result");
  };

  const handleRetake = (r: QuizResult) => {
    setActiveType(r.type);
    setActiveQuiz(r.questions);
    setView("taking");
  };

  const handleViewAnswers = (r: QuizResult) => {
    setLastResult(r);
    setView("result");
  };

  if (view === "taking") {
    return (
      <QuizTaker
        questions={activeQuiz}
        folderId={folderId}
        quizType={activeType}
        onComplete={handleComplete}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "result" && lastResult) {
    return (
      <QuizResults
        result={lastResult}
        onBack={() => setView("list")}
        onRetake={() => handleRetake(lastResult)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Play, label: "Simulado Geral", type: "standard" as const, color: "text-primary", bg: "bg-primary/10" },
          { icon: Flame, label: "Simulado Difícil", type: "difficult" as const, color: "text-orange-500", bg: "bg-orange-500/10" },
          { icon: RotateCcw, label: "Refazer Erros", type: "wrong-only" as const, color: "text-red-400", bg: "bg-red-500/10" },
          { icon: Clock, label: "Material Recente", type: "recent-materials" as const, color: "text-accent", bg: "bg-accent/10" },
        ].map((action) => (
          <button
            key={action.type}
            onClick={() => startQuiz(action.type)}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.08]"
          >
            <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${action.bg}`}>
              <action.icon className={`h-4 w-4 ${action.color}`} />
            </div>
            <p className="text-sm font-medium">{action.label}</p>
          </button>
        ))}
      </motion.div>

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Histórico de simulados</h3>
        <QuizList results={history} onRetake={handleRetake} onViewAnswers={handleViewAnswers} />
      </div>
    </div>
  );
}
