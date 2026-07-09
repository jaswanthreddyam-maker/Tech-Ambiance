import React from 'react';
import { m } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Section } from '../layout/Section';
import { Container } from '../layout/Container';
import { Heading, Text } from '../ui/Typography';
import { SUCCESS_STORIES } from '../../content/successStories';

export const SuccessStoriesSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Section id="success-stories" padding="normal" className="bg-ivory relative overflow-hidden">
      {/* Subtle luxury ambient radial lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,165,106,0.08)_0%,_transparent_70%)]" />

      <Container>
        <div className="flex flex-col gap-14 lg:gap-20">
          {/* Section Header - Editorial Luxury Alignment */}
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
            <m.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-[11px] uppercase font-bold tracking-[0.28em] text-gold select-none font-mono">
                SUCCESS STORIES
              </span>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <Heading level={2} className="text-3xl md:text-5xl tracking-tight leading-tight">
                Digital experiences that deliver{' '}
                <span className="font-serif italic text-gold">measurable</span> business impact.
              </Heading>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Text size="lg" className="text-gold/75 max-w-2xl m-0 leading-relaxed">
                Every project is architected for its industry — from fine dining hospitality to high-velocity instant commerce and multi-location retail.
              </Text>
            </m.div>
          </div>

          {/* Desktop 3-Card Layout / Mobile Swipeable Snap Carousel */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:pb-0 items-stretch">
            {SUCCESS_STORIES.map((story, idx) => {
              const isMiddleCard = idx === 1;

              return (
                <m.article
                  key={story.slug}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.75, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => navigate(`/experience/case-studies/${story.slug}`)}
                  className={`min-w-[88vw] sm:min-w-[420px] lg:min-w-0 snap-center rounded-3xl bg-emerald-stone border border-gold/25 hover:border-gold/65 transition-all duration-500 cursor-pointer flex flex-col justify-between group relative overflow-hidden shadow-[0_12px_36px_rgba(8,38,31,0.12)] hover:shadow-[0_24px_60px_rgba(201,165,106,0.22)] ${
                    isMiddleCard
                      ? 'lg:scale-[1.05] lg:-translate-y-2 ring-1 ring-gold/40 z-20'
                      : 'hover:-translate-y-2 z-10'
                  }`}
                >
                  {/* Subtle Card Glow & Glass Texture */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,_rgba(201,165,106,0.14)_0%,_transparent_65%)]" />

                  {/* Top Preview Image Container with Luxury Overlay */}
                  <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-t-3xl bg-[#08261F]">
                    <div
                      className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ background: story.thumbnail }}
                    />
                    <img
                      src={story.featuredImage}
                      alt={story.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center opacity-85 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-stone via-emerald-stone/30 to-transparent" />

                    {/* Industry Badge overlay */}
                    <div className="absolute top-4 left-5 z-10">
                      <span className="px-3 py-1.5 rounded-full bg-emerald-stone/90 backdrop-blur-md border border-gold/30 text-[10px] font-mono font-bold tracking-widest text-gold shadow-sm uppercase">
                        {story.industry}
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Metrics */}
                  <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between space-y-6 relative z-10">
                    <div className="space-y-3">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gold group-hover:text-white transition-colors duration-300">
                        {story.title}
                      </h3>
                      <p className="text-sm text-gold/80 leading-relaxed line-clamp-3">
                        {story.summary}
                      </p>
                    </div>

                    {/* Measurable Business Impact Metrics */}
                    <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gold/15">
                      {story.metrics.map((metric, metricIdx) => (
                        <div key={metricIdx} className="flex flex-col">
                          <span className="font-serif text-xl sm:text-2xl font-bold text-gold tracking-tight">
                            {metric.value}
                          </span>
                          <span className="text-[10px] font-mono text-gold/65 uppercase tracking-wider mt-0.5">
                            {metric.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Premium CTA Button */}
                    <div className="pt-4 flex items-center justify-between border-t border-gold/10">
                      <span className="text-xs font-semibold tracking-wider uppercase text-gold group-hover:text-white transition-colors duration-300">
                        Read Case Study
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-[#08261F] transition-all duration-300">
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </m.article>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
};
