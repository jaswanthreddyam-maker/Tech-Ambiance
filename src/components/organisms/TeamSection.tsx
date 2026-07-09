import React from "react";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { Heading } from "../ui/Typography";
import { Card } from "../ui/Card";
import { useCursorHover } from "../../hooks/useCursorHover";
import { TEAM_MEMBERS } from "../../mocks/team";

// Clean SVG Icons for Social Links
const LinkedinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733-16z" />
    <path d="M4 20l6.768-6.768" />
    <path d="M20 4l-6.768 6.768" />
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const TeamSection: React.FC = () => {
  const navigate = useNavigate();
  const hoverProps = useCursorHover("pointer");
  const buttonHoverProps = useCursorHover("pointer");

  return (
    <Section id="team" padding="normal" className="bg-bg-primary relative overflow-hidden select-none">
      
      {/* Subtle luxury radial glow + tactile print noise overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(197,165,114,0.08),transparent)] pointer-events-none z-0" />
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <Container className="relative z-10">
        {/* Section Header: Appears first before cards */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="flex flex-col items-center text-center gap-4 mb-20 md:mb-28"
        >
          <span className="text-[11px] uppercase font-bold tracking-[0.28em] text-gold select-none">
            Meet The Team
          </span>
          <Heading level={2} className="text-forest max-w-2xl mb-0">
            The minds behind <br />
            <span className="font-serif italic text-gold font-normal">Tech Ambiance</span>.
          </Heading>
        </m.div>

        {/* Members Cards Stack with Generous Scroll Rhythm (140px-180px gap) */}
        <div className="flex flex-col gap-24 md:gap-36 lg:gap-40">
          {TEAM_MEMBERS.map((member, idx) => {
            const isOdd = idx % 2 === 0; // Card 1 & 3 enter from RIGHT (+70px), Card 2 & 4 enter from LEFT (-70px)
            const rowSlideX = isOdd ? 70 : -70;
            const textSlideX = isOdd ? 30 : -30;

            // First card reveals 300ms AFTER Section Header enters
            const cardDelay = idx === 0 ? 0.3 : 0.05;

            // Stagger container for text elements inside this card
            const textContainerVariants: Variants = {
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: cardDelay + 0.15,
                },
              },
            };

            const textItemVariants: Variants = {
              hidden: { opacity: 0, x: textSlideX, y: 12 },
              visible: {
                opacity: 1,
                x: 0,
                y: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.19, 1, 0.22, 1],
                },
              },
            };

            return (
              <React.Fragment key={member.id}>
                {/* Outer Card wrapper */}
                <m.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-15%" }}
                  transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: cardDelay }}
                  className="w-full"
                >
                  <Card
                    variant="default"
                    padding="lg"
                    className="relative group overflow-hidden bg-surface border border-forest/[0.05] hover:border-gold/45 transition-all duration-500 ease-[0.16,1,0.3,1] shadow-md hover:shadow-2xl hover:-translate-y-1 rounded-3xl"
                    {...hoverProps}
                  >
                    {/* Subtle Huge Editorial Numbering in top-left */}
                    <div className="absolute top-4 left-6 md:top-8 md:left-10 text-[64px] sm:text-[76px] font-heading font-bold text-gold/10 select-none pointer-events-none leading-none z-0">
                      {member.number}
                    </div>

                    {/* Synchronized Row Layout:
                        Mobile: Always Image (order-1) -> Description (order-2)
                        Desktop:
                          Odd cards (01, 03): Description Left (lg:order-1), Portrait Right (lg:order-2)
                          Even cards (02, 04): Portrait Left (lg:order-1), Description Right (lg:order-2)
                    */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10 pt-8 sm:pt-4">
                      
                      {/* PORTRAIT BLOCK: GPU-accelerated 60FPS slide */}
                      <div
                        className={`w-full ${
                          isOdd
                            ? "order-1 lg:order-2 lg:col-span-5"
                            : "order-1 lg:order-1 lg:col-span-5"
                        }`}
                      >
                        <m.div
                          initial={{
                            x: rowSlideX,
                            opacity: 0,
                            scale: 1.05,
                          }}
                          whileInView={{
                            x: 0,
                            opacity: 1,
                            scale: 1,
                          }}
                          viewport={{ once: true, margin: "-15%" }}
                          transition={{
                            duration: 1.0,
                            ease: [0.19, 1, 0.22, 1],
                            delay: cardDelay,
                          }}
                          style={{ willChange: "transform, opacity" }}
                          className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-forest/5 border border-forest/[0.08] shadow-sm group-hover:shadow-lg transition-shadow duration-500"
                        >
                          <img
                            src={member.image}
                            alt={`${member.name} - ${member.role}`}
                            loading={idx === 0 ? "eager" : "lazy"}
                            decoding="async"
                            fetchPriority={idx === 0 ? "high" : "auto"}
                            className="w-full h-full object-cover object-top transition-transform duration-700 ease-[0.19,1,0.22,1] group-hover:scale-[1.03]"
                          />

                          {/* Subtle inner champagne frame gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-forest/25 via-transparent to-transparent opacity-60 pointer-events-none" />
                        </m.div>
                      </div>

                      {/* DESCRIPTION & BIOGRAPHY BLOCK */}
                      <m.div
                        variants={textContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-15%" }}
                        className={`w-full flex flex-col justify-center ${
                          isOdd
                            ? "order-2 lg:order-1 lg:col-span-7"
                            : "order-2 lg:order-2 lg:col-span-7"
                        }`}
                      >
                        {/* Name */}
                        <m.div variants={textItemVariants}>
                          <h3 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[2.6rem] text-forest tracking-tight mb-1.5">
                            {member.name}
                          </h3>
                        </m.div>

                        {/* Executive Role & Responsibility */}
                        <m.div variants={textItemVariants} className="flex flex-col gap-1 mb-6">
                          <p className="text-[11px] sm:text-xs uppercase tracking-[0.24em] font-bold text-gold m-0">
                            {member.role}
                          </p>
                          <p className="text-xs sm:text-sm font-serif italic text-forest/70 m-0">
                            {member.responsibility}
                          </p>
                        </m.div>

                        {/* Bio with max-width 60ch for superior reading ergonomics */}
                        <m.div variants={textItemVariants}>
                          <p className="text-text-secondary text-sm sm:text-base font-light leading-relaxed max-w-[60ch] mb-8">
                            {member.bio}
                          </p>
                        </m.div>

                        {/* Skills */}
                        <m.div variants={textItemVariants} className="mb-8">
                          <div className="flex flex-wrap items-center gap-2">
                            {member.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-3.5 py-1.5 rounded-full bg-forest/[0.04] border border-forest/[0.08] text-forest text-[10px] uppercase tracking-[0.16em] font-semibold"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </m.div>

                        {/* Social Icons & Leadership Micro-interaction */}
                        <m.div
                          variants={textItemVariants}
                          className="flex items-center gap-4 pt-4 border-t border-forest/[0.08]"
                        >
                          {member.socials.linkedin && (
                            <a
                              href={member.socials.linkedin}
                              aria-label={`${member.name} LinkedIn`}
                              className="w-10 h-10 rounded-full border border-forest/15 flex items-center justify-center text-forest hover:text-gold hover:border-gold transition-colors"
                            >
                              <LinkedinIcon className="w-4 h-4" />
                            </a>
                          )}
                          {member.socials.twitter && (
                            <a
                              href={member.socials.twitter}
                              aria-label={`${member.name} Twitter`}
                              className="w-10 h-10 rounded-full border border-forest/15 flex items-center justify-center text-forest hover:text-gold hover:border-gold transition-colors"
                            >
                              <XIcon className="w-4 h-4" />
                            </a>
                          )}
                          {member.socials.github && (
                            <a
                              href={member.socials.github}
                              aria-label={`${member.name} GitHub`}
                              className="w-10 h-10 rounded-full border border-forest/15 flex items-center justify-center text-forest hover:text-gold hover:border-gold transition-colors"
                            >
                              <GithubIcon className="w-4 h-4" />
                            </a>
                          )}
                          <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-text-muted group/lead cursor-pointer hover:text-gold transition-colors">
                            Leadership{" "}
                            <ArrowUpRight className="w-3.5 h-3.5 text-gold transition-transform duration-300 group-hover/lead:rotate-45 group-hover/lead:translate-x-0.5" />
                          </span>
                        </m.div>
                      </m.div>

                    </div>
                  </Card>
                </m.div>

                {/* Elegant Luxury Gradient Divider Between Members (except after last member) */}
                {idx < TEAM_MEMBERS.length - 1 && (
                  <div className="w-full max-w-4xl mx-auto flex items-center justify-center py-2">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-forest/15 to-transparent" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* =========================================================
            10. DEDICATED TEAM STRATEGY CTA AT THE END
        ========================================================= */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
          className="mt-28 md:mt-36"
        >
          <div className="relative overflow-hidden rounded-3xl bg-forest text-gold border border-gold/30 p-10 md:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            {/* Subtle champagne radial aura inside CTA */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_10%_50%,rgba(197,165,114,0.15),transparent)] pointer-events-none" />

            <div className="flex flex-col gap-3 text-center md:text-left relative z-10">
              <span className="text-[10px] uppercase tracking-[0.26em] font-bold text-gold/80">
                Direct Leadership Access
              </span>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-ivory leading-tight max-w-xl">
                Interested in working with our <span className="font-serif italic text-gold font-normal">studio leadership</span>?
              </h3>
            </div>

            <button
              onClick={() => navigate("/auth")}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gold text-forest font-heading font-bold text-xs uppercase tracking-[0.22em] shadow-lg hover:bg-ivory transition-all shrink-0 relative z-10"
              {...buttonHoverProps}
            >
              <span>Book a Strategy Call</span>
              <ArrowUpRight className="w-4 h-4 text-forest transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-0.5" />
            </button>
          </div>
        </m.div>

      </Container>
    </Section>
  );
};
