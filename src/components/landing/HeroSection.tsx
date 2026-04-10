import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star } from "lucide-react";
import { motion } from "framer-motion";

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen bg-hero pt-16 overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[100px] animate-pulse-glow" />

      <div className="container relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5"
        >
          <Star className="h-3.5 w-3.5 text-primary fill-primary" />
          <span className="text-xs font-medium text-primary">{t("hero.badge")}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-hero-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {t("hero.title1")}{" "}
          <span className="text-gradient">{t("hero.title2")}</span>{" "}
          {t("hero.title3")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-hero-muted"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Button size="lg" className="bg-gradient-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-glow hover:opacity-90">
            {t("hero.cta")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="border-hero-muted/30 px-8 py-6 text-base text-hero-muted hover:bg-hero-foreground/5 hover:text-hero-foreground">
            <Play className="mr-2 h-4 w-4" />
            {t("hero.cta2")}
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 text-sm text-hero-muted/60"
        >
          {t("hero.users")}
        </motion.p>

        {/* Floating UI preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 w-full max-w-5xl"
        >
          <div className="rounded-xl border border-border/10 bg-hero-foreground/5 p-1 shadow-glow backdrop-blur-sm">
            <div className="rounded-lg bg-gradient-to-b from-hero-foreground/10 to-hero-foreground/5 p-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-3">
                  <div className="h-3 w-1/3 rounded bg-primary/30" />
                  <div className="h-2 w-full rounded bg-hero-foreground/10" />
                  <div className="h-2 w-5/6 rounded bg-hero-foreground/10" />
                  <div className="h-2 w-4/6 rounded bg-hero-foreground/10" />
                  <div className="mt-4 h-20 rounded-lg bg-hero-foreground/5 border border-border/10" />
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="h-2 w-2/3 rounded bg-primary/40" />
                    <div className="mt-2 h-2 w-full rounded bg-hero-foreground/10" />
                  </div>
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                    <div className="h-2 w-1/2 rounded bg-accent/40" />
                    <div className="mt-2 h-2 w-full rounded bg-hero-foreground/10" />
                  </div>
                  <div className="rounded-lg border border-border/10 bg-hero-foreground/5 p-3">
                    <div className="h-2 w-3/4 rounded bg-hero-foreground/15" />
                    <div className="mt-2 h-2 w-full rounded bg-hero-foreground/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
