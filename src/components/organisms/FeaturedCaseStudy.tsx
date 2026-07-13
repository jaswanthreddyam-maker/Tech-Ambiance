import React from "react";
import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { Heading, Text } from "../ui/Typography";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { MarbleVeins } from "../ui/MarbleVeins";
import { ROUTES } from "../../routes/routes";
import { PORTFOLIO_PROJECTS } from "../../content/portfolioProjects";

export const FeaturedCaseStudy: React.FC = () => {
  const navigate = useNavigate();

  // Find the featured project (Cafe Vistaara)
  const featuredProject = PORTFOLIO_PROJECTS.find(p => p.featured) || PORTFOLIO_PROJECTS[0];

  return (
    <Section id="featured-case-study" padding="normal" className="bg-ivory relative">
      <Container>
        <div className="flex flex-col gap-10">
          
          {/* Section Header */}
          <div className="flex flex-col items-center text-center gap-4">
            <span className="text-[11px] uppercase font-bold tracking-[0.24em] text-gold select-none">
              Featured Case Study
            </span>
            <Heading level={2} className="max-w-2xl">
              Driving organic growth through <span className="font-serif italic text-gold">premium</span> design.
            </Heading>
          </div>

          {/* The Featured Project Card */}
          <Card padding="none" variant="default" className="relative group overflow-hidden cursor-pointer bg-emerald-stone text-gold rounded-3xl" onClick={() => navigate(`${ROUTES.work}/${featuredProject.slug}`)}>
            {/* Marble Champagne Veins */}
            <MarbleVeins />

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] relative z-10">
              
              {/* Left Side: Context */}
              <div className="p-10 md:p-14 lg:p-16 flex flex-col justify-between relative z-20">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gold">
                      {featuredProject.industry}
                    </span>
                  </div>
                  
                  <Heading level={3} className="text-gold m-0 leading-tight">{featuredProject.title}</Heading>
                  <Text size="base" className="text-gold/80 max-w-md m-0">
                    {featuredProject.description}
                  </Text>
                  
                  {/* Business Impact Metrics */}
                  <div className="flex gap-10 mt-2 pt-6 border-t border-gold/10">
                    {featuredProject.businessImpact.map((impact, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <span className="text-3xl md:text-4xl font-heading text-gold leading-none font-light">{impact.value}</span>
                        <span className="text-[8px] uppercase tracking-[0.2em] font-semibold text-gold/60">
                          {impact.metric}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <Button 
                    variant="primary" 
                    icon={<ArrowRight className="w-4 h-4" />} 
                    className="text-gold uppercase tracking-widest text-[11px]"
                  >
                    Read Full Case Study
                  </Button>
                </div>
              </div>

              {/* Right Side: Media / Abstract UI */}
              <div className="relative bg-emerald-stone overflow-hidden flex items-center justify-center min-h-[400px] lg:min-h-full p-12">
                <MarbleVeins />

                <div className="absolute inset-0 opacity-20 group-hover:scale-105 transition-transform duration-[1200ms] ease-out flex items-center justify-center pointer-events-none">
                  {/* Abstract graphic replacing generic laptop mockups */}
                  <div className="w-[80%] aspect-square border-[1px] border-gold/5 rounded-full flex items-center justify-center">
                     <div className="w-[60%] aspect-square border-[1px] border-gold/4 rounded-full flex items-center justify-center">
                        <div className="w-[30%] aspect-square border-[0.5px] border-gold/6 rounded-full blur-sm" />
                     </div>
                  </div>
                </div>

                {/* Simulated macOS Safari Mockup */}
                <m.div 
                  initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-30%" }}
                  transition={{ duration: 1.25, ease: [0.19, 1, 0.22, 1] }}
                  className="relative z-10 w-full max-w-sm bg-[#FAF7F0] rounded-xl shadow-[0_20px_50px_rgba(6,41,30,0.08)] overflow-hidden border border-forest/[0.06] flex flex-col"
                >
                   {/* Safari Header */}
                   <div className="flex items-center justify-between px-4 py-2 border-b border-forest/[0.06] bg-[#FAF7F0] select-none light-sweep-container animate-light-sweep">
                     <div className="flex gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
                       <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
                       <div className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
                     </div>
                     <span className="text-[7px] tracking-[0.08em] text-text-secondary/70 font-sans bg-forest/[0.02] px-3 py-0.5 rounded-full border border-forest/[0.04]">
                       techambiance.studio/vistaara
                     </span>
                     <div className="w-4" />
                   </div>
                   
                   {/* Safari Body (Emerald Stone content) */}
                   <div className="p-5 flex flex-col gap-4 bg-emerald-stone relative overflow-hidden">
                     <MarbleVeins />
                     <div className="flex items-center gap-3 select-none relative z-10">
                       <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/15 flex items-center justify-center text-gold text-xs font-bold">V</div>
                       <div className="flex flex-col gap-1">
                         <div className="w-20 h-2 rounded-full bg-gold/30" />
                         <div className="w-12 h-1.5 rounded-full bg-gold/20" />
                       </div>
                     </div>
                     <div className="w-full h-24 rounded-lg bg-gold/5 border border-gold/10 relative z-10" />
                     <div className="flex justify-between items-center pt-1 select-none relative z-10">
                       <div className="w-12 h-4 rounded-full bg-gold text-[8px] flex items-center justify-center text-forest font-bold uppercase">+180%</div>
                       <div className="w-20 h-2 rounded-full bg-gold/20" />
                     </div>
                   </div>
                </m.div>

              </div>

            </div>
          </Card>

        </div>
      </Container>
    </Section>
  );
};
