import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Upload, Cpu, GraduationCap } from "lucide-react";

const steps = [
  { key: "step1", icon: Upload, color: "bg-primary" },
  { key: "step2", icon: Cpu, color: "bg-accent" },
  { key: "step3", icon: GraduationCap, color: "bg-primary" },
];

export const HowItWorksSection = () => {
  const { t } = useLanguage();

  return (
    <section id="how" className="py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent mb-4">
            {t("how.tag")}
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("how.title")}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map(({ key, icon: Icon, color }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${color} shadow-glow`}>
                <Icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                {i + 1}
              </div>
              <h3 className="text-xl font-semibold text-foreground">{t(`how.${key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {t(`how.${key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
