import { QuizResult } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trophy, Clock, Target, RotateCcw, Eye, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  result: QuizResult;
  onBack: () => void;
  onRetake: () => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

export function QuizResults({ result, onBack, onRetake }: Props) {
  const [showAnswers, setShowAnswers] = useState(false);
  const scoreColor = result.score >= 70 ? "text-emerald-400" : result.score >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Score card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <Trophy className="mx-auto h-10 w-10 text-yellow-400 mb-3" />
        <p className={`text-5xl font-bold ${scoreColor}`}>{result.score}%</p>
        <p className="mt-2 text-hero-muted">{result.name}</p>
        <div className="mt-4 flex justify-center gap-6 text-sm text-hero-muted">
          <span className="flex items-center gap-1"><Target className="h-4 w-4" /> {result.answers.filter((a) => a.correct).length}/{result.totalQuestions} corretas</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatTime(result.completionTime)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} className="text-hero-muted hover:text-hero-foreground hover:bg-white/10">Voltar</Button>
        <Button onClick={onRetake} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10">
          <RotateCcw className="mr-2 h-4 w-4" /> Refazer
        </Button>
        <Button onClick={() => setShowAnswers(!showAnswers)} className="flex-1 bg-primary hover:bg-primary/90">
          <Eye className="mr-2 h-4 w-4" /> {showAnswers ? "Ocultar" : "Ver respostas"}
        </Button>
      </div>

      {/* Answers review */}
      {showAnswers && (
        <div className="space-y-4">
          {result.questions.map((q, i) => {
            const a = result.answers[i];
            return (
              <div key={q.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-2">
                  {a?.correct ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{q.text}</p>
                    <p className="text-xs text-hero-muted mt-1">Sua resposta: <span className={a?.correct ? "text-emerald-400" : "text-red-400"}>{q.options[a?.selectedIndex ?? 0]}</span></p>
                    {!a?.correct && <p className="text-xs text-emerald-400 mt-0.5">Correta: {q.options[q.correctIndex]}</p>}
                    <p className="text-xs text-hero-muted mt-2 italic">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
