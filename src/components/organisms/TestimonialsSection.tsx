import React from "react";
import { m } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { Heading, Text } from "../ui/Typography";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { testimonialsData } from "../../content/testimonials";
import { MOCK_INSIGHTS } from "../../mocks/insights";
import { MessageSquare, ArrowRight } from "lucide-react";
import { ROUTES } from "../../routes/routes";

export const TestimonialsSection: React.FC = () => {
  const navigate = useNavigate();

  // Split testimonials into two tracks for dynamic multi-directional scroll
  const track1 = [...testimonialsData.slice(0, 2), ...testimonialsData.slice(0, 2)];
  const track2 = [...testimonialsData.slice(2, 4), ...testimonialsData.slice(2, 4)];

  return (
    <Section id="testimonials" padding="normal" className="bg-ivory relative overflow-hidden">
      
      {/* Testimonials Half */}
      <Container className="mb-20">
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <span className="text-[11px] uppercase font-bold tracking-[0.24em] text-gold select-none">
            Testimonials
          </span>
          <Heading level={2}>
            Loved by <span className="font-serif italic text-gold">forward-thinking founders</span>.
          </Heading>
        </div>

        {/* Track 1: Scroll Left */}
        <div className="w-full overflow-hidden relative mb-8 [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
          <div className="flex gap-8 w-max animate-scroll-left">
            {track1.map((item, idx) => (
              <Card
                key={idx}
                padding="md"
                className="w-[350px] md:w-[450px] flex flex-col justify-between select-none bg-surface border-forest/10"
              >
                <MessageSquare className="w-5 h-5 text-gold/30 absolute right-6 top-6" />
                <Text size="sm" className="text-text-primary italic mb-6">
                  "{item.quote}"
                </Text>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest/5 border border-forest/10 flex items-center justify-center font-bold text-forest text-xs">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <Heading level={4} className="text-forest text-xs m-0">{item.name}</Heading>
                    <span className="text-[9px] text-text-secondary tracking-[0.1em] uppercase mt-0.5 font-semibold">
                      {item.role}, <span className="text-gold">{item.company}</span>
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Track 2: Scroll Right */}
        <div className="w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
          <div className="flex gap-8 w-max animate-scroll-right">
            {track2.map((item, idx) => (
              <Card
                key={idx}
                padding="md"
                className="w-[350px] md:w-[450px] flex flex-col justify-between select-none bg-surface border-forest/10"
              >
                <MessageSquare className="w-5 h-5 text-gold/30 absolute right-6 top-6" />
                <Text size="sm" className="text-text-primary italic mb-6">
                  "{item.quote}"
                </Text>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest/5 border border-forest/10 flex items-center justify-center font-bold text-forest text-xs">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <Heading level={4} className="text-forest text-xs m-0">{item.name}</Heading>
                    <span className="text-[9px] text-text-secondary tracking-[0.1em] uppercase mt-0.5 font-semibold">
                      {item.role}, <span className="text-gold">{item.company}</span>
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>

      {/* Insights Half */}
      <Container>
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-10 border-t border-forest/[0.06] pt-20">
          <div className="flex flex-col items-start text-left gap-4">
            <span className="text-[11px] uppercase font-bold tracking-[0.24em] text-gold select-none">
              Insights
            </span>
            <Heading level={2} className="m-0">
              Thoughts on <span className="font-serif italic text-gold">growth</span> & design.
            </Heading>
          </div>
          <Button variant="outline" onClick={() => navigate(ROUTES.insights)}>
            View All Insights
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MOCK_INSIGHTS.map((insight) => (
            <m.div
              key={insight.id}
              initial={{ opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.15, ease: [0.19, 1, 0.22, 1] }}
            >
              <Link to={`${ROUTES.insights}/${insight.slug}`} className="block h-full group">
                <Card padding="lg" className="h-full flex flex-col justify-between hover:border-gold transition-colors duration-500 bg-surface">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] uppercase tracking-widest font-bold text-gold border border-gold/15 bg-gold/[0.03] px-2.5 py-0.5 rounded-full">
                        {insight.category}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-text-secondary">
                        {insight.readTimeMinutes} min read
                      </span>
                    </div>
                    
                    <Heading level={4} className="text-forest m-0 group-hover:text-gold transition-colors duration-300 leading-snug">
                      {insight.title}
                    </Heading>
                    <Text size="sm" className="text-text-secondary line-clamp-2 m-0">
                      {insight.excerpt}
                    </Text>
                  </div>

                  <div className="mt-8 pt-6 border-t border-forest/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-forest/5 border border-forest/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-forest">{insight.author.name.charAt(0)}</span>
                      </div>
                      <span className="text-xs font-bold text-text-primary">{insight.author.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-forest/30 group-hover:text-gold transition-colors duration-300" />
                  </div>
                </Card>
              </Link>
            </m.div>
          ))}
        </div>
      </Container>

      {/* Testimonials infinite track keyframes */}
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }
        .animate-scroll-left:hover,
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </Section>
  );
};

