import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { useState } from "react";
const PASSWORD = "01112001"; // troca pela sua senha
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
  const [input, setInput] = useState("");
const [authorized, setAuthorized] = useState(false);
  const browserLang = navigator.language.toLowerCase();
  const detectedCountry = browserLang.includes("pt") ? "BR" : "AR";

  const [selectedCountry, setSelectedCountry] = useState(
    localStorage.getItem("selectedCountry") || detectedCountry
  );

  const pricing = pricingByCountry[selectedCountry as "BR" | "AR"];

  if (!authorized) {
  return (
    <div style={{display:"flex",height:"100vh",justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
      <h2>Digite a senha</h2>
      <input
        type="password"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={() => {
        if (input === PASSWORD) setAuthorized(true);
      }}>
        Entrar
      </button>
    </div>
  );
}
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
