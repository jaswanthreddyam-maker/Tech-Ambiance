import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { PublicationArticle } from "../../../repositories/publicationRepository";
import { ArrowRight } from "lucide-react";

interface Props {
  article: PublicationArticle;
}

export const FeaturedCover: React.FC<Props> = ({ article }) => {
  return (
    <div className="mb-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[1px] flex-1 bg-[#0B3D2E]/10" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0B3D2E]">
          Cover Story
        </span>
        <div className="h-[1px] flex-1 bg-[#0B3D2E]/10" />
      </div>

      <Link 
        to={`/insights/${article.slug}`} 
        className="group block relative overflow-hidden rounded-3xl"
      >
        <div className="aspect-[16/9] lg:aspect-[21/9] w-full relative bg-[#0B3D2E]">
          {article.coverImage && (
            <motion.img
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-1000"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D2E] via-[#0B3D2E]/40 to-transparent pointer-events-none" />
          
          <div className="absolute inset-0 p-10 md:p-16 flex flex-col justify-end z-10 max-w-5xl">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#C5A572] bg-[#0B3D2E]/50 backdrop-blur-md px-4 py-2 rounded-full border border-[#C5A572]/20">
                {article.category}
              </span>
              <span className="text-xs uppercase tracking-widest font-medium text-white/60">
                {article.readingTime} min read
              </span>
            </div>
            
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#FAF7F0] leading-[1.05] font-light mb-6">
              {article.title}
            </h2>
            
            <p className="text-lg md:text-xl text-[#FAF7F0]/70 font-medium max-w-3xl mb-10 line-clamp-2">
              {article.subtitle}
            </p>
            
            <div className="flex items-center gap-3 text-[#C5A572] font-semibold uppercase tracking-widest text-sm">
              Read Story
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
