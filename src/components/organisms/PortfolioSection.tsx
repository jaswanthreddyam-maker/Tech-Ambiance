import React from "react";
import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { Heading, Text } from "../ui/Typography";
import { Card } from "../ui/Card";
import { MarbleVeins } from "../ui/MarbleVeins";
import { ROUTES } from "../../routes/routes";
import { MOCK_PROJECTS } from "../../mocks/projects";

export const PortfolioSection: React.FC = () => {

  // Filter out the featured project if we want, or just show all.
  const selectedProjects = MOCK_PROJECTS.filter(p => !p.featured);

  return (
    <Section id="work" padding="normal" className="bg-surface border-t border-forest/[0.06]">
      <Container>
        
        {/* Title Block */}
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <span className="text-[11px] uppercase font-bold tracking-[0.24em] text-gold select-none">
            Selected Case Studies
          </span>
          <Heading level={2}>
            Handcrafted <span className="font-serif italic text-gold">digital products</span>
          </Heading>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {selectedProjects.map((project, idx) => (
            <m.div
              key={project.id}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30%" }}
              transition={{ duration: 1.15, ease: [0.19, 1, 0.22, 1], delay: Math.floor(idx / 2) * 0.14 }}
            >
              <Link to={`${ROUTES.work}/${project.slug}`} className="block h-full group">
                <Card 
                  padding="none" 
                  variant="default"
                  className="h-full flex flex-col overflow-hidden hover:border-gold transition-colors duration-500 bg-ivory"
                >
                  {/* Custom Branded Browser Preview Frame Container */}
                  <div className="aspect-[4/3] bg-forest/[0.02] relative overflow-hidden flex items-end justify-center px-8 pt-8 border-b border-forest/[0.04]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-forest/[0.03] to-transparent z-0 group-hover:scale-105 transition-transform duration-[1200ms] ease-out pointer-events-none" />
                    
                    {/* Branded Chrome Simulator */}
                    <div className="relative w-full h-[90%] rounded-t-xl overflow-hidden border-x border-t border-forest/[0.06] bg-[#FAF7F0] shadow-[0_15px_30px_rgba(6,41,30,0.04)] flex flex-col z-10 transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:translate-y-1">
                      {/* Browser Header */}
                      <div className="flex items-center justify-between px-4 py-2 border-b border-forest/[0.06] bg-[#FAF7F0] select-none">
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
                        </div>
                        <div className="w-24 h-2 bg-forest/[0.02] rounded-full border border-forest/[0.04]" />
                        <div className="w-4 h-1 bg-forest/10 rounded" />
                      </div>
                      {/* Browser Body simulator */}
                      <div className="flex-1 bg-emerald-stone p-6 flex flex-col justify-end relative overflow-hidden">
                        <MarbleVeins />
                        <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent z-10" />
                        <div className="absolute inset-0 opacity-15 group-hover:scale-105 transition-transform duration-[1200ms] flex items-center justify-center">
                          <div className="w-40 h-40 border border-gold rounded-full blur-2xl opacity-[0.05]" />
                        </div>
                        <div className="relative z-20 flex flex-col gap-1.5 text-left select-none">
                          <div className="w-16 h-1.5 bg-gold/60 rounded" />
                          <div className="w-32 h-3.5 bg-gold/20 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-8 md:p-10 flex flex-col justify-between flex-1">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-gold">
                          {project.industry}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-forest/30 group-hover:text-gold transition-colors duration-300" />
                      </div>
                      <Heading level={4} className="text-forest m-0 leading-snug">
                        {project.title}
                      </Heading>
                      <Text size="base" className="text-text-secondary m-0 line-clamp-2">
                        {project.description}
                      </Text>
                    </div>

                    <div className="mt-8 pt-6 border-t border-forest/[0.06] flex flex-wrap gap-2">
                       {project.services.map(service => (
                          <span key={service} className="text-[8px] uppercase tracking-widest font-bold text-text-secondary bg-forest/[0.03] px-2.5 py-1 rounded-full border border-forest/[0.02]">
                            {service}
                          </span>
                       ))}
                    </div>
                  </div>
                </Card>
              </Link>
            </m.div>
          ))}
        </div>

      </Container>
    </Section>
  );
};

