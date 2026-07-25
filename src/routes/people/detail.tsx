import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { craftsmanRepository } from '../../repositories/craftsmanRepository';
import { useSEO } from '../../providers/SEOProvider';

export const CraftsmanDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { setSEO } = useSEO();

  const { data: craftsman, isLoading, isError } = useQuery({
    queryKey: ['craftsman', 'detail', slug],
    queryFn: () => craftsmanRepository.getCraftsmanBySlug(slug ?? ''),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (craftsman) {
      setSEO({
        title: `${craftsman.full_name} — ${craftsman.headline_title} | Tech Ambiance`,
        description: craftsman.biography || `Craftsman profile for ${craftsman.full_name} at Tech Ambiance Studio.`,
      });
    }
    window.scrollTo(0, 0);
  }, [craftsman, setSEO]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F0] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border border-forest/20 border-t-gold animate-spin" />
      </div>
    );
  }

  if (isError || !craftsman) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center gap-6 px-6 text-forest">
        <h1 className="font-heading text-4xl font-bold">Craftsman Profile Not Found</h1>
        <p className="text-text-secondary text-sm">The craftsman profile you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/people')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest text-ivory text-xs uppercase tracking-widest font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Roster
        </button>
      </div>
    );
  }

  const initials = craftsman.full_name
    ? craftsman.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'TA';

  const contributedProjects = craftsman.contributed_projects || [];

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-forest select-none pb-24">
      {/* ── Breadcrumbs ────────────────────────────────────────────────────── */}
      <nav className="pt-28 md:pt-36 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-forest/60">
        <Link to="/people" className="hover:text-gold transition-colors">People</Link>
        <ChevronRight className="w-3 h-3 text-gold" />
        <span className="text-gold">{craftsman.full_name}</span>
      </nav>

      {/* ── Craftsman Profile Hero ─────────────────────────────────────────── */}
      <section className="pt-8 pb-16 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 border-b border-forest/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Portrait Avatar */}
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-4"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-forest/5 border border-forest/15 shadow-premium flex items-center justify-center">
              {craftsman.avatar_url ? (
                <img
                  src={craftsman.avatar_url}
                  alt={craftsman.full_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-forest text-gold font-heading font-black text-3xl flex items-center justify-center shadow-lg">
                  {initials}
                </div>
              )}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-forest text-gold text-[10px] uppercase tracking-widest font-bold border border-gold/40">
                {craftsman.member_type || 'EMPLOYEE'}
              </div>
            </div>
          </m.div>

          {/* Craftsman Bio & Details */}
          <div className="lg:col-span-8 flex flex-col items-start">
            <span className="text-xs uppercase tracking-[0.28em] font-bold text-gold mb-3">
              Craftsman Profile
            </span>

            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-forest mb-3 tracking-tight">
              {craftsman.full_name}
            </h1>

            <p className="text-sm uppercase tracking-widest font-bold text-gold mb-6">
              {craftsman.headline_title}
            </p>

            {craftsman.philosophy_quote && (
              <blockquote className="border-l-2 border-gold pl-5 italic font-serif text-lg text-forest/90 mb-6 max-w-2xl">
                "{craftsman.philosophy_quote}"
              </blockquote>
            )}

            {craftsman.biography && (
              <p className="text-sm sm:text-base text-text-secondary font-light leading-relaxed max-w-2xl mb-8">
                {craftsman.biography}
              </p>
            )}

            {/* Social Links */}
            {craftsman.social_links && (
              <div className="flex flex-wrap items-center gap-4 border-t border-forest/10 pt-6 w-full">
                <span className="text-[10px] uppercase tracking-widest font-bold text-forest/60">Connect:</span>
                {craftsman.social_links.github && (
                  <a href={craftsman.social_links.github} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-forest hover:text-gold transition-colors">
                    GitHub
                  </a>
                )}
                {craftsman.social_links.linkedin && (
                  <a href={craftsman.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-forest hover:text-gold transition-colors">
                    LinkedIn
                  </a>
                )}
                {craftsman.social_links.twitter && (
                  <a href={craftsman.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-forest hover:text-gold transition-colors">
                    Twitter
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Expertise & Selected Disciplines ───────────────────────────── */}
      {craftsman.expertise_tags && craftsman.expertise_tags.length > 0 && (
        <section className="py-12 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 border-b border-forest/10">
          <span className="text-[10px] uppercase tracking-[0.28em] font-bold text-gold block mb-4">
            Core Expertise & Disciplines
          </span>
          <div className="flex flex-wrap gap-2.5">
            {craftsman.expertise_tags.map(tag => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full bg-white border border-forest/15 text-xs font-bold uppercase tracking-wider text-forest shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Projects Contributed Grid ──────────────────────────────────────── */}
      <section className="py-20 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 border-b border-forest/10 pb-6 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.28em] font-bold text-gold block mb-2">
              Studio Contribution Showcase
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-forest">
              Projects {craftsman.full_name.split(' ')[0]} Contributed To
            </h2>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-text-secondary">
            Collaborative Flagships
          </span>
        </div>

        {contributedProjects.length === 0 ? (
          <div className="py-16 text-center text-text-secondary text-sm font-light bg-white/50 rounded-3xl border border-forest/10">
            No public contributions linked yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contributedProjects.map((proj) => (
              <m.div
                key={proj.publication_id || proj.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                onClick={() => navigate(`/portfolio/${proj.slug}`)}
                className="group bg-white border border-forest/10 hover:border-gold rounded-3xl overflow-hidden shadow-sm hover:shadow-premium transition-all duration-500 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Cover Image */}
                  <div className="relative aspect-[16/10] bg-forest/10 overflow-hidden">
                    {proj.cover_url ? (
                      <img
                        src={proj.cover_url}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-forest flex items-center justify-center text-gold font-heading font-bold text-lg">
                        {proj.title}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-forest/90 text-gold text-[9px] uppercase tracking-widest font-bold border border-gold/30">
                      {proj.role_name}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-heading font-bold text-2xl text-forest mb-2 group-hover:text-gold transition-colors">
                      {proj.title}
                    </h3>

                    {proj.contribution_summary && (
                      <p className="text-xs text-text-secondary font-light leading-relaxed line-clamp-2 mb-4">
                        {proj.contribution_summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-forest/10 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-forest">
                  <span>View Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1 transition-transform" />
                </div>
              </m.div>
            ))}
          </div>
        )}
      </section>

      {/* ── Back to Roster Footer CTA ─────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-8">
        <button
          onClick={() => navigate('/people')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest text-ivory text-xs uppercase tracking-widest font-bold hover:bg-gold hover:text-forest transition-colors shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Craftsmen</span>
        </button>
      </div>
    </div>
  );
};
export default CraftsmanDetailPage;
