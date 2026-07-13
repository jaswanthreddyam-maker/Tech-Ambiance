import React, { useState } from "react";
import { publicationRepository, PublicationCategory } from "../../repositories/publicationRepository";
import { BlueprintAtmosphere } from "../../components/ui/BlueprintAtmosphere";
import { BlueprintTabs } from "../../components/publication/filters/BlueprintTabs";
import { FeaturedCover } from "../../components/publication/cards/FeaturedCover";
import { BentoGrid } from "../../components/publication/cards/BentoGrid";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const InsightsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<PublicationCategory | "All">("All");

  const categories: (PublicationCategory | "All")[] = ["All", "Engineering", "Design", "Strategy", "Case Studies", "Journal"];
  const allArticles = publicationRepository.getAll();
  const featuredArticle = publicationRepository.getFeatured();
  
  // Filter out the featured article from the grid if it's the 'All' category, to avoid duplication
  const gridArticles = activeCategory === "All" 
    ? allArticles.filter(a => a.id !== featuredArticle.id)
    : publicationRepository.getByCategory(activeCategory);

  return (
    <div className="min-h-screen bg-[#FAF7F0] relative overflow-hidden pt-32 pb-32">
      <BlueprintAtmosphere />

      <main className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* HERO SECTION */}
        <section className="py-24 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#0B3D2E] leading-[1.05] font-light mb-8">
              Every great business <br />
              starts with a blueprint.
            </h1>
            <p className="text-lg md:text-xl text-[#0B3D2E]/70 font-medium max-w-2xl leading-relaxed">
              Engineering, design and strategy from the people building modern digital businesses.
            </p>
          </motion.div>
        </section>

        {/* FEATURED COVER STORY */}
        {activeCategory === "All" && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <FeaturedCover article={featuredArticle} />
          </motion.section>
        )}

        {/* TABS & BENTO GRID */}
        <section className="mb-32">
          <div className="mb-12">
            <BlueprintTabs 
              categories={categories} 
              activeCategory={activeCategory} 
              onSelect={setActiveCategory} 
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <BentoGrid articles={gridArticles} />
            </motion.div>
          </AnimatePresence>
        </section>

        {/* COLLECTIONS SECTION */}
        <section className="py-24 border-t border-[#0B3D2E]/10">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-[#0B3D2E] mb-12">
            Curated Collections
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicationRepository.getAllCollections?.()?.map(collection => (
              <div key={collection} className="group cursor-pointer p-8 rounded-2xl bg-white border border-[#0B3D2E]/5 hover:border-[#C5A572]/30 hover:shadow-lg transition-all duration-300">
                <h4 className="font-serif text-2xl text-[#0B3D2E] group-hover:text-[#C5A572] transition-colors duration-300 mb-4">{collection}</h4>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-[#0B3D2E]/50">
                  Explore Collection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default InsightsPage;
