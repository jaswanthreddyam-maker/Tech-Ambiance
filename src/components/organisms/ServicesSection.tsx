import React from "react";
import { m } from "framer-motion";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { Heading, Text } from "../ui/Typography";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routes";
import { MOCK_SERVICES } from "../../mocks/services";
import { RevealHeading } from "../motion";

export const ServicesSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Section id="services" padding="normal" className="bg-ivory relative overflow-hidden">
      <Container className="relative z-10">
        
        {/* Title Block */}
        <div className="flex flex-col items-center text-center gap-4 mb-14">
          <span className="text-[11px] uppercase font-bold tracking-[0.24em] text-gold select-none">
            Capabilities
          </span>
          <RevealHeading>
            <Heading level={2} className="text-forest mb-0">
              Engineered for <span className="font-serif italic text-gold">growth</span>.
            </Heading>
          </RevealHeading>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_SERVICES.map((service, idx) => (
            <m.div 
              key={service.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1.05, ease: [0.19, 1, 0.22, 1], delay: [0.08, 0.14, 0.11][idx % 3] }}
            >
              <Card 
                padding="lg" 
                className="h-full flex flex-col justify-between group hover:border-gold transition-colors duration-500 bg-surface"
              >
                <div className="flex flex-col gap-6">
                  {/* Top: Title & Desc */}
                  <div className="flex flex-col gap-3">
                    <Heading level={4} className="text-forest mb-0">
                      {service.title}
                    </Heading>
                    <Text size="sm" className="text-text-secondary m-0">
                      {service.description}
                    </Text>
                  </div>

                  {/* Middle: Features */}
                  <ul className="flex flex-col gap-3">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 select-none">
                        <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-1" />
                        <span className="text-[13px] font-medium text-text-primary">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </m.div>
          ))}
        </div>

        {/* Global CTA instead of individual pricing */}
        <div 
          className="mt-14 flex flex-col items-center gap-6 p-8 md:p-12 border border-forest/[0.04] rounded-card bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_20px_50px_rgba(6,41,30,0.02)]"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <Heading level={4} className="text-text-primary m-0">Tailored pricing for every project.</Heading>
            <Text size="sm" className="text-text-secondary max-w-md m-0">Custom proposal based on your business goals and specific technical requirements.</Text>
          </div>
          <Button 
            variant="primary" 
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.contact)}
          >
            Book a Strategy Call
          </Button>
        </div>

      </Container>
    </Section>
  );
};

