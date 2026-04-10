import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  Brain, Upload, FileText, BookOpen, Target, Stethoscope,
  Headphones, MessageSquare, BarChart3, Flame, Clock, TrendingDown, Home
} from "lucide-react";
import { Link } from "react-router-dom";

const sidebarItems = [
  { icon: Home, label: "Dashboard" },
  { icon: Upload, label: "Upload" },
  { icon: FileText, label: "Resumos" },
  { icon: BookOpen, label: "Flashcards" },
  { icon: Target, label: "Quizzes" },
  { icon: Stethoscope, label: "Casos Clínicos" },
  { icon: MessageSquare, label: "Tutor IA" },
  { icon: Headphones, label: "Áudio" },
  { icon: BarChart3, label: "Progresso" },
];

const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">MedLearn AI</span>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarItems.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                i === 0
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <h1 className="text-lg font-semibold text-foreground">
            {t("dash.welcome")}, <span className="text-gradient">Estudante</span>
          </h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/">
              <Button variant="outline" size="sm">Landing Page</Button>
            </Link>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BarChart3, label: t("dash.progress"), value: "68%", color: "text-primary" },
              { icon: Flame, label: t("dash.streak"), value: `12 ${t("dash.days")}`, color: "text-orange-500" },
              { icon: TrendingDown, label: t("dash.weak"), value: "Farmacologia", color: "text-destructive" },
              { icon: Clock, label: t("dash.time"), value: `23 ${t("dash.hours")}`, color: "text-accent" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Upload area */}
          <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-12 text-center">
            <Upload className="mx-auto h-10 w-10 text-primary/60" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">{t("dash.upload")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              PDFs, slides, gravações, YouTube links, notas
            </p>
            <Button className="mt-4 bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Upload className="mr-2 h-4 w-4" />
              {t("dash.upload")}
            </Button>
          </div>

          {/* Recent materials placeholder */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">{t("dash.recent")}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {["Anatomia do Coração.pdf", "Farmacologia - Aula 5.pptx", "Patologia Geral.pdf"].map((name) => (
                <div key={name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">Enviado há 2 dias</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
