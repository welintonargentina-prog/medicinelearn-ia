import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { FileText, Brain, BookOpen, Target, Stethoscope, Headphones } from "lucide-react";

const featureKeys = [
  { key: "summaries", icon: FileText },
  { key: "flashcards", icon: BookOpen },
  { key: "tutor", icon: Brain },
  { key: "quizzes", icon: Target },
  { key: "cases", icon: Stethoscope },
  { key: "audio", icon: Headphones },
];

export const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            {t("features.tag")}
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("features.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">
                {t(`features.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {t(`features.${key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
