import { FolderPerformance } from "@/types/quiz";
import { motion } from "framer-motion";
import { Trophy, Clock, Target, TrendingUp } from "lucide-react";

interface Props {
  performance: FolderPerformance;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

export function PerformancePanel({ performance }: Props) {
  const { totalCompleted, averageScore, averageTime, topicPerformances, scoreHistory } = performance;
  const scoreColor = averageScore >= 70 ? "text-emerald-400" : averageScore >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Trophy, label: "Simulados", value: String(totalCompleted), color: "text-yellow-400" },
          { icon: Target, label: "Média", value: `${averageScore}%`, color: scoreColor },
          { icon: Clock, label: "Tempo médio", value: formatTime(averageTime), color: "text-primary" },
          { icon: TrendingUp, label: "Último score", value: scoreHistory.length ? `${scoreHistory[scoreHistory.length - 1].score}%` : "—", color: "text-accent" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <s.icon className={`mx-auto h-5 w-5 ${s.color}`} />
            <p className="mt-2 text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-hero-muted">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Score evolution chart (simple bar chart) */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Evolução de pontuação</h3>
        {scoreHistory.length > 0 ? (
          <div className="flex items-end gap-2 h-32">
            {scoreHistory.map((h, i) => {
              const barColor = h.score >= 70 ? "bg-emerald-500" : h.score >= 50 ? "bg-yellow-500" : "bg-red-500";
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-hero-muted">{h.score}%</span>
                  <div className={`w-full rounded-t-md ${barColor} transition-all`} style={{ height: `${h.score}%` }} />
                  <span className="text-[10px] text-hero-muted">{new Date(h.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-hero-muted text-sm text-center py-6">Nenhum dado ainda</p>
        )}
      </div>

      {/* Topic accuracy */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Target className="h-4 w-4 text-accent" /> Acerto por tópico</h3>
        <div className="space-y-3">
          {topicPerformances.length > 0 ? topicPerformances.sort((a, b) => b.percentage - a.percentage).map((tp) => {
            const color = tp.percentage >= 70 ? "bg-emerald-500" : tp.percentage >= 50 ? "bg-yellow-500" : "bg-red-500";
            return (
              <div key={tp.topic}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{tp.topic}</span>
                  <span className="text-hero-muted">{tp.percentage}% ({tp.correct}/{tp.total})</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${tp.percentage}%` }} />
                </div>
              </div>
            );
          }) : <p className="text-hero-muted text-sm text-center py-4">Nenhum dado ainda</p>}
        </div>
      </div>

      {/* Quizzes by topic chart */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold mb-4">Questões por tópico</h3>
        {topicPerformances.length > 0 ? (
          <div className="flex items-end gap-3 h-28">
            {topicPerformances.map((tp) => (
              <div key={tp.topic} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-hero-muted">{tp.total}</span>
                <div className="w-full rounded-t-md bg-primary/60 transition-all" style={{ height: `${(tp.total / Math.max(...topicPerformances.map((t) => t.total))) * 100}%` }} />
                <span className="text-[10px] text-hero-muted text-center truncate w-full">{tp.topic}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-hero-muted text-sm text-center py-4">Nenhum dado</p>}
      </div>
    </div>
  );
}
