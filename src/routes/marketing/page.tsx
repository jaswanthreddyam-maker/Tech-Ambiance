import React, { useEffect } from "react";
import { m } from "framer-motion";
import { useSEO } from "../../providers/SEOProvider";

// Section components
import { HeroSection } from "../../components/organisms/HeroSection";
import { BuiltForSection } from "../../components/organisms/BuiltForSection";
import { SuccessStoriesSection } from "../../components/organisms/SuccessStoriesSection";
import { ShowreelSection } from "../../components/organisms/ShowreelSection";
import { ServicesSection } from "../../components/organisms/ServicesSection";
import { PortfolioSection } from "../../components/organisms/PortfolioSection";
import { DifferenceSection } from "../../components/organisms/DifferenceSection";
import { ProcessSection } from "../../components/organisms/ProcessSection";
import { TeamSection } from "../../components/organisms/TeamSection";
import { TestimonialsSection } from "../../components/organisms/TestimonialsSection";
import { ContactSection } from "../../components/organisms/ContactSection";

export const MarketingPage: React.FC = () => {
  const { setSEO } = useSEO();

  useEffect(() => {
    // Dynamic metadata setting for Tech Ambiance Marketing Home
    setSEO({
      title: "Tech Ambiance | Premium Digital Brand Experience Agency",
      description: "We build modern websites, powerful SEO, scalable web applications, and luxury digital brand experiences. Apple + Framer + Linear inspired studio.",
      keywords: "digital agency, luxury branding, web design, react development, SEO optimization, SaaS application developer, brand studio",
    });

    // Reset window scroll position on mount
    window.scrollTo(0, 0);
  }, [setSEO]);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full flex flex-col"
    >
      <HeroSection />
      <BuiltForSection />
      <SuccessStoriesSection />
      <ShowreelSection />
      <ServicesSection />
      <PortfolioSection />
      <DifferenceSection />
      <ProcessSection />
      <TeamSection />
      <TestimonialsSection />
      <ContactSection />
    </m.div>
  );
};
export default MarketingPage;

