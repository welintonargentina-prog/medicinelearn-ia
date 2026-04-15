import type { QuizResult, FolderPerformance, TopicPerformance } from "@/types/quiz";
import { generateMockHistory } from "@/data/mockQuizData";

const STORAGE_KEY = "medlearn_quiz_history";

function getAll(): Record<string, QuizResult[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, QuizResult[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getHistoryForFolder(folderId: string): QuizResult[] {
  const all = getAll();
  if (!all[folderId] || all[folderId].length === 0) {
    const mock = generateMockHistory(folderId);
    all[folderId] = mock;
    saveAll(all);
    return mock;
  }
  return all[folderId];
}

export function saveQuizResult(result: QuizResult) {
  const all = getAll();
  if (!all[result.folderId]) all[result.folderId] = [];
  all[result.folderId].push(result);
  saveAll(all);
}

export function computePerformance(folderId: string): FolderPerformance {
  const results = getHistoryForFolder(folderId);
  const totalCompleted = results.length;
  const averageScore = totalCompleted ? Math.round(results.reduce((s, r) => s + r.score, 0) / totalCompleted) : 0;
  const averageTime = totalCompleted ? Math.round(results.reduce((s, r) => s + r.completionTime, 0) / totalCompleted) : 0;

  const topicMap: Record<string, { correct: number; total: number }> = {};
  for (const r of results) {
    for (let i = 0; i < r.questions.length; i++) {
      const t = r.questions[i].topic;
      if (!topicMap[t]) topicMap[t] = { correct: 0, total: 0 };
      topicMap[t].total++;
      if (r.answers[i]?.correct) topicMap[t].correct++;
    }
  }

  const topicPerformances: TopicPerformance[] = Object.entries(topicMap).map(([topic, d]) => ({
    topic,
    correct: d.correct,
    total: d.total,
    percentage: Math.round((d.correct / d.total) * 100),
  }));

  const scoreHistory = results.map((r) => ({ date: r.date, score: r.score })).sort((a, b) => a.date.localeCompare(b.date));

  return { folderId, totalCompleted, averageScore, averageTime, topicPerformances, scoreHistory };
}

export function getWrongQuestionIds(folderId: string): string[] {
  const results = getHistoryForFolder(folderId);
  const wrong = new Set<string>();
  for (const r of results) {
    for (const a of r.answers) {
      if (!a.correct) wrong.add(a.questionId);
    }
  }
  return Array.from(wrong);
}
