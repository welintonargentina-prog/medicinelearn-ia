import type { StudyFolder, QuizQuestion, QuizResult, QuizAnswer } from "@/types/quiz";

export const mockFolders: StudyFolder[] = [
  { id: "f1", name: "Anatomia Humana", description: "Sistema musculoesquelético, nervoso e cardiovascular", icon: "🦴", materialsCount: 8, createdAt: "2026-03-01" },
  { id: "f2", name: "Fisiologia", description: "Fisiologia celular, cardiovascular e renal", icon: "🫀", materialsCount: 12, createdAt: "2026-03-10" },
  { id: "f3", name: "Farmacologia", description: "Farmacocinética, farmacodinâmica e classes de drogas", icon: "💊", materialsCount: 6, createdAt: "2026-03-15" },
  { id: "f4", name: "Clínica Médica", description: "Semiologia, diagnóstico diferencial e condutas", icon: "🩺", materialsCount: 15, createdAt: "2026-04-01" },
];

const topics = ["Anatomia", "Fisiologia", "Farmacologia", "Clínica", "Patologia", "Bioquímica"];

function makeQuestion(id: string, topic: string, difficulty: "easy" | "medium" | "hard"): QuizQuestion {
  const questions: Record<string, { text: string; options: string[]; correct: number; explanation: string }[]> = {
    Anatomia: [
      { text: "Qual músculo é o principal flexor do antebraço?", options: ["Bíceps braquial", "Tríceps braquial", "Braquiorradial", "Deltóide"], correct: 0, explanation: "O bíceps braquial é o principal flexor do antebraço na articulação do cotovelo." },
      { text: "Qual osso forma a base do crânio?", options: ["Esfenóide", "Frontal", "Parietal", "Temporal"], correct: 0, explanation: "O osso esfenóide forma grande parte da base do crânio." },
    ],
    Fisiologia: [
      { text: "Qual é o principal íon responsável pelo potencial de repouso?", options: ["Potássio (K+)", "Sódio (Na+)", "Cálcio (Ca2+)", "Cloro (Cl-)"], correct: 0, explanation: "O potássio é o principal determinante do potencial de repouso da membrana." },
      { text: "Qual fase do ciclo cardíaco corresponde ao enchimento ventricular?", options: ["Diástole", "Sístole atrial", "Sístole ventricular", "Ejeção"], correct: 0, explanation: "A diástole é o período de relaxamento e enchimento ventricular." },
    ],
    Farmacologia: [
      { text: "Qual é o mecanismo de ação da amoxicilina?", options: ["Inibição da síntese de parede celular", "Inibição da síntese proteica", "Inibição do DNA girase", "Inibição da síntese de folato"], correct: 0, explanation: "Beta-lactâmicos inibem a síntese da parede celular bacteriana." },
      { text: "Qual classe de drogas inclui o omeprazol?", options: ["Inibidores de bomba de prótons", "Bloqueadores H2", "Antiácidos", "Procinéticos"], correct: 0, explanation: "Omeprazol é um inibidor da bomba de prótons (IBP)." },
    ],
    Clínica: [
      { text: "Qual sinal é patognomônico da estenose mitral?", options: ["Ruflar diastólico", "Sopro sistólico", "B3", "Click mesossistólico"], correct: 0, explanation: "O ruflar diastólico é característico da estenose mitral." },
      { text: "Qual exame é padrão-ouro para TEP?", options: ["Angiotomografia de tórax", "Raio-X de tórax", "ECG", "D-dímero"], correct: 0, explanation: "A angiotomografia de tórax é o exame padrão-ouro para diagnóstico de TEP." },
    ],
    Patologia: [
      { text: "Qual tipo de necrose é mais comum no infarto do miocárdio?", options: ["Necrose coagulativa", "Necrose liquefativa", "Necrose caseosa", "Necrose gordurosa"], correct: 0, explanation: "O infarto do miocárdio cursa classicamente com necrose coagulativa." },
    ],
    Bioquímica: [
      { text: "Qual enzima é limitante da glicólise?", options: ["Fosfofrutocinase-1", "Hexocinase", "Piruvato cinase", "Glicose-6-fosfatase"], correct: 0, explanation: "A fosfofrutocinase-1 é a principal enzima regulatória (limitante) da glicólise." },
    ],
  };
  const pool = questions[topic] || questions.Anatomia;
  const q = pool[Math.abs(hashStr(id)) % pool.length];
  return {
    id,
    text: q.text,
    options: q.options,
    correctIndex: q.correct,
    topic,
    difficulty,
    explanation: q.explanation,
    metadata: {},
  };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

function generateQuizResult(id: string, folderId: string, name: string, date: string, type: QuizResult["type"], numQ: number): QuizResult {
  const questions: QuizQuestion[] = [];
  const answers: QuizAnswer[] = [];
  const diffs: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];
  let correct = 0;

  for (let i = 0; i < numQ; i++) {
    const topic = topics[i % topics.length];
    const q = makeQuestion(`${id}-q${i}`, topic, diffs[i % 3]);
    questions.push(q);
    const isCorrect = Math.random() > 0.35;
    if (isCorrect) correct++;
    answers.push({
      questionId: q.id,
      selectedIndex: isCorrect ? q.correctIndex : (q.correctIndex + 1) % 4,
      correct: isCorrect,
      timeSpent: 20 + Math.floor(Math.random() * 60),
    });
  }

  return {
    id,
    folderId,
    name,
    date,
    type,
    questions,
    answers,
    score: Math.round((correct / numQ) * 100),
    totalQuestions: numQ,
    completionTime: answers.reduce((s, a) => s + a.timeSpent, 0),
  };
}

export function generateMockHistory(folderId: string): QuizResult[] {
  return [
    generateQuizResult(`${folderId}-r1`, folderId, "Simulado Geral #1", "2026-03-20T14:00:00Z", "standard", 10),
    generateQuizResult(`${folderId}-r2`, folderId, "Simulado Difícil #1", "2026-03-25T10:00:00Z", "difficult", 8),
    generateQuizResult(`${folderId}-r3`, folderId, "Revisão de Erros #1", "2026-04-01T16:30:00Z", "wrong-only", 6),
    generateQuizResult(`${folderId}-r4`, folderId, "Simulado Geral #2", "2026-04-08T09:00:00Z", "standard", 12),
    generateQuizResult(`${folderId}-r5`, folderId, "Material Recente #1", "2026-04-12T11:00:00Z", "recent-materials", 10),
  ];
}

export function generateMockQuiz(folderId: string, type: QuizResult["type"], numQ = 10): QuizQuestion[] {
  const diffs: Array<"easy" | "medium" | "hard"> = type === "difficult" ? ["hard", "hard", "medium"] : ["easy", "medium", "hard"];
  return Array.from({ length: numQ }, (_, i) => {
    const topic = topics[i % topics.length];
    return makeQuestion(`new-${folderId}-${Date.now()}-${i}`, topic, diffs[i % diffs.length]);
  });
}
