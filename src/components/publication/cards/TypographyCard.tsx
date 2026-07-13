import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PublicationArticle } from "../../../repositories/publicationRepository";

interface Props {
  article: PublicationArticle;
  className?: string;
}

export const TypographyCard: React.FC<Props> = ({ article, className = "" }) => {
  return (
    <Link to={`/insights/${article.slug}`} className={`group block relative overflow-hidden rounded-[20px] bg-[#FAF7F0] border border-[#0B3D2E]/10 p-8 md:p-12 flex flex-col justify-between ${className}`}>
      
      <div className="flex items-center gap-3 mb-12">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-[#0B3D2E]">
          {article.category}
        </span>
        <span className="w-1 h-1 rounded-full bg-[#C5A572]" />
        <span className="text-[10px] uppercase tracking-widest font-medium text-[#0B3D2E]/50">
          {article.readingTime} min read
        </span>
      </div>

      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#0B3D2E] leading-[1.05] font-light tracking-tight group-hover:text-[#C5A572] transition-colors duration-500">
          "{article.title}"
        </h3>
        {article.subtitle && (
          <p className="mt-6 text-sm md:text-base text-[#0B3D2E]/70 font-medium max-w-[80%]">
            {article.subtitle}
          </p>
        )}
      </motion.div>
    </Link>
  );
};
