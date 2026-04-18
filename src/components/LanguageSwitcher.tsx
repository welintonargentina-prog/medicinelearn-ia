import { useLanguage, type Language } from "@/contexts/LanguageContext";

const labels: Record<Language, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
};

export const LanguageSwitcher = ({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/50 p-1 backdrop-blur-md bg-white/5">
      {(Object.keys(labels) as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
            language === lang
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-white/10"
          }`}
        >
          {labels[lang]}
        </button>
      ))}
    </div>
  );
};
