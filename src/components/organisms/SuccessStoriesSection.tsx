import React from 'react';
import { m } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Section } from '../layout/Section';
import { Container } from '../layout/Container';
import { Heading, Text } from '../ui/Typography';
import { SUCCESS_STORIES } from '../../content/successStories';
import { MarbleVeins } from '../ui/MarbleVeins';
import { RevealHeading } from '../motion';

export const SuccessStoriesSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Section id="success-stories" padding="normal" className="bg-ivory relative overflow-hidden">
      {/* Golden Floral Cracks Image positioned at the right end with smooth 1.5s scroll delay */}
      <m.div
        initial={{ opacity: 0, scale: 0.96, x: 25 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 1.4,
          delay: 1.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="pointer-events-none absolute top-0 right-0 w-[85%] md:w-[60%] max-w-[800px] h-[360px] md:h-[480px] z-0 flex items-center justify-end overflow-hidden"
      >
        <img
          src="/images/gold-floral-clean-opt.webp"
          alt="Luxury Gold Floral Cracks"
          className="w-full h-full object-contain object-right opacity-55"
        />
      </m.div>

      {/* Subtle luxury ambient radial lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,165,106,0.08)_0%,_transparent_70%)] z-0" />

      <Container className="relative z-10">
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
              <RevealHeading>
                <Heading level={2} className="text-3xl md:text-5xl tracking-tight leading-tight">
                  Digital experiences that deliver{' '}
                  <span className="font-serif italic text-gold">measurable</span> business impact.
                </Heading>
              </RevealHeading>
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

          {/* Mobile Swipeable Snap Carousel / Desktop 3-Card Grid */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:pb-0 items-stretch w-full">
            {SUCCESS_STORIES.map((story, idx) => {
              const isMiddleCard = idx === 1;

              return (
                <m.article
                  key={story.slug}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.75, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => {
                    if (story.externalUrl) {
                      window.open(story.externalUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(`/experience/case-studies/${story.slug}`);
                    }
                  }}
                  className={`min-w-[85%] max-w-[85%] sm:min-w-[360px] sm:max-w-[360px] lg:min-w-0 lg:max-w-none w-full shrink-0 snap-center rounded-3xl bg-emerald-stone border border-gold/25 hover:border-gold/65 transition-all duration-500 cursor-pointer flex flex-col justify-between group relative overflow-hidden shadow-[0_12px_36px_rgba(8,38,31,0.12)] hover:shadow-[0_24px_60px_rgba(201,165,106,0.22)] ${
                    isMiddleCard
                      ? 'lg:scale-[1.05] lg:-translate-y-2 ring-1 ring-gold/40 z-20'
                      : 'hover:-translate-y-2 z-10'
                  }`}
                >
                  {/* Subtle Card Glow & Glass Texture */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,_rgba(201,165,106,0.14)_0%,_transparent_65%)]" />

                  {/* Minimal Luxury Golden Crack */}
                  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
                    <MarbleVeins />
                  </div>

                  {/* Top Preview Image Container with Luxury Overlay */}
                  <div className="relative h-48 sm:h-56 lg:h-64 w-full overflow-hidden rounded-t-3xl bg-[#08261F]">
                    <div
                      className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ background: story.thumbnail }}
                    />
                    <img
                      src={story.featuredImage}
                      alt={story.title}
                      loading="lazy"
                      className={`w-full h-full object-center opacity-85 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105 ${story.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
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
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6 relative z-10">
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
                        {story.externalUrl ? "Visit Live Site" : "Read Case Study"}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-[#08261F] transition-all duration-300">
                        {story.externalUrl ? <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 -rotate-45" /> : <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
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
