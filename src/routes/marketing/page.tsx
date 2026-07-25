import React, { useEffect } from "react";
import { m } from "framer-motion";
import { useSEO } from "../../providers/SEOProvider";

// Initial Bundle Components
import { HeroSection } from "../../components/organisms/HeroSection";
import { BuiltForSection } from "../../components/organisms/BuiltForSection";
import { SuccessStoriesSection } from "../../components/organisms/SuccessStoriesSection";
import { LazyLoadChunk } from "../../components/layout/LazyLoadChunk";

// Lazy Loaded Chunks
const ChunkA = React.lazy(() => import("./chunks/ChunkA"));
const ChunkB = React.lazy(() => import("./chunks/ChunkB"));
const ChunkC = React.lazy(() => import("./chunks/ChunkC"));

export const MarketingPage: React.FC = () => {
  const { setSEO } = useSEO();

  useEffect(() => {
    setSEO({
      title: "Tech Ambiance | Premium Digital Brand Experience Agency",
      description: "We build modern websites, powerful SEO, scalable web applications, and luxury digital brand experiences. Apple + Framer + Linear inspired studio.",
      keywords: "digital agency, luxury branding, web design, react development, SEO optimization, SaaS application developer, brand studio",
    });
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
      
      <LazyLoadChunk height="min-h-[150vh]">
        <ChunkA />
      </LazyLoadChunk>

      <LazyLoadChunk height="min-h-[150vh]">
        <ChunkB />
      </LazyLoadChunk>

      <LazyLoadChunk height="min-h-[100vh]">
        <ChunkC />
      </LazyLoadChunk>
    </m.div>
  );
};
export default MarketingPage;

