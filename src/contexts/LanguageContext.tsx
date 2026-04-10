import React, { createContext, useContext, useState, useCallback } from "react";

export type Language = "pt" | "en" | "es";

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  // Nav
  "nav.features": { pt: "Funcionalidades", en: "Features", es: "Funcionalidades" },
  "nav.how": { pt: "Como Funciona", en: "How It Works", es: "Cómo Funciona" },
  "nav.pricing": { pt: "Planos", en: "Pricing", es: "Planes" },
  "nav.login": { pt: "Entrar", en: "Log In", es: "Iniciar Sesión" },
  "nav.start": { pt: "Começar Grátis", en: "Start Free", es: "Empezar Gratis" },

  // Hero
  "hero.badge": { pt: "Plataforma #1 para Estudantes de Medicina", en: "#1 Platform for Medical Students", es: "Plataforma #1 para Estudiantes de Medicina" },
  "hero.title1": { pt: "Estude Medicina de", en: "Study Medicine", es: "Estudia Medicina de" },
  "hero.title2": { pt: "Forma Inteligente", en: "The Smart Way", es: "Forma Inteligente" },
  "hero.title3": { pt: "com IA", en: "with AI", es: "con IA" },
  "hero.subtitle": {
    pt: "Transforme seus materiais de estudo em resumos, flashcards, quizzes e simulados com inteligência artificial. Aprenda mais em menos tempo.",
    en: "Transform your study materials into summaries, flashcards, quizzes and mock exams with artificial intelligence. Learn more in less time.",
    es: "Transforma tus materiales de estudio en resúmenes, flashcards, quizzes y simulacros con inteligencia artificial. Aprende más en menos tiempo.",
  },
  "hero.cta": { pt: "Começar Gratuitamente", en: "Start For Free", es: "Empezar Gratis" },
  "hero.cta2": { pt: "Ver Como Funciona", en: "See How It Works", es: "Ver Cómo Funciona" },
  "hero.users": { pt: "+12.000 estudantes já usam", en: "+12,000 students already use it", es: "+12.000 estudiantes ya lo usan" },

  // Features
  "features.tag": { pt: "Funcionalidades", en: "Features", es: "Funcionalidades" },
  "features.title": { pt: "Tudo que você precisa para dominar a medicina", en: "Everything you need to master medicine", es: "Todo lo que necesitas para dominar la medicina" },
  "features.subtitle": { pt: "Ferramentas poderosas alimentadas por IA, projetadas especificamente para estudantes de medicina.", en: "Powerful AI-powered tools designed specifically for medical students.", es: "Herramientas poderosas impulsadas por IA, diseñadas específicamente para estudiantes de medicina." },

  "features.summaries.title": { pt: "Resumos Inteligentes", en: "Smart Summaries", es: "Resúmenes Inteligentes" },
  "features.summaries.desc": { pt: "IA gera resumos estruturados, pontos-chave e notas de alto rendimento automaticamente.", en: "AI generates structured summaries, key points and high-yield notes automatically.", es: "La IA genera resúmenes estructurados, puntos clave y notas de alto rendimiento automáticamente." },

  "features.flashcards.title": { pt: "Flashcards com Repetição", en: "Spaced Flashcards", es: "Flashcards con Repetición" },
  "features.flashcards.desc": { pt: "Flashcards gerados automaticamente com algoritmo de repetição espaçada.", en: "Auto-generated flashcards with spaced repetition algorithm.", es: "Flashcards generados automáticamente con algoritmo de repetición espaciada." },

  "features.tutor.title": { pt: "Tutor IA Médico", en: "AI Medical Tutor", es: "Tutor IA Médico" },
  "features.tutor.desc": { pt: "Tire dúvidas, compare doenças e receba explicações passo a passo.", en: "Ask questions, compare diseases and get step-by-step explanations.", es: "Haz preguntas, compara enfermedades y recibe explicaciones paso a paso." },

  "features.quizzes.title": { pt: "Quizzes & Simulados", en: "Quizzes & Mock Exams", es: "Quizzes y Simulacros" },
  "features.quizzes.desc": { pt: "Provas cronometradas com níveis de dificuldade e análise de desempenho.", en: "Timed exams with difficulty levels and performance analysis.", es: "Exámenes cronometrados con niveles de dificultad y análisis de rendimiento." },

  "features.cases.title": { pt: "Casos Clínicos", en: "Clinical Cases", es: "Casos Clínicos" },
  "features.cases.desc": { pt: "Cenários reais de pacientes com diagnóstico e decisão de tratamento.", en: "Real patient scenarios with diagnosis and treatment decisions.", es: "Escenarios reales de pacientes con diagnóstico y decisión de tratamiento." },

  "features.audio.title": { pt: "Modo Áudio", en: "Audio Mode", es: "Modo Audio" },
  "features.audio.desc": { pt: "Transforme qualquer material em podcasts e áudio de revisão rápida.", en: "Transform any material into podcasts and quick review audio.", es: "Transforma cualquier material en podcasts y audio de repaso rápido." },

  // How it works
  "how.tag": { pt: "Como Funciona", en: "How It Works", es: "Cómo Funciona" },
  "how.title": { pt: "3 passos para estudar com IA", en: "3 steps to study with AI", es: "3 pasos para estudiar con IA" },
  "how.step1.title": { pt: "Envie seus materiais", en: "Upload your materials", es: "Sube tus materiales" },
  "how.step1.desc": { pt: "PDFs, slides, gravações, links do YouTube, notas e provas anteriores.", en: "PDFs, slides, recordings, YouTube links, notes and past exams.", es: "PDFs, diapositivas, grabaciones, enlaces de YouTube, notas y exámenes anteriores." },
  "how.step2.title": { pt: "IA processa tudo", en: "AI processes everything", es: "La IA procesa todo" },
  "how.step2.desc": { pt: "Nossa IA analisa e transforma em resumos, flashcards, quizzes e mais.", en: "Our AI analyzes and transforms into summaries, flashcards, quizzes and more.", es: "Nuestra IA analiza y transforma en resúmenes, flashcards, quizzes y más." },
  "how.step3.title": { pt: "Estude e domine", en: "Study and master", es: "Estudia y domina" },
  "how.step3.desc": { pt: "Use as ferramentas para estudar de forma eficiente e acompanhe seu progresso.", en: "Use the tools to study efficiently and track your progress.", es: "Usa las herramientas para estudiar de forma eficiente y sigue tu progreso." },

  // Pricing
  "pricing.tag": { pt: "Planos", en: "Pricing", es: "Planes" },
  "pricing.title": { pt: "Preços acessíveis para estudantes", en: "Affordable pricing for students", es: "Precios accesibles para estudiantes" },
  "pricing.subtitle": { pt: "Comece grátis e faça upgrade quando precisar de mais.", en: "Start free and upgrade when you need more.", es: "Empieza gratis y actualiza cuando necesites más." },
  "pricing.monthly": { pt: "/mês", en: "/month", es: "/mes" },
  "pricing.cta.free": { pt: "Começar Grátis", en: "Start Free", es: "Empezar Gratis" },
  "pricing.cta.pro": { pt: "Assinar Pro", en: "Subscribe Pro", es: "Suscribir Pro" },
  "pricing.cta.max": { pt: "Assinar Max", en: "Subscribe Max", es: "Suscribir Max" },
  "pricing.popular": { pt: "Mais Popular", en: "Most Popular", es: "Más Popular" },

  "pricing.free.name": { pt: "Gratuito", en: "Free", es: "Gratuito" },
  "pricing.free.f1": { pt: "3 uploads por mês", en: "3 uploads per month", es: "3 subidas por mes" },
  "pricing.free.f2": { pt: "Resumos básicos", en: "Basic summaries", es: "Resúmenes básicos" },
  "pricing.free.f3": { pt: "5 quizzes por mês", en: "5 quizzes per month", es: "5 quizzes por mes" },
  "pricing.free.f4": { pt: "Chat IA limitado", en: "Limited AI chat", es: "Chat IA limitado" },

  "pricing.pro.name": { pt: "Pro", en: "Pro", es: "Pro" },
  "pricing.pro.f1": { pt: "Uploads ilimitados", en: "Unlimited uploads", es: "Subidas ilimitadas" },
  "pricing.pro.f2": { pt: "Chat IA ilimitado", en: "Unlimited AI chat", es: "Chat IA ilimitado" },
  "pricing.pro.f3": { pt: "Quizzes ilimitados", en: "Unlimited quizzes", es: "Quizzes ilimitados" },
  "pricing.pro.f4": { pt: "Simulados completos", en: "Full mock exams", es: "Simulacros completos" },
  "pricing.pro.f5": { pt: "Flashcards com repetição", en: "Spaced flashcards", es: "Flashcards con repetición" },

  "pricing.max.name": { pt: "Max", en: "Max", es: "Max" },
  "pricing.max.f1": { pt: "Tudo do Pro", en: "Everything in Pro", es: "Todo del Pro" },
  "pricing.max.f2": { pt: "Áudio ilimitado", en: "Unlimited audio", es: "Audio ilimitado" },
  "pricing.max.f3": { pt: "Limites IA expandidos", en: "Expanded AI limits", es: "Límites IA expandidos" },
  "pricing.max.f4": { pt: "Casos clínicos avançados", en: "Advanced clinical cases", es: "Casos clínicos avanzados" },
  "pricing.max.f5": { pt: "Suporte prioritário", en: "Priority support", es: "Soporte prioritario" },

  // CTA
  "cta.title": { pt: "Pronto para revolucionar seus estudos?", en: "Ready to revolutionize your studies?", es: "¿Listo para revolucionar tus estudios?" },
  "cta.subtitle": { pt: "Junte-se a milhares de estudantes de medicina que já estudam de forma mais inteligente.", en: "Join thousands of medical students who already study smarter.", es: "Únete a miles de estudiantes de medicina que ya estudian de forma más inteligente." },
  "cta.button": { pt: "Começar Agora — É Grátis", en: "Start Now — It's Free", es: "Empezar Ahora — Es Gratis" },

  // Footer
  "footer.desc": { pt: "Plataforma de aprendizado médico com IA. Estude de forma inteligente.", en: "AI-powered medical learning platform. Study smarter.", es: "Plataforma de aprendizaje médico con IA. Estudia de forma inteligente." },
  "footer.product": { pt: "Produto", en: "Product", es: "Producto" },
  "footer.company": { pt: "Empresa", en: "Company", es: "Empresa" },
  "footer.legal": { pt: "Legal", en: "Legal", es: "Legal" },
  "footer.about": { pt: "Sobre Nós", en: "About Us", es: "Sobre Nosotros" },
  "footer.blog": { pt: "Blog", en: "Blog", es: "Blog" },
  "footer.contact": { pt: "Contato", en: "Contact", es: "Contacto" },
  "footer.privacy": { pt: "Privacidade", en: "Privacy", es: "Privacidad" },
  "footer.terms": { pt: "Termos de Uso", en: "Terms of Use", es: "Términos de Uso" },
  "footer.rights": { pt: "Todos os direitos reservados.", en: "All rights reserved.", es: "Todos los derechos reservados." },

  // Dashboard
  "dash.welcome": { pt: "Bem-vindo de volta", en: "Welcome back", es: "Bienvenido de vuelta" },
  "dash.upload": { pt: "Enviar Material", en: "Upload Material", es: "Subir Material" },
  "dash.recent": { pt: "Materiais Recentes", en: "Recent Materials", es: "Materiales Recientes" },
  "dash.progress": { pt: "Progresso", en: "Progress", es: "Progreso" },
  "dash.streak": { pt: "Sequência de Estudo", en: "Study Streak", es: "Racha de Estudio" },
  "dash.days": { pt: "dias", en: "days", es: "días" },
  "dash.weak": { pt: "Áreas Fracas", en: "Weak Areas", es: "Áreas Débiles" },
  "dash.time": { pt: "Tempo de Estudo", en: "Study Time", es: "Tiempo de Estudio" },
  "dash.hours": { pt: "horas esta semana", en: "hours this week", es: "horas esta semana" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("medlearn-lang");
    return (saved as Language) || "pt";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("medlearn-lang", lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[language] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
