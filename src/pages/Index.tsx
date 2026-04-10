import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { useState } from "react";

const pricingByCountry = {
  BR: {
    student: "R$ 36,90",
    quarterly: "R$ 99,90",
  },
  AR: {
    student: "AR$ 8.900",
    quarterly: "AR$ 23.900",
  },
};

const Index = () => {
  const browserLang = navigator.language.toLowerCase();
  const detectedCountry = browserLang.includes("pt") ? "BR" : "AR";

  const [selectedCountry, setSelectedCountry] = useState(
    localStorage.getItem("selectedCountry") || detectedCountry
  );

  const pricing = pricingByCountry[selectedCountry as "BR" | "AR"];

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
