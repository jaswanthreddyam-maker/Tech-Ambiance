import React from "react";
import type { PublicationArticle } from "../../../repositories/publicationRepository";
import { ArticleRenderer } from "./ArticleRenderer";

interface Props {
  articles: PublicationArticle[];
}

export const BentoGrid: React.FC<Props> = ({ articles }) => {
  // A pattern to create an asymmetric bento grid layout
  const getGridClasses = (index: number) => {
    const patternIndex = index % 8;
    switch (patternIndex) {
      case 0:
        return "col-span-12 md:col-span-8 md:row-span-2 min-h-[400px] md:min-h-[600px]"; // Large hero-ish
      case 1:
        return "col-span-12 md:col-span-4 min-h-[300px]"; // Small stacked
      case 2:
        return "col-span-12 md:col-span-4 min-h-[300px]"; // Small stacked
      case 3:
        return "col-span-12 md:col-span-4 min-h-[350px]"; // 3-col layout
      case 4:
        return "col-span-12 md:col-span-4 min-h-[350px]";
      case 5:
        return "col-span-12 md:col-span-4 min-h-[350px]";
      case 6:
        return "col-span-12 md:col-span-6 min-h-[400px]"; // 2-col layout
      case 7:
        return "col-span-12 md:col-span-6 min-h-[400px]";
      default:
        return "col-span-12 md:col-span-4 min-h-[350px]";
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 auto-rows-min">
      {articles.map((article, index) => (
        <ArticleRenderer 
          key={article.id} 
          article={article} 
          className={getGridClasses(index)} 
        />
      ))}
    </div>
  );
};
