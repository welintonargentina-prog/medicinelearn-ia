import { useState } from "react";
import { QuizQuestion, QuizAnswer, QuizResult } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, ArrowRight, Loader2 } from "lucide-react";

interface Props {
  questions: QuizQuestion[];
  folderId: string;
  quizType: QuizResult["type"];
  onComplete: (result: QuizResult) => void;
  onCancel: () => void;
}

export function QuizTaker({ questions, folderId, quizType, onComplete, onCancel }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [startTime] = useState(Date.now());
  const [qStart, setQStart] = useState(Date.now());

  const q = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  const handleConfirm = () => {
    if (selected === null) return;
    setConfirmed(true);
  };

  const handleNext = () => {
    if (selected === null) return;
    const answer: QuizAnswer = {
      questionId: q.id,
      selectedIndex: selected,
      correct: selected === q.correctIndex,
      timeSpent: Math.round((Date.now() - qStart) / 1000),
    };
    const newAnswers = [...answers, answer];

    if (isLast) {
      const correct = newAnswers.filter((a) => a.correct).length;
      const result: QuizResult = {
        id: `quiz-${Date.now()}`,
        folderId,
        name: quizType === "difficult" ? "Simulado Difícil" : quizType === "wrong-only" ? "Revisão de Erros" : quizType === "recent-materials" ? "Material Recente" : "Simulado Geral",
        date: new Date().toISOString(),
        type: quizType,
        questions,
        answers: newAnswers,
        score: Math.round((correct / questions.length) * 100),
        totalQuestions: questions.length,
        completionTime: Math.round((Date.now() - startTime) / 1000),
      };
      onComplete(result);
    } else {
      setAnswers(newAnswers);
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setConfirmed(false);
      setQStart(Date.now());
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-hero-muted">
        <span>Questão {currentIdx + 1} de {questions.length}</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {q.topic} • {q.difficulty}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-lg font-medium leading-relaxed">{q.text}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((opt, i) => {
          let borderClass = "border-white/10 hover:border-white/20";
          if (selected === i && !confirmed) borderClass = "border-primary bg-primary/10";
          if (confirmed && i === q.correctIndex) borderClass = "border-emerald-500 bg-emerald-500/10";
          if (confirmed && selected === i && i !== q.correctIndex) borderClass = "border-red-500 bg-red-500/10";

          return (
            <button
              key={i}
              onClick={() => !confirmed && setSelected(i)}
              disabled={confirmed}
              className={`w-full text-left rounded-xl border p-4 transition-all ${borderClass} flex items-center gap-3`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {confirmed && i === q.correctIndex && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {confirmed && selected === i && i !== q.correctIndex && <XCircle className="h-5 w-5 text-red-500" />}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {confirmed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-primary mb-1">Explicação:</p>
          <p className="text-sm text-hero-muted">{q.explanation}</p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onCancel} className="text-hero-muted hover:text-hero-foreground hover:bg-white/10">Cancelar</Button>
        {!confirmed ? (
          <Button onClick={handleConfirm} disabled={selected === null} className="flex-1 bg-primary hover:bg-primary/90">
            Confirmar resposta
          </Button>
        ) : (
          <Button onClick={handleNext} className="flex-1 bg-primary hover:bg-primary/90">
            {isLast ? "Ver resultado" : "Próxima"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
