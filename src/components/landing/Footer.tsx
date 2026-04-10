import { useLanguage } from "@/contexts/LanguageContext";
import { Brain } from "lucide-react";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">MedLearn AI</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer.desc")}</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.product")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">{t("nav.features")}</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">{t("nav.pricing")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">{t("footer.about")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("footer.blog")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("footer.contact")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">{t("footer.privacy")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("footer.terms")}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MedLearn AI. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};
