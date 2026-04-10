import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface Plan {
  nameKey: string;
  price: string;
  ctaKey: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    nameKey: "pricing.free.name",
    price: "R$ 0",
    ctaKey: "pricing.cta.free",
    features: ["pricing.free.f1", "pricing.free.f2", "pricing.free.f3", "pricing.free.f4"],
  },
  {
    nameKey: "pricing.pro.name",
    price: "R$ 39,90",
    ctaKey: "pricing.cta.pro",
    features: ["pricing.pro.f1", "pricing.pro.f2", "pricing.pro.f3", "pricing.pro.f4", "pricing.pro.f5"],
    popular: true,
  },
  {
    nameKey: "pricing.max.name",
    price: "R$ 79,90",
    ctaKey: "pricing.cta.max",
    features: ["pricing.max.f1", "pricing.max.f2", "pricing.max.f3", "pricing.max.f4", "pricing.max.f5"],
  },
];

export const PricingSection = () => {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            {t("pricing.tag")}
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("pricing.subtitle")}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.nameKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? "border-primary bg-gradient-to-b from-primary/5 to-background shadow-glow scale-105"
                  : "border-border bg-card shadow-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  {t("pricing.popular")}
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground">{t(plan.nameKey)}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                {plan.price !== "R$ 0" && (
                  <span className="text-sm text-muted-foreground">{t("pricing.monthly")}</span>
                )}
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((fKey) => (
                  <li key={fKey} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                    {t(fKey)}
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 w-full py-5 font-semibold ${
                  plan.popular
                    ? "bg-gradient-primary text-primary-foreground hover:opacity-90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {t(plan.ctaKey)}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
