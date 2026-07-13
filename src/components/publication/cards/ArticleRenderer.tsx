import React from "react";
import type { PublicationArticle } from "../../../repositories/publicationRepository";
import { ImageCard } from "./ImageCard";
import { TypographyCard } from "./TypographyCard";
import { QuoteCard } from "./QuoteCard";
import { DiagramCard } from "./DiagramCard";
import { CaseStudyCard } from "./CaseStudyCard";

interface Props {
  article: PublicationArticle;
  className?: string;
}

export const ArticleRenderer: React.FC<Props> = ({ article, className = "" }) => {
  switch (article.type) {
    case "image":
      return <ImageCard article={article} className={className} />;
    case "typography":
      return <TypographyCard article={article} className={className} />;
    case "quote":
      return <QuoteCard article={article} className={className} />;
    case "diagram":
      return <DiagramCard article={article} className={className} />;
    case "case_study":
      return <CaseStudyCard article={article} className={className} />;
    default:
      return <TypographyCard article={article} className={className} />;
  }
};
