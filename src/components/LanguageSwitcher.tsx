import { useLanguage, type Language } from "@/contexts/LanguageContext";

const flags: Record<Language, string> = {
  pt: "🇧🇷",
  en: "🇺🇸",
  es: "🇪🇸",
};

const labels: Record<Language, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
};

export const LanguageSwitcher = ({ variant = "light" }: { variant?: "light" | "dark" }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/50 p-0.5">
      {(Object.keys(flags) as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
            language === lang
              ? variant === "dark"
                ? "bg-primary/20 text-primary-foreground"
                : "bg-primary text-primary-foreground"
              : variant === "dark"
              ? "text-hero-muted hover:text-hero-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{flags[lang]}</span>
          <span>{labels[lang]}</span>
        </button>
      ))}
    </div>
  );
};
