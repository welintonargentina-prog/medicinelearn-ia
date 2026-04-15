export type SourceType = "pdf" | "video" | "note" | "chat";

export interface QuestionMetadata {
  sourceType?: SourceType;
  sourceTitle?: string;
  sourceId?: string;
  pageReference?: string;
  videoTimestamp?: string;
  materialId?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  metadata: QuestionMetadata;
}

export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeSpent: number; // seconds
}

export interface QuizResult {
  id: string;
  folderId: string;
  name: string;
  date: string; // ISO
  type: "standard" | "difficult" | "wrong-only" | "recent-materials";
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  score: number; // 0-100
  totalQuestions: number;
  completionTime: number; // seconds
}

export interface QuizHistory {
  folderId: string;
  results: QuizResult[];
}

export interface TopicPerformance {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface FolderPerformance {
  folderId: string;
  totalCompleted: number;
  averageScore: number;
  averageTime: number; // seconds
  topicPerformances: TopicPerformance[];
  scoreHistory: { date: string; score: number }[];
}

export interface StudyFolder {
  id: string;
  name: string;
  description: string;
  icon: string;
  materialsCount: number;
  createdAt: string;
}
