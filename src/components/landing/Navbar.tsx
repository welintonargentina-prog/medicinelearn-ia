import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Menu, X, Brain } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/10 bg-hero/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-hero-foreground">MedLearn AI</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-hero-muted transition-colors hover:text-hero-foreground">{t("nav.features")}</a>
          <a href="#how" className="text-sm text-hero-muted transition-colors hover:text-hero-foreground">{t("nav.how")}</a>
          <a href="#pricing" className="text-sm text-hero-muted transition-colors hover:text-hero-foreground">{t("nav.pricing")}</a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher variant="dark" />
          <Link to="/auth">
            <Button variant="ghost" className="text-hero-muted hover:text-hero-foreground hover:bg-hero-foreground/10">
              {t("nav.login")}
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              {t("nav.start")}
            </Button>
          </Link>
        </div>

        <button className="md:hidden text-hero-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/10 bg-hero p-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#features" className="text-sm text-hero-muted" onClick={() => setOpen(false)}>{t("nav.features")}</a>
            <a href="#how" className="text-sm text-hero-muted" onClick={() => setOpen(false)}>{t("nav.how")}</a>
            <a href="#pricing" className="text-sm text-hero-muted" onClick={() => setOpen(false)}>{t("nav.pricing")}</a>
            <LanguageSwitcher variant="dark" />
            <Link to="/auth">
              <Button className="w-full bg-gradient-primary text-primary-foreground">{t("nav.start")}</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
