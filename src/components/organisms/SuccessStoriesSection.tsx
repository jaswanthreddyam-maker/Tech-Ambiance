import React, { useState, useEffect, useRef, useCallback } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Section } from '../layout/Section';
import { Container } from '../layout/Container';
import { Heading, Text } from '../ui/Typography';
import { SUCCESS_STORIES, type SuccessStory } from '../../content/successStories';
import { MarbleVeins } from '../ui/MarbleVeins';
import { RevealHeading } from '../motion';

// Unified Architectural Easing Token
const ARCHITECTURAL_EASE = [0.22, 1, 0.36, 1] as const;

export const SuccessStoriesSection: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const stories: SuccessStory[] = SUCCESS_STORIES;
  const N = stories.length;
  const stepAngle = 360 / N;

  // Compute 3D ring radius dynamically based on N
  const cardWidth = 360;
  const radius = Math.max(340, Math.round((cardWidth / 2) / Math.tan(Math.PI / N)));

  // Continuous rotation angle in degrees
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartX = useRef(0);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Compute active card index dynamically from rotation angle
  const activeIndex = (Math.round((-rotationAngle % 360 + 360) % 360 / stepAngle)) % N;
  const currentRotation = rotationAngle + dragOffset;

  // Slow continuous rotation loop (~3.5° / second)
  useEffect(() => {
    if (isPaused || isDragging || shouldReduceMotion) return;

    let lastTime = performance.now();
    const rotate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      // 3.5 degrees per second slow, calm, elegant drift
      setRotationAngle((prev) => prev - delta * 3.5);
      animationFrameRef.current = requestAnimationFrame(rotate);
    };

    animationFrameRef.current = requestAnimationFrame(rotate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPaused, isDragging, shouldReduceMotion]);

  // Pause continuous rotation on user interaction and resume after 4s
  const triggerPause = useCallback(() => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  }, []);

  // Target card rotation on button or card click
  const rotateToCard = (targetIdx: number) => {
    triggerPause();
    // Calculate shortest angular rotation path
    const currentBase = Math.round(rotationAngle / 360) * 360;
    const targetBaseAngle = currentBase - targetIdx * stepAngle;
    setRotationAngle(targetBaseAngle);
  };

  const handleNext = useCallback(() => {
    triggerPause();
    setRotationAngle((prev) => prev - stepAngle);
  }, [stepAngle, triggerPause]);

  const handlePrev = useCallback(() => {
    triggerPause();
    setRotationAngle((prev) => prev + stepAngle);
  }, [stepAngle, triggerPause]);

  // Drag Gesture Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    triggerPause();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    setDragOffset(deltaX * 0.35);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    setRotationAngle((prev) => prev + dragOffset);
    setDragOffset(0);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  };

  return (
    <Section id="success-stories" padding="normal" className="bg-ivory relative overflow-hidden select-none">
      {/* Golden Floral Cracks Background Image */}
      <m.div
        initial={{ opacity: 0, scale: 0.96, x: 25 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 1.4,
          delay: 0.3,
          ease: ARCHITECTURAL_EASE,
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
        <div className="flex flex-col gap-12 lg:gap-16">
          
          {/* Static Section Header Block */}
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
            <m.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: ARCHITECTURAL_EASE }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-[11px] uppercase font-bold tracking-[0.28em] text-gold select-none font-mono">
                SUCCESS STORIES
              </span>
            </m.div>

            <m.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: ARCHITECTURAL_EASE }}
            >
              <RevealHeading>
                <Heading level={2} className="text-3xl md:text-5xl tracking-tight leading-tight">
                  Digital experiences that deliver{' '}
                  <span className="font-serif italic text-gold font-normal">measurable</span> business impact.
                </Heading>
              </RevealHeading>
            </m.div>

            <m.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: ARCHITECTURAL_EASE }}
            >
              <Text size="lg" className="text-gold/75 max-w-2xl m-0 leading-relaxed">
                Every project is architected for its industry — from fine dining hospitality to high-velocity instant commerce and multi-location retail.
              </Text>
            </m.div>
          </div>

          {/* ========================================================
              DESKTOP 3D ROTATING COVERFLOW RING (md:flex)
          ======================================================== */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Success Stories 3D Carousel"
            onKeyDown={handleKeyDown}
            onMouseEnter={triggerPause}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={triggerPause}
            className="hidden md:flex flex-col items-center relative w-full py-8 focus-visible:outline-none"
          >
            {/* 3D Perspective Stage Container */}
            <div
              className="relative w-full h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
              style={{
                perspective: '1200px',
                perspectiveOrigin: '50% 50%',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* 3D Rotating Ring Stage */}
              <div
                className="relative w-[380px] h-full flex items-center justify-center"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${currentRotation}deg)`,
                  transition: isDragging || !isPaused ? 'none' : 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {stories.map((story, idx) => {
                  const cardBaseAngle = idx * stepAngle;
                  // Compute relative angle offset from front center (-180 to 180)
                  const rawDiff = (cardBaseAngle + currentRotation) % 360;
                  const diff = ((rawDiff + 540) % 360) - 180;
                  const absDiff = Math.abs(diff);

                  const isFront = absDiff < 18;
                  const isBack = absDiff > 130;

                  // Opacity and scale based on angle offset
                  const opacity = isBack ? 0 : Math.max(0.35, 1 - absDiff / 140);
                  const scale = isFront ? 1 : Math.max(0.85, 1 - absDiff / 600);

                  return (
                    <div
                      key={story.slug}
                      onClick={() => {
                        if (!isFront) {
                          rotateToCard(idx);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        width: '380px',
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${cardBaseAngle}deg) translateZ(${radius}px) scale(${scale})`,
                        opacity,
                        transition: isDragging || !isPaused ? 'none' : 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                        pointerEvents: isBack ? 'none' : 'auto',
                      }}
                      className={`rounded-3xl bg-emerald-stone border transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-[0_16px_48px_rgba(8,38,31,0.18)] ${
                        isFront
                          ? 'border-gold/70 shadow-[0_24px_64px_rgba(201,165,106,0.28)] ring-1 ring-gold/40 cursor-default'
                          : 'border-gold/25 hover:border-gold/50 cursor-pointer'
                      }`}
                    >
                      {/* Ambient Card Radial Glow */}
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,_rgba(201,165,106,0.14)_0%,_transparent_65%)]" />
                      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
                        <MarbleVeins />
                      </div>

                      {/* Card Preview Image */}
                      <div className="relative h-56 w-full overflow-hidden rounded-t-3xl bg-[#08261F]">
                        <div
                          className="absolute inset-0 transition-transform duration-700 ease-out"
                          style={{ background: story.thumbnail }}
                        />
                        <img
                          src={story.featuredImage}
                          alt={story.title}
                          loading="lazy"
                          className={`w-full h-full object-center opacity-90 transition-all duration-700 ease-out ${
                            story.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-stone via-emerald-stone/30 to-transparent" />

                        {/* Industry Badge */}
                        <div className="absolute top-4 left-5 z-10">
                          <span className="px-3 py-1.5 rounded-full bg-emerald-stone/90 backdrop-blur-md border border-gold/30 text-[10px] font-mono font-bold tracking-widest text-gold shadow-sm uppercase">
                            {story.industry}
                          </span>
                        </div>
                      </div>

                      {/* Card Body & Metrics */}
                      <div className="p-7 flex-1 flex flex-col justify-between space-y-5 relative z-10">
                        <div className="space-y-2">
                          <h3 className="font-serif text-2xl font-bold text-gold">
                            {story.title}
                          </h3>
                          <p className="text-xs text-gold/80 leading-relaxed line-clamp-2">
                            {story.summary}
                          </p>
                        </div>

                        {/* Metrics Row with Old-Style Figures */}
                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gold/15">
                          {story.metrics.map((metric, metricIdx) => (
                            <div key={metricIdx} className="flex flex-col">
                              <span className="font-serif text-xl font-bold text-gold tracking-tight font-oldstyle">
                                {metric.value}
                              </span>
                              <span className="text-[9px] font-mono text-gold/65 uppercase tracking-wider mt-0.5">
                                {metric.label}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* CTA Link - Active & Interactive ONLY on Front Card */}
                        <div className="pt-3 flex items-center justify-between border-t border-gold/10">
                          <span className="text-xs font-semibold tracking-wider uppercase text-gold">
                            {story.externalUrl ? "Visit Live Site" : "Read Case Study"}
                          </span>
                          
                          <button
                            tabIndex={isFront ? 0 : -1}
                            aria-hidden={!isFront}
                            style={{ pointerEvents: isFront ? 'auto' : 'none' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isFront) return;
                              if (story.externalUrl) {
                                window.open(story.externalUrl, '_blank', 'noopener,noreferrer');
                              } else {
                                navigate(`/experience/case-studies/${story.slug}`);
                              }
                            }}
                            className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-[#08261F] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-gold"
                            aria-label={`${story.externalUrl ? "Visit" : "Read"} ${story.title}`}
                          >
                            {story.externalUrl ? (
                              <ArrowRight className="w-4 h-4 -rotate-45 transition-transform group-hover:translate-x-0.5" />
                            ) : (
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Manual Controls & Plain Dot Pagination (No Numerals) */}
            <div className="flex items-center gap-6 mt-6 z-20">
              {/* Prev Button */}
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-emerald-stone border border-gold/30 text-gold flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-gold"
                aria-label="Previous Success Story"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Plain Gold Dots Pagination */}
              <div className="flex items-center gap-2" role="tablist" aria-label="Story position indicators">
                {stories.map((s, dotIdx) => (
                  <button
                    key={s.slug}
                    role="tab"
                    aria-selected={activeIndex === dotIdx}
                    onClick={() => rotateToCard(dotIdx)}
                    className={`h-2 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-gold ${
                      activeIndex === dotIdx
                        ? 'w-7 bg-gold shadow-[0_0_8px_rgba(197,165,114,0.6)]'
                        : 'w-2 bg-gold/30 hover:bg-gold/60'
                    }`}
                    aria-label={`Go to story ${dotIdx + 1}`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-emerald-stone border border-gold/30 text-gold flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-gold"
                aria-label="Next Success Story"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ========================================================
              MOBILE HORIZONTAL SCROLL-SNAP CAROUSEL FALLBACK (md:hidden)
          ======================================================== */}
          <div className="md:hidden flex flex-col gap-6">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-4 w-full scrollbar-none">
              {stories.map((story) => (
                <article
                  key={story.slug}
                  onClick={() => {
                    if (story.externalUrl) {
                      window.open(story.externalUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(`/experience/case-studies/${story.slug}`);
                    }
                  }}
                  className="min-w-[85%] max-w-[85%] sm:min-w-[340px] sm:max-w-[340px] w-full shrink-0 snap-center rounded-3xl bg-emerald-stone border border-gold/30 p-6 flex flex-col justify-between space-y-6 shadow-md relative overflow-hidden"
                >
                  <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
                    <MarbleVeins />
                  </div>

                  <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-[#08261F]">
                    <img
                      src={story.featuredImage}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-stone/90 border border-gold/30 text-[9px] font-mono font-bold tracking-widest text-gold uppercase">
                        {story.industry}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <h3 className="font-serif text-2xl font-bold text-gold">
                      {story.title}
                    </h3>
                    <p className="text-xs text-gold/80 leading-relaxed line-clamp-3">
                      {story.summary}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gold/15">
                      {story.metrics.map((metric, metricIdx) => (
                        <div key={metricIdx} className="flex flex-col">
                          <span className="font-serif text-lg font-bold text-gold tracking-tight font-oldstyle">
                            {metric.value}
                          </span>
                          <span className="text-[9px] font-mono text-gold/65 uppercase tracking-wider">
                            {metric.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t border-gold/10">
                      <span className="text-xs font-semibold tracking-wider uppercase text-gold">
                        {story.externalUrl ? "Visit Live Site" : "Read Case Study"}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                        <ArrowRight className="w-4 h-4 -rotate-45" />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Mobile Pagination Indicator Dots */}
            <div className="flex items-center justify-center gap-2">
              {stories.map((s, dotIdx) => (
                <span
                  key={s.slug}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIndex === dotIdx ? 'w-5 bg-gold' : 'w-1.5 bg-gold/30'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </Container>
    </Section>
  );
};

export default SuccessStoriesSection;
