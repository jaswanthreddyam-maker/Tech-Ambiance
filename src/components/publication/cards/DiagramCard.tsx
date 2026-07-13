import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PublicationArticle } from "../../../repositories/publicationRepository";
import { Network } from "lucide-react";

interface Props {
  article: PublicationArticle;
  className?: string;
}

export const DiagramCard: React.FC<Props> = ({ article, className = "" }) => {
  return (
    <Link to={`/insights/${article.slug}`} className={`group block relative overflow-hidden rounded-[20px] bg-white border border-[#0B3D2E]/10 p-8 flex flex-col justify-between ${className}`}>
      
      {/* Abstract Diagram Background */}
      <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none flex items-center justify-center">
        <motion.div
          whileHover={{ rotate: 90, scale: 1.1 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          <Network className="w-96 h-96 text-[#0B3D2E]" strokeWidth={0.5} />
        </motion.div>
      </div>

      <div className="flex items-center gap-3 mb-16 relative z-10">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-[#0B3D2E] bg-[#FAF7F0] px-3 py-1.5 rounded-full">
          {article.category}
        </span>
      </div>

      <div className="relative z-10">
        <p className="text-xs font-mono text-[#C5A572] mb-3 uppercase tracking-wider">Fig 1. Architecture</p>
        <h3 className="font-serif text-2xl md:text-3xl text-[#0B3D2E] leading-[1.2] font-medium group-hover:text-[#C5A572] transition-colors duration-300">
          {article.title}
        </h3>
        {article.subtitle && (
          <p className="mt-3 text-sm text-[#0B3D2E]/60 font-medium line-clamp-2">
            {article.subtitle}
          </p>
        )}
      </div>
    </Link>
  );
};
