import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { PublicationArticle } from "../../../repositories/publicationRepository";
import { Quote } from "lucide-react";

interface Props {
  article: PublicationArticle;
  className?: string;
}

export const QuoteCard: React.FC<Props> = ({ article, className = "" }) => {
  return (
    <Link to={`/insights/${article.slug}`} className={`group block relative overflow-hidden rounded-[20px] bg-[#0B3D2E] p-8 md:p-12 flex flex-col justify-between ${className}`}>
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
        <Quote className="w-24 h-24 text-[#C5A572]" />
      </div>

      <div className="flex items-center gap-3 mb-12 relative z-10">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C5A572]">
          {article.category}
        </span>
      </div>

      <motion.div
        whileHover={{ x: 5 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10"
      >
        <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#FAF7F0] leading-[1.2] font-light">
          "{article.title}"
        </h3>
        <p className="mt-8 text-xs uppercase tracking-widest text-[#C5A572] font-semibold">
          — {article.author}
        </p>
      </motion.div>
    </Link>
  );
};
