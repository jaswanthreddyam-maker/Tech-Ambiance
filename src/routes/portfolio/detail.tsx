import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { m } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import type { Project } from "../../domain/project/project.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCoverUrl(project: Project): string {
  if (project.images?.cover) return project.images.cover;
  if (project.cover_image_path) {
    if (project.cover_image_path.startsWith('/') || project.cover_image_path.startsWith('http')) return project.cover_image_path;
    return portfolioRepository.getPublicImageUrl(project.cover_image_path);
  }
  return '';
}

function formatMetric(m: { display_prefix?: string | null; value: number; suffix?: string | null }): string {
  return `${m.display_prefix ?? ''}${m.value}${m.suffix ?? ''}`;
}

// ─── Link Type Labels ────────────────────────────────────────────────────────

const LINK_TYPE_LABELS: Record<string, string> = {
  LIVE_WEBSITE: "Visit Live Experience",
  GITHUB: "View Source Code",
  FIGMA: "View Figma Design",
  CASE_STUDY_PDF: "Download Case Study",
  YOUTUBE: "Watch Walkthrough",
  OTHER: "View Link",
};

// ─── Page Component ───────────────────────────────────────────────────────────

const PortfolioDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ["portfolio", "detail", slug],
    queryFn: () => portfolioRepository.getProjectBySlug(slug ?? ''),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F0] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border border-[#0B3027]/20 border-t-[#0B3027] animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027]">Project Not Found</h1>
        <p className="text-[#0B3027]/60 text-sm">The portfolio project you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate("/portfolio")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B3027] text-[#FAF7F0] text-[11px] uppercase tracking-widest font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Portfolio
        </button>
      </div>
    );
  }

  const coverUrl = getCoverUrl(project);
  const projectMetrics = project.metrics ?? [];
  const projectCategories = project.categories ?? [];
  const projectMedia = project.media ?? [];
  const projectLinks = project.links ?? [];
  const techStack = project.technology_stack ?? [];
  const primaryLink = projectLinks.find(l => l.link_type === 'LIVE_WEBSITE') ?? projectLinks[0];

  const caseStudySections = [
    { title: "Overview", content: project.overview },
    { title: "The Challenge", content: project.challenge },
    { title: "Our Solution", content: project.solution },
  ].filter(s => s.content);

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Cover image */}
        <div className="relative h-[50vh] md:h-[65vh] bg-[#0B3027]">
          {coverUrl ? (
            <>
              <img
                src={coverUrl}
                alt={project.title}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B3027] via-[#0B3027]/40 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B3027] to-[#0E3A2F]" />
          )}

          {/* Back button */}
          <m.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute top-6 left-6 z-20"
          >
            <button
              onClick={() => navigate("/portfolio")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-[11px] uppercase tracking-widest font-semibold hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Portfolio
            </button>
          </m.div>

          {/* Hero content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14 z-10">
            <div className="max-w-5xl mx-auto">
              <m.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="flex flex-col gap-4"
              >
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {projectCategories.map(cat => (
                    <span
                      key={cat.slug}
                      className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border"
                      style={{
                        color: cat.color ?? '#C9A56A',
                        borderColor: `${cat.color ?? '#C9A56A'}40`,
                        backgroundColor: `${cat.color ?? '#C9A56A'}15`,
                      }}
                    >
                      {cat.icon && <span className="mr-1">{cat.icon}</span>}
                      {cat.name}
                    </span>
                  ))}
                  {projectCategories.length === 0 && project.industry && (
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#C9A56A] px-3 py-1 rounded-full border border-[#C9A56A]/30 bg-[#C9A56A]/10">
                      {project.industry}
                    </span>
                  )}
                </div>

                <h1 className="font-['Cormorant_Garamond'] font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
                  {project.title}
                </h1>

                {project.description && (
                  <p className="text-white/70 text-base md:text-lg font-light leading-relaxed max-w-2xl">
                    {project.description}
                  </p>
                )}

                {primaryLink && (
                  <div className="pt-2">
                    <a
                      href={primaryLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C9A56A] text-[#0B3027] text-[11px] uppercase tracking-widest font-bold hover:bg-[#D4B578] transition-all shadow-md"
                    >
                      <span>{primaryLink.label ?? 'Visit Live Website'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </m.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics Bar ──────────────────────────────────────────────── */}
      {projectMetrics.length > 0 && (
        <section className="bg-[#0B3027] border-t border-[#C9A56A]/10">
          <div className="max-w-5xl mx-auto px-8 md:px-14 py-8 md:py-10">
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-8 md:gap-14"
            >
              {projectMetrics.map((metric, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="text-3xl md:text-4xl font-['Cormorant_Garamond'] text-[#C9A56A] font-bold leading-none">
                    {formatMetric(metric)}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-white/50">
                    {metric.label}
                  </span>
                </div>
              ))}
            </m.div>
          </div>
        </section>
      )}

      {/* ── Case Study Content ───────────────────────────────────────── */}
      {caseStudySections.length > 0 && (
        <section className="max-w-5xl mx-auto px-8 md:px-14 py-14 md:py-20">
          <div className="grid grid-cols-1 gap-12 md:gap-16">
            {caseStudySections.map((section, idx) => (
              <m.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-[#C9A56A]" />
                  <span className="text-[10px] uppercase tracking-[0.24em] font-bold text-[#C9A56A]">
                    {section.title}
                  </span>
                </div>
                <p className="text-[#0B3027]/75 text-base md:text-lg font-light leading-relaxed pl-7">
                  {section.content}
                </p>
              </m.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Technology Stack ──────────────────────────────────────────── */}
      {techStack.length > 0 && (
        <section className="bg-[#F5F2EB] border-y border-[#0B3027]/[0.06]">
          <div className="max-w-5xl mx-auto px-8 md:px-14 py-10 md:py-14">
            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-col gap-5"
            >
              <span className="text-[10px] uppercase tracking-[0.24em] font-bold text-[#C9A56A]">
                Technology Stack
              </span>
              <div className="flex flex-wrap gap-2.5">
                {techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 rounded-full bg-white border border-[#0B3027]/[0.08] text-[11px] uppercase tracking-wider font-semibold text-[#0B3027]/70 shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </m.div>
          </div>
        </section>
      )}

      {/* ── Media Gallery ─────────────────────────────────────────────── */}
      {projectMedia.length > 0 && (
        <section className="max-w-5xl mx-auto px-8 md:px-14 py-14 md:py-20">
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold text-[#C9A56A] block mb-6">
            Project Gallery
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectMedia.map((media, idx) => {
              const mediaUrl = media.path.startsWith('/') || media.path.startsWith('http')
                ? media.path
                : portfolioRepository.getPublicImageUrl(media.path);

              return (
                <m.div
                  key={media.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="rounded-xl overflow-hidden border border-[#0B3027]/[0.06] bg-white"
                >
                  {media.media_type === 'VIDEO' ? (
                    <video src={mediaUrl} controls className="w-full" />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={media.alt_text ?? project.title}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  )}
                  {media.caption && (
                    <div className="px-4 py-3 border-t border-[#0B3027]/[0.04]">
                      <p className="text-[11px] text-[#0B3027]/50 font-light">{media.caption}</p>
                    </div>
                  )}
                </m.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Links Section ─────────────────────────────────────────────── */}
      {projectLinks.length > 0 && (
        <section className="max-w-5xl mx-auto px-8 md:px-14 pb-14 md:pb-20">
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold text-[#C9A56A] block mb-6">
            Project Links
          </span>
          <div className="flex flex-wrap gap-3">
            {projectLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#0B3027] text-[#FAF7F0] text-[11px] uppercase tracking-widest font-bold hover:bg-[#0E3A2F] transition-all shadow-md group"
              >
                <span>{link.label ?? LINK_TYPE_LABELS[link.link_type] ?? 'View'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#C9A56A] group-hover:translate-x-0.5 transition-transform" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer CTA ───────────────────────────────────────────────── */}
      <section className="bg-[#0B3027] border-t border-[#C9A56A]/10">
        <div className="max-w-4xl mx-auto px-8 md:px-14 py-16 md:py-24 text-center">
          <m.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-5"
          >
            <h2 className="font-['Cormorant_Garamond'] font-bold text-3xl md:text-4xl text-[#FAF7F0] leading-tight">
              Inspired by This Project?
            </h2>
            <p className="text-[#FAF7F0]/60 text-sm font-light max-w-md">
              Let's build something equally exceptional for your brand.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C9A56A] text-[#0B3027] text-[11px] uppercase tracking-widest font-bold hover:bg-[#D4B578] transition-all shadow-md group"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-white/80 text-[11px] uppercase tracking-widest font-semibold hover:border-[#C9A56A]/40 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Projects</span>
              </Link>
            </div>
          </m.div>
        </div>
      </section>
    </div>
  );
};

export default PortfolioDetailPage;
