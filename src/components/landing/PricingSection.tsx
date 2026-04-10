import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, CreditCard, QrCode, Zap } from "lucide-react";
import { motion } from "framer-motion";


const browserLang = navigator.language.toLowerCase();
const isBrazil = browserLang.includes("pt");

const prices = {
  student: isBrazil ? "R$ 36,90" : "AR$ 8.900",
  quarterly: isBrazil ? "R$ 99,90" : "AR$ 23.900",
};
interface Plan {
  nameKey: string;
  subtitleKey: string;
  price: string;
  periodKey?: string;
  ctaKey: string;
  features: string[];
  popular?: boolean;
  bestValue?: boolean;
  badgeKey?: string;
  saveKey?: string;
}

const plans: Plan[] = [
  {
    nameKey: "pricing.free.name",
    subtitleKey: "pricing.free.subtitle",
    price: "R$ 0",
    ctaKey: "pricing.free.cta",
    features: [
      "pricing.free.f1",
      "pricing.free.f2",
      "pricing.free.f3",
      "pricing.free.f4",
    ],
  },
  {
    nameKey: "pricing.student.name",
    subtitleKey: "pricing.student.subtitle",
    price: prices.student,
    periodKey: "pricing.monthly",
    ctaKey: "pricing.student.cta",
    features: [
      "pricing.student.f1",
      "pricing.student.f2",
      "pricing.student.f3",
      "pricing.student.f4",
      "pricing.student.f5",
      "pricing.student.f6",
      "pricing.student.f7",
    ],
    popular: true,
    badgeKey: "pricing.popular",
  },
  {
    nameKey: "pricing.quarterly.name",
    subtitleKey: "pricing.quarterly.subtitle",
    price: prices.quarterly,
    periodKey: "pricing.quarterly",
    ctaKey: "pricing.quarterly.cta",
    features: [
      "pricing.quarterly.f1",
      "pricing.quarterly.f2",
      "pricing.quarterly.f3",
    ],
    bestValue: true,
    badgeKey: "pricing.bestValue",
    saveKey: "pricing.quarterly.save",
  },
];

const planIcons = [Zap, Sparkles, Crown];

export const PricingSection = () => {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4 tracking-wide uppercase">
            {t("pricing.tag")}
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, i) => {
            const Icon = planIcons[i];
            return (
              <motion.div
                key={plan.nameKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className={`relative rounded-3xl border p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? "border-primary/60 bg-gradient-to-b from-primary/[0.08] via-background to-background shadow-glow lg:scale-[1.05] z-10"
                    : plan.bestValue
                    ? "border-secondary/40 bg-gradient-to-b from-secondary/[0.05] to-background shadow-card"
                    : "border-border bg-card shadow-card"
                }`}
              >
                {/* Badge */}
                {plan.badgeKey && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-5 py-1.5 text-xs font-bold tracking-wide ${
                      plan.popular
                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {t(plan.badgeKey)}
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${
                    plan.popular
                      ? "bg-primary/10 text-primary"
                      : plan.bestValue
                      ? "bg-secondary/10 text-secondary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{t(plan.nameKey)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t(plan.subtitleKey)}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-foreground tracking-tight">
                      {plan.price}
                    </span>
                    {plan.periodKey && (
                      <span className="text-base text-muted-foreground font-medium">
                        {t(plan.periodKey)}
                      </span>
                    )}
                  </div>
                  {plan.saveKey && (
                    <span className="inline-block mt-2 rounded-full bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1">
                      {t(plan.saveKey)}
                    </span>
                  )}
                  {!plan.periodKey && (
                    <span className="block mt-2 text-sm text-muted-foreground font-medium">
                      {t("pricing.free.subtitle")}
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((fKey) => (
                    <li key={fKey} className="flex items-start gap-3 text-sm text-foreground">
                      <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.popular
                          ? "bg-primary/10 text-primary"
                          : plan.bestValue
                          ? "bg-secondary/10 text-secondary"
                          : "bg-accent/10 text-accent"
                      }`}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{t(fKey)}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full py-6 text-base font-bold rounded-xl transition-all duration-200 ${
                    plan.popular
                      ? "bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                      : plan.bestValue
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                  size="lg"
                >
                  {t(plan.ctaKey)}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Payment methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4 font-medium">{t("pricing.payment.title")}</p>
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-5 h-5" />
              <span>{t("pricing.payment.cards")}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <QrCode className="w-5 h-5" />
              <span>{t("pricing.payment.pix")}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
