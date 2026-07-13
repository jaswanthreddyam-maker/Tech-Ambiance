import React from "react";
import { motion } from "framer-motion";
import type { PublicationCategory } from "../../../repositories/publicationRepository";

interface Props {
  categories: (PublicationCategory | "All")[];
  activeCategory: string;
  onSelect: (category: PublicationCategory | "All") => void;
}

export const BlueprintTabs: React.FC<Props> = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className="flex items-center gap-6 border-b border-[#0B3D2E]/10 overflow-x-auto no-scrollbar">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(category as PublicationCategory | "All")}
            className={`relative py-4 text-xs font-semibold uppercase tracking-widest transition-colors duration-300 whitespace-nowrap ${
              isActive ? "text-[#0B3D2E]" : "text-[#0B3D2E]/40 hover:text-[#0B3D2E]/70"
            }`}
          >
            {category}
            {isActive && (
              <motion.div
                layoutId="blueprint-tab-indicator"
                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#0B3D2E]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
