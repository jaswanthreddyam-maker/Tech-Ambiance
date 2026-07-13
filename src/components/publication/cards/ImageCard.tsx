import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { PublicationArticle } from "../../../repositories/publicationRepository";

interface Props {
  article: PublicationArticle;
  className?: string;
}

export const ImageCard: React.FC<Props> = ({ article, className = "" }) => {
  return (
    <Link to={`/insights/${article.slug}`} className={`group block relative overflow-hidden rounded-[20px] ${className}`}>
      <div className="absolute inset-0 bg-[#0B3D2E]">
        {article.coverImage && (
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D2E]/90 via-[#0B3D2E]/20 to-transparent pointer-events-none" />
      
      <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C5A572] bg-[#0B3D2E]/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#C5A572]/20">
            {article.category}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-medium text-white/60">
            {article.readingTime} min read
          </span>
        </div>
        <h3 className="font-serif text-3xl md:text-4xl text-[#FAF7F0] leading-[1.1] font-light">
          {article.title}
        </h3>
      </div>
    </Link>
  );
};
