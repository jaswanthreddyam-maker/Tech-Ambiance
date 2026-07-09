import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { portfolioData } from "../../content/portfolio";
import { useScroll } from "../../providers/ScrollProvider";
import { useCursorHover } from "../../hooks/useCursorHover";
import { useSEO } from "../../providers/SEOProvider";
import { ArrowLeft, CheckCircle2, ChevronRight, Compass, Cpu, Layers, Monitor, Search, Sparkles } from "lucide-react";

export const PortfolioDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lenis } = useScroll();
  const { setSEO } = useSEO();
  const hoverProps = useCursorHover("pointer");
  const nextHoverProps = useCursorHover("pointer");

  const project = portfolioData.find((p) => p.id === id);

  useEffect(() => {
    if (!project) {
      navigate("/experience");
      return;
    }

    setSEO({
      title: `${project.client} Case Study | Tech Ambiance`,
      description: project.overview,
    });

    window.scrollTo(0, 0);
  }, [project, navigate, setSEO]);

  if (!project) return null;

  const nextProject = portfolioData.find((p) => p.id === project.nextProjectId) || portfolioData[0];

  const caseStudySections = [
    { title: "Overview", content: project.overview, icon: Compass },
    { title: "The Challenge", content: project.challenge, icon: Sparkles },
    { title: "Research & Strategy", content: project.research, icon: Search },
    { title: "Wireframes", content: project.wireframes, icon: Layers },
    { title: "UI & Aesthetics", content: project.ui, icon: Monitor },
    { title: "Development", content: project.development, icon: Cpu },
    { title: "SEO Strategy", content: project.seo, icon: CheckCircle2 },
    { title: "Performance Goals", content: project.performance, icon: CheckCircle2 },
    { title: "Animations & Motion", content: project.animations, icon: CheckCircle2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full pt-32 pb-24 text-left"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Back Link */}
        <Link
          to="/experience"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-text-secondary hover:text-gold transition-colors mb-12"
          {...hoverProps}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold select-none">
              In-Depth Case Study
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-text-primary leading-tight tracking-tight">
              {project.title}
            </h1>
          </div>
          
          <div className="lg:col-span-4 flex flex-col gap-1 border-l border-border-custom pl-6">
            <div className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">
              Results achieved
            </div>
            <div className="text-xl font-bold text-gold">
              {project.results}
            </div>
          </div>
        </div>

        {/* Mockup screen banner */}
        <div className="w-full aspect-[21/9] rounded-2xl border border-border-custom bg-white shadow-premium overflow-hidden p-1 flex flex-col mb-20 select-none">
          <div className="h-5 bg-white border-b border-border-custom flex items-center gap-1.5 px-3 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5F56]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#27C93F]" />
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-3 flex-grow bg-bg-primary rounded-md mx-8 flex items-center justify-center text-[7px] text-text-secondary tracking-widest uppercase hover:text-gold"
                {...hoverProps}
              >
                {project.liveUrl}
              </a>
            )}
          </div>
          <div
            style={{ background: project.imageUrl }}
            className="flex-grow flex items-center justify-center p-12 relative"
          >
            <div className="text-center flex flex-col gap-3">
              <Monitor className="w-12 h-12 text-gold mx-auto mb-2 opacity-80 animate-pulse" />
              <h3 className="font-heading text-2xl md:text-3xl font-light text-text-primary">
                {project.client}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-semibold">
                {project.industry} &bull; {project.duration}
              </p>
            </div>
          </div>
        </div>

        {/* Case Study Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          {/* Metadata parameters (Left) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 self-start flex flex-col gap-6 p-6 bg-white border border-border-custom rounded-2xl shadow-sm">
            <h3 className="font-heading text-lg font-bold text-text-primary border-b border-border-custom pb-3">
              Project Parameters
            </h3>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                Client Brand
              </span>
              <span className="text-sm font-semibold text-text-primary">{project.client}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                Industry Segment
              </span>
              <span className="text-sm font-semibold text-text-primary">{project.industry}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                Timeline Duration
              </span>
              <span className="text-sm font-semibold text-text-primary">{project.duration}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                Technologies
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-[9px] uppercase tracking-widest font-bold bg-bg-primary px-2.5 py-1 border border-border-custom text-text-secondary rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Structured Sections (Right) */}
          <div className="lg:col-span-8 flex flex-col gap-12 pl-0 lg:pl-8 border-l border-transparent lg:border-border-custom/60">
            {caseStudySections.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div key={idx} className="flex flex-col gap-3 pb-8 border-b border-border-custom/50 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3 text-gold">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                      Section {idx + 1}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-text-primary">
                    {sec.title}
                  </h3>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-light">
                    {sec.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom row: Next Case Study trigger */}
        <div className="border-t border-border-custom pt-16 flex flex-col items-center text-center gap-6">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-text-secondary select-none">
            Next Project
          </span>
          <Link
            to={`/experience/portfolio/${nextProject.id}`}
            onClick={() => lenis?.scrollTo(0)}
            className="group flex flex-col items-center gap-3"
            {...nextHoverProps}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-light text-text-primary hover:text-gold transition-colors leading-tight">
              {nextProject.client}{" "}
              <ChevronRight className="inline-block w-8 h-8 group-hover:translate-x-2 transition-transform duration-300 ml-1" />
            </h2>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
export default PortfolioDetails;
