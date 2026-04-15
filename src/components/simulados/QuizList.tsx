import { QuizResult } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Clock, Target, RotateCcw, Eye, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  results: QuizResult[];
  onRetake: (result: QuizResult) => void;
  onViewAnswers: (result: QuizResult) => void;
}

const typeLabels: Record<QuizResult["type"], string> = {
  standard: "Padrão",
  difficult: "Difícil",
  "wrong-only": "Revisão",
  "recent-materials": "Recente",
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m}min`;
}

export function QuizList({ results, onRetake, onViewAnswers }: Props) {
  if (!results.length) {
    return <p className="text-hero-muted text-center py-8">Nenhum simulado realizado ainda.</p>;
  }

  return (
    <div className="space-y-3">
      {results.sort((a, b) => b.date.localeCompare(a.date)).map((r, i) => {
        const scoreColor = r.score >= 70 ? "text-emerald-400" : r.score >= 50 ? "text-yellow-400" : "text-red-400";
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <p className="font-medium text-sm truncate">{r.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-hero-muted shrink-0">{typeLabels[r.type]}</span>
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-hero-muted">
                <span>{new Date(r.date).toLocaleDateString("pt-BR")}</span>
                <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {r.totalQuestions}q</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(r.completionTime)}</span>
                <span className={`font-semibold ${scoreColor}`}>{r.score}%</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => onViewAnswers(r)} className="text-hero-muted hover:text-hero-foreground hover:bg-white/10 text-xs">
                <Eye className="mr-1 h-3.5 w-3.5" /> Ver
              </Button>
              <Button size="sm" onClick={() => onRetake(r)} className="bg-white/10 hover:bg-white/20 border border-white/10 text-xs">
                <RotateCcw className="mr-1 h-3.5 w-3.5" /> Refazer
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
