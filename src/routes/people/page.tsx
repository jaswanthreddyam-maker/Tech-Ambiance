import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { ArrowRight, Code2, Layers, Cpu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { craftsmanRepository } from '../../repositories/craftsmanRepository';
import { MarbleVeins } from '../../components/ui/MarbleVeins';
import { useSEO } from '../../providers/SEOProvider';

export const PeoplePage: React.FC = () => {
  const navigate = useNavigate();
  const { setSEO } = useSEO();

  useEffect(() => {
    setSEO({
      title: "Studio Craftsmen & Engineering Roster | Tech Ambiance",
      description: "Meet the team of architects, designers, and engineers pioneering digital flagships, calm motion, and sub-40ms edge systems.",
    });
    window.scrollTo(0, 0);
  }, [setSEO]);

  const { data: craftsmen = [], isLoading, isError } = useQuery({
    queryKey: ['craftsmen', 'all'],
    queryFn: () => craftsmanRepository.getAllCraftsmen(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-forest select-none">
      {/* ── 1. Editorial Hero Header ───────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24 border-b border-forest/10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
          <m.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] font-bold text-gold mb-6"
          >
            <span>The Human Engineering Behind StudioHQ</span>
            <span className="w-12 h-px bg-gold/40" />
          </m.div>

          <m.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-forest max-w-4xl leading-[1.08] tracking-tight mb-8"
          >
            Pioneers of Digital Flagships & <br />
            <span className="font-serif italic text-gold font-normal">Calm Engineering.</span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-text-secondary text-base sm:text-lg max-w-2xl font-light leading-relaxed mb-10"
          >
            We are a compact, multi-disciplinary studio of creative directors, system architects, and motion engineers. Every flagship we release is the result of focused, collaborative mastery.
          </m.p>
        </div>
      </section>

      {/* ── 2. Studio Philosophy & How We Build ────────────────────────────── */}
      <section className="py-20 border-b border-forest/10 bg-white/40">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="p-8 rounded-3xl bg-white/70 border border-forest/10">
            <Layers className="w-8 h-8 text-gold mb-6" />
            <h3 className="font-heading font-bold text-xl text-forest mb-3">Architectural Precision</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light">
              We eliminate unnecessary noise. Every layout adheres to strict typographic grids, high contrast ratios, and spatial hierarchy.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/70 border border-forest/10">
            <Code2 className="w-8 h-8 text-gold mb-6" />
            <h3 className="font-heading font-bold text-xl text-forest mb-3">Sub-40ms Edge SLA</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light">
              Engineered with TypeScript rigor, zero layout shift, and serverless edge delivery so luxury websites load instantly worldwide.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/70 border border-forest/10">
            <Cpu className="w-8 h-8 text-gold mb-6" />
            <h3 className="font-heading font-bold text-xl text-forest mb-3">Autonomous Intelligence</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light">
              Integrating bespoke LLM telemetry, executive intelligence dashboards, and autonomous agent workflows into production software.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Meet the Craftsmen Grid ──────────────────────────────────────── */}
      <section id="craftsmen-grid" className="py-24 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 border-b border-forest/10 pb-6 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.28em] font-bold text-gold block mb-2">
              Studio Roster
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-forest">
              Meet the Craftsmen
            </h2>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-text-secondary">
            Engineering Discipline • Craftsmanship
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex justify-center items-center">
            <div className="h-10 w-10 rounded-full border border-forest/20 border-t-gold animate-spin" />
          </div>
        )}

        {/* Error / Empty Fallback */}
        {(isError || (!isLoading && craftsmen.length === 0)) && (
          <div className="py-16 text-center text-text-secondary text-sm font-light">
            Unable to load craftsmen roster. Showing core studio directory.
          </div>
        )}

        {/* Craftsmen Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {craftsmen.map((craftsman, idx) => {
            const initials = craftsman.full_name
              ? craftsman.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
              : 'TA';

            return (
              <m.div
                key={craftsman.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: idx * 0.1 }}
                onClick={() => navigate(`/people/${craftsman.slug}`)}
                className="group relative bg-white/80 border border-forest/10 hover:border-gold p-6 rounded-3xl shadow-sm hover:shadow-premium transition-all duration-500 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Portrait Avatar / Initials Fallback */}
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-6 bg-forest/5 border border-forest/10 flex items-center justify-center">
                    {craftsman.avatar_url ? (
                      <img
                        src={craftsman.avatar_url}
                        alt={craftsman.full_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-forest text-gold font-heading font-black text-2xl flex items-center justify-center">
                        {initials}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-forest/90 text-gold text-[9px] uppercase tracking-widest font-bold border border-gold/30">
                      {craftsman.member_type || 'EMPLOYEE'}
                    </div>
                  </div>

                  <span className="text-[10px] uppercase tracking-widest font-bold text-gold block mb-1">
                    0{idx + 1}
                  </span>
                  <h3 className="font-heading font-bold text-xl text-forest mb-2 group-hover:text-gold transition-colors">
                    {craftsman.full_name}
                  </h3>
                  <p className="text-xs uppercase tracking-wider font-semibold text-text-secondary mb-4">
                    {craftsman.headline_title}
                  </p>

                  {craftsman.biography && (
                    <p className="text-xs text-text-secondary font-light leading-relaxed line-clamp-3 mb-6">
                      {craftsman.biography}
                    </p>
                  )}
                </div>

                <div className="border-t border-forest/10 pt-4 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-forest">
                  <span>View Craftsman</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1 transition-transform" />
                </div>
              </m.div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Join the Studio CTA ───────────────────────────────────────────── */}
      <section className="bg-forest text-ivory rounded-3xl max-w-[1400px] mx-auto mb-24 p-10 sm:p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <MarbleVeins />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs uppercase tracking-[0.26em] font-bold text-gold block mb-3">
              Craftsmanship Culture
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ivory">
              Interested in joining our studio roster?
            </h2>
          </div>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="inline-flex px-8 py-4 rounded-full bg-gold text-forest font-heading font-bold text-xs uppercase tracking-[0.24em] hover:bg-ivory transition-colors shadow-lg whitespace-nowrap"
          >
            Apply to Join Roster
          </button>
        </div>
      </section>
    </div>
  );
};
export default PeoplePage;
