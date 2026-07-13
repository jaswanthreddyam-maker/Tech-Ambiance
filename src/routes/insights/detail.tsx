import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { publicationRepository } from "../../repositories/publicationRepository";

export const InsightsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = publicationRepository.getBySlug(slug || "");
  const [readingTimeStr, setReadingTimeStr] = useState("Estimating...");
  const contentRef = useRef<HTMLDivElement>(null);
  const nextArticleRef = useRef<HTMLDivElement>(null);
  
  // Get the next article for the Netflix Peek
  const allArticles = publicationRepository.getAll();
  const currentIndex = allArticles.findIndex(a => a.slug === slug);
  const nextArticle = currentIndex >= 0 && currentIndex < allArticles.length - 1 
    ? allArticles[currentIndex + 1] 
    : allArticles[0];

  // Scroll Progress Tracking
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      setCurrentProgress(Math.round(latest * 100));
    });
  }, [scrollYProgress]);

  // Reading Time Animation
  useEffect(() => {
    if (article) {
      setTimeout(() => {
        setReadingTimeStr(`${article.readingTime} min read`);
      }, 800);
    }
  }, [article]);

  if (!article) return <div className="min-h-screen pt-40 text-center">Article not found.</div>;

  const remainingMins = Math.max(1, Math.round(article.readingTime * (1 - currentProgress / 100)));

  return (
    <div className="min-h-screen bg-[#FAF7F0] relative selection:bg-[#0B3D2E] selection:text-[#FAF7F0]">
      
      {/* Scroll Progress Indicator - Left Side */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 h-[40vh] w-[2px] bg-[#0B3D2E]/10 z-50 hidden xl:block">
        <motion.div 
          className="absolute top-0 left-0 w-full bg-[#C5A572] origin-top"
          style={{ scaleY }}
        />
        <div className="absolute top-1/2 -translate-y-1/2 left-4 text-[9px] uppercase tracking-widest font-semibold text-[#0B3D2E]/40 whitespace-nowrap -rotate-90 origin-left">
          {currentProgress}% • ≈ {remainingMins} min
        </div>
      </div>

      <main className="max-w-[800px] mx-auto px-6 md:px-12 pt-40 pb-32">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/insights')}
          className="group flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-[#0B3D2E]/60 hover:text-[#C5A572] transition-colors mb-16"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Blueprint
        </button>

        {/* Article Header */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-[#0B3D2E]">
              {article.category}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#C5A572]" />
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] uppercase tracking-widest font-medium text-[#0B3D2E]/50"
            >
              {readingTimeStr}
            </motion.span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-[#0B3D2E] leading-[1.1] font-light mb-8">
            {article.title}
          </h1>

          <p className="text-xl md:text-2xl text-[#0B3D2E]/60 font-medium leading-relaxed">
            {article.subtitle}
          </p>

          <div className="mt-12 flex items-center gap-4 border-t border-[#0B3D2E]/10 pt-8">
            <div className="w-10 h-10 rounded-full bg-[#0B3D2E]/5 flex items-center justify-center font-serif text-[#0B3D2E]">
              {article.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0B3D2E]">{article.author}</p>
              <p className="text-xs text-[#0B3D2E]/50">Tech Ambiance Engineering</p>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {article.coverImage && (
          <div className="mb-16 rounded-2xl overflow-hidden aspect-[16/9] w-full relative">
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Mock Content */}
        <article ref={contentRef} className="prose prose-lg md:prose-xl prose-stone max-w-none text-[#0B3D2E]/80">
          <p className="lead">{article.excerpt}</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <h2>The Architectural Shift</h2>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <blockquote>
            "The best architectures are the ones that delete code, not add it."
          </blockquote>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
            totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          <div style={{height: "800px"}}></div> {/* Fake length for scrolling */}
          <p>Conclusion</p>
        </article>
      </main>

      {/* Footer CTA */}
      <div className="bg-[#0B3D2E] text-[#FAF7F0] py-24 text-center">
        <h3 className="font-serif text-4xl md:text-5xl font-light mb-8">
          Have a complex problem? <br />
          Let's engineer the solution.
        </h3>
        <button 
          onClick={() => navigate('/contact')}
          className="btn-emerald-stone bg-[#C5A572] text-[#0B3D2E] border-none hover:bg-white px-8 py-4 rounded-full text-xs uppercase tracking-widest font-bold transition-colors"
        >
          Start a Project
        </button>
      </div>

      {/* NETFLIX PEEK - Next Article */}
      <div 
        ref={nextArticleRef}
        className="w-full bg-[#FAF7F0] py-32 border-t border-[#0B3D2E]/10 cursor-pointer group"
        onClick={() => {
          window.scrollTo(0, 0);
          navigate(`/insights/${nextArticle.slug}`);
        }}
      >
        <div className="max-w-[800px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#0B3D2E]/40 mb-6">
            Next Blueprint
          </p>
          <h2 className="font-serif text-4xl md:text-6xl text-[#0B3D2E] group-hover:text-[#C5A572] transition-colors duration-500 font-light">
            {nextArticle.title}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default InsightsDetailPage;
