import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PublicationArticle } from "../../../repositories/publicationRepository";
import { ArrowUpRight } from "lucide-react";

interface Props {
  article: PublicationArticle;
  className?: string;
}

export const CaseStudyCard: React.FC<Props> = ({ article, className = "" }) => {
  return (
    <Link to={`/insights/${article.slug}`} className={`group block relative overflow-hidden rounded-[20px] bg-[#0B3D2E] border border-[#C5A572]/20 p-8 md:p-10 flex flex-col justify-between ${className}`}>
      
      <div className="flex items-center justify-between relative z-10 mb-8">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-[#0B3D2E] bg-[#C5A572] px-3 py-1.5 rounded-full">
          {article.category}
        </span>
        <ArrowUpRight className="w-5 h-5 text-[#C5A572] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <h3 className="font-serif text-3xl text-[#FAF7F0] leading-[1.2] font-medium group-hover:text-[#C5A572] transition-colors duration-300">
          {article.title}
        </h3>
        
        {/* Faux Metric Block for visual impact */}
        <div className="pt-6 border-t border-[#C5A572]/20 mt-2">
          <p className="text-4xl font-light text-[#C5A572] font-serif mb-1">+42%</p>
          <p className="text-xs uppercase tracking-widest text-[#FAF7F0]/60 font-semibold">Conversion Lift</p>
        </div>
      </div>
    </Link>
  );
};
