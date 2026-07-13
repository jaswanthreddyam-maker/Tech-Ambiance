import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { Project, PortfolioCategory } from "../../domain/project/project.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCoverUrl(project: Project): string {
  if (project.images?.cover) return project.images.cover;
  if (project.cover_image_path) {
    if (project.cover_image_path.startsWith('/') || project.cover_image_path.startsWith('http')) return project.cover_image_path;
    return portfolioRepository.getPublicImageUrl(project.cover_image_path);
  }
  return '';
}

function getPrimaryLink(project: Project): string | undefined {
  const liveLink = project.links?.find(l => l.link_type === 'LIVE_WEBSITE');
  return liveLink?.url ?? project.url;
}

function formatMetric(m: { display_prefix?: string | null; value: number; suffix?: string | null }): string {
  return `${m.display_prefix ?? ''}${m.value}${m.suffix ?? ''}`;
}

// ─── Page Component ───────────────────────────────────────────────────────────

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: projects = [] } = useQuery({
    queryKey: ["portfolio", "published"],
    queryFn: () => portfolioRepository.getPublishedProjects(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["portfolio", "categories"],
    queryFn: () => portfolioRepository.getCategories(),
    staleTime: 10 * 60 * 1000,
  });

  // Derive unique categories from projects as fallback
  const effectiveCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    const seen = new Map<string, PortfolioCategory>();
    projects.forEach(p => {
      (p.categories ?? []).forEach(c => {
        if (!seen.has(c.slug)) seen.set(c.slug, c);
      });
      // Also derive from legacy industry
      if (p.industry && !seen.has(p.industry.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-'))) {
        const slug = p.industry.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-');
        seen.set(slug, { id: slug, name: p.industry, slug, display_order: 99 });
      }
    });
    return Array.from(seen.values()).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [categories, projects]);

  // Filter projects by active category
  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") return projects;
    return projects.filter(p => {
      const matchesCategory = (p.categories ?? []).some(c => c.slug === activeCategory);
      const matchesIndustry = p.industry?.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-') === activeCategory;
      return matchesCategory || matchesIndustry;
    });
  }, [projects, activeCategory]);

  // Count projects per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    effectiveCategories.forEach(c => {
      counts[c.slug] = projects.filter(p => {
        const matchesCategory = (p.categories ?? []).some(cat => cat.slug === c.slug);
        const matchesIndustry = p.industry?.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-') === c.slug;
        return matchesCategory || matchesIndustry;
      }).length;
    });
    return counts;
  }, [projects, effectiveCategories]);

  const handleProjectClick = (project: Project) => {
    const liveUrl = getPrimaryLink(project);
    if (liveUrl) {
      window.open(liveUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/portfolio/${project.slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        {/* Decorative golden veins */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-[10%] w-[1px] h-[300px] bg-gradient-to-b from-transparent via-[#C9A56A]/20 to-transparent rotate-12" />
          <div className="absolute top-40 right-[25%] w-[1px] h-[200px] bg-gradient-to-b from-transparent via-[#C9A56A]/15 to-transparent -rotate-6" />
          <div className="absolute bottom-10 left-[15%] w-[1px] h-[250px] bg-gradient-to-b from-transparent via-[#C9A56A]/10 to-transparent rotate-3" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-col items-center text-center gap-5"
          >
            <span className="text-[11px] uppercase font-bold tracking-[0.28em] text-[#C9A56A] select-none">
              Selected Case Studies
            </span>
            <h1 className="font-['Cormorant_Garamond'] font-bold text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] text-[#0B3027] leading-[1.08] tracking-tight max-w-4xl">
              Digital Flagships That{" "}
              <span className="font-['Cormorant_Garamond'] italic text-[#C9A56A] font-normal">Define</span>{" "}
              Industries
            </h1>
            <p className="text-[#0B3027]/60 text-sm sm:text-base font-light leading-relaxed max-w-2xl tracking-wide">
              Every project is an exercise in precision engineering and cinematic brand storytelling.
              Explore our portfolio of high-performance digital experiences.
            </p>
          </m.div>
        </div>
      </section>

      {/* ── Category Filter Bar ──────────────────────────────────────── */}
      <section className="sticky top-[72px] z-30 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#0B3027]/[0.06]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
            className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-1"
          >
            {/* All pill */}
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] uppercase tracking-wider font-semibold transition-all duration-300 whitespace-nowrap border ${
                activeCategory === "all"
                  ? "bg-[#0B3027] text-[#FAF7F0] border-[#0B3027] shadow-md"
                  : "bg-white text-[#0B3027]/70 border-[#0B3027]/10 hover:border-[#C9A56A]/40 hover:text-[#0B3027]"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>All</span>
              <span className={`ml-1 text-[9px] font-mono ${activeCategory === "all" ? "text-[#C9A56A]" : "text-[#0B3027]/40"}`}>
                {categoryCounts.all ?? 0}
              </span>
            </button>

            {effectiveCategories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] uppercase tracking-wider font-semibold transition-all duration-300 whitespace-nowrap border ${
                  activeCategory === cat.slug
                    ? "bg-[#0B3027] text-[#FAF7F0] border-[#0B3027] shadow-md"
                    : "bg-white text-[#0B3027]/70 border-[#0B3027]/10 hover:border-[#C9A56A]/40 hover:text-[#0B3027]"
                }`}
              >
                {cat.icon && <span className="text-sm">{cat.icon}</span>}
                <span>{cat.name}</span>
                <span className={`ml-1 text-[9px] font-mono ${activeCategory === cat.slug ? "text-[#C9A56A]" : "text-[#0B3027]/40"}`}>
                  {categoryCounts[cat.slug] ?? 0}
                </span>
              </button>
            ))}
          </m.div>
        </div>
      </section>

      {/* ── Project Grid ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <AnimatePresence mode="popLayout">
          <m.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10"
          >
            {filteredProjects.map((project, idx) => {
              const coverUrl = getCoverUrl(project);
              const liveUrl = getPrimaryLink(project);
              const projectMetrics = project.metrics ?? [];
              const projectCategories = project.categories ?? [];

              return (
                <m.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: idx * 0.08 }}
                  onClick={() => handleProjectClick(project)}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-2xl border border-[#0B3027]/[0.06] overflow-hidden hover:border-[#C9A56A]/40 transition-all duration-500 shadow-[0_4px_24px_rgba(6,41,30,0.04)] hover:shadow-[0_8px_40px_rgba(201,165,106,0.12)]">

                    {/* ── Cover Image Area ─────────────────────────── */}
                    <div className="aspect-[16/10] bg-[#F5F2EB] relative overflow-hidden">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={project.title}
                          className="w-full h-full object-cover object-top transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0B3027] to-[#0E3A2F] flex items-center justify-center">
                          <div className="w-20 h-20 border border-[#C9A56A]/20 rounded-full" />
                        </div>
                      )}

                      {/* Hover overlay with metrics */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B3027]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                        {projectMetrics.length > 0 && (
                          <div className="flex gap-6">
                            {projectMetrics.slice(0, 3).map((metric, mIdx) => (
                              <div key={mIdx} className="flex flex-col gap-0.5">
                                <span className="text-2xl font-['Cormorant_Garamond'] text-[#C9A56A] font-bold leading-none">
                                  {formatMetric(metric)}
                                </span>
                                <span className="text-[9px] uppercase tracking-widest text-white/70 font-semibold">
                                  {metric.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Live demo badge */}
                      {liveUrl && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#0B3027]/[0.06] shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] uppercase tracking-widest font-bold text-[#0B3027]/70">Live</span>
                        </div>
                      )}
                    </div>

                    {/* ── Content Area ─────────────────────────────── */}
                    <div className="p-7 md:p-8 flex flex-col gap-3">
                      {/* Category tags + arrow */}
                      <div className="flex justify-between items-start">
                        <div className="flex flex-wrap gap-1.5">
                          {projectCategories.length > 0 ? (
                            projectCategories.slice(0, 2).map(cat => (
                              <span
                                key={cat.slug}
                                className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded"
                                style={{
                                  color: cat.color ?? '#C9A56A',
                                  backgroundColor: `${cat.color ?? '#C9A56A'}15`,
                                }}
                              >
                                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                                {cat.name}
                              </span>
                            ))
                          ) : project.industry ? (
                            <span className="text-[9px] uppercase tracking-widest font-bold text-[#C9A56A]">
                              {project.industry}
                            </span>
                          ) : null}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#0B3027]/25 group-hover:text-[#C9A56A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                      </div>

                      {/* Title */}
                      <h3 className="font-['Cormorant_Garamond'] text-2xl md:text-[1.7rem] font-bold text-[#0B3027] leading-snug">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="text-[#0B3027]/55 text-sm font-light leading-relaxed line-clamp-2">
                        {project.description}
                      </p>

                      {/* Technology stack */}
                      <div className="flex flex-wrap gap-1.5 mt-2 pt-4 border-t border-[#0B3027]/[0.06]">
                        {(project.technology_stack ?? project.services ?? []).slice(0, 3).map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[9px] uppercase tracking-wider font-semibold text-[#0B3027]/50 bg-[#0B3027]/[0.03] px-2.5 py-1 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </m.div>
              );
            })}
          </m.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="w-16 h-16 rounded-full border border-[#C9A56A]/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#C9A56A]/40" />
            </div>
            <p className="text-[#0B3027]/40 text-sm font-light">No projects in this category yet.</p>
          </m.div>
        )}
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────── */}
      <section className="bg-[#0B3027] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[20%] w-[1px] h-[150px] bg-gradient-to-b from-transparent via-[#C9A56A]/15 to-transparent rotate-12" />
          <div className="absolute bottom-10 right-[30%] w-[1px] h-[120px] bg-gradient-to-b from-transparent via-[#C9A56A]/10 to-transparent -rotate-6" />
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center relative z-10">
          <m.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <span className="text-[11px] uppercase font-bold tracking-[0.28em] text-[#C9A56A]/80 select-none">
              Start Your Project
            </span>
            <h2 className="font-['Cormorant_Garamond'] font-bold text-3xl sm:text-4xl md:text-5xl text-[#FAF7F0] leading-tight max-w-2xl">
              Ready to Build Your{" "}
              <span className="italic text-[#C9A56A] font-normal">Digital Flagship?</span>
            </h2>
            <p className="text-[#FAF7F0]/60 text-sm font-light leading-relaxed max-w-lg">
              We partner with ambitious enterprises to architect high-performance digital experiences.
              Let's discuss your vision.
            </p>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="mt-2 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#C9A56A] text-[#0B3027] text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#D4B578] transition-all duration-300 shadow-[0_4px_20px_rgba(201,165,106,0.3)] group"
            >
              <span>Begin Your Journey</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </m.div>
        </div>
      </section>
    </div>
  );
};

export default PortfolioPage;
