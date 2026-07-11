import React, { useState } from "react";
import { m } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Phone, MapPin, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "../../providers/ToastProvider";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { Heading, Text } from "../ui/Typography";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { RevealHeading, RevealParagraph } from "../motion";
import { GoldenLightningVeins } from "../ui/GoldenLightningVeins";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  projectType: z.string().min(1, "Please select a project type"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactSection: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    // Simulate luxury API submission delay (1.5s)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast(`Thank you, ${data.name}! We will review your inquiry immediately.`, "success");
    reset();
  };

  const projectTypes = [
    "Luxury Brand Experience",
    "High-Performance Website",
    "SaaS Platform Development",
    "Custom Web Applications",
  ];

  return (
    <Section id="contact" padding="normal" className="bg-surface relative overflow-hidden border-t border-forest/[0.06]">
      <GoldenLightningVeins variant="cta" />
      <m.div
        initial={{ opacity: 0.98, y: 2 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.15, ease: [0.19, 1, 0.22, 1] }}
      >
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* LEFT PANEL: Copy details */}
            <div className="lg:col-span-5 flex flex-col items-start text-left gap-8">
              <div className="flex flex-col gap-4">
                <span className="text-[11px] uppercase font-bold tracking-[0.24em] text-gold select-none">
                  Get In Touch
                </span>
                <RevealHeading>
                  <Heading level={2} className="m-0 leading-tight">
                    Let's build <br />
                    something <br />
                    <span className="font-serif italic text-gold">extraordinary</span>.
                  </Heading>
                </RevealHeading>
              </div>
              <RevealParagraph>
                <Text size="sm" className="text-text-secondary max-w-sm m-0">
                  Have an upcoming project or want to audit your existing page ranking? Drop us a brief note and we'll reach out within 24 hours.
                </Text>
              </RevealParagraph>

            <div className="h-px bg-forest/[0.06] w-16 my-2" />

            {/* Studio Contact parameters */}
            <div className="flex flex-col gap-5">
              <a
                href="mailto:hello.techambiance@gmail.com"
                className="flex items-center gap-4 text-xs font-semibold text-text-primary uppercase tracking-wider hover:text-gold transition-colors group"
              >
                <div className="p-2.5 bg-surface border border-forest/[0.06] rounded-xl text-gold shrink-0 group-hover:border-gold/40 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                hello.techambiance@gmail.com
              </a>
              <div
                className="flex items-center gap-4 text-xs font-semibold text-text-primary uppercase tracking-wider select-none group"
              >
                <div className="p-2.5 bg-surface border border-forest/[0.06] rounded-xl text-gold shrink-0 group-hover:border-gold/40 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                +1 (415) 555-0199
              </div>
              <div
                className="flex items-center gap-4 text-xs font-semibold text-text-primary uppercase tracking-wider select-none group"
              >
                <div className="p-2.5 bg-surface border border-forest/[0.06] rounded-xl text-gold shrink-0 group-hover:border-gold/40 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                Studio Office, San Francisco, CA
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: validated luxury form */}
          <div className="lg:col-span-7 w-full text-left">
            <Card padding="lg" className="bg-ivory border-forest/[0.06] rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_20px_50px_rgba(6,41,30,0.02)]">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                
                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-text-secondary/70">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-surface border border-forest/[0.06] focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/30 rounded-xl py-3 px-4 text-xs font-medium text-text-primary transition-all placeholder:text-text-secondary/35"
                      {...register("name")}
                    />
                    {errors.name && (
                      <span className="text-[10px] font-bold text-red-500 mt-0.5">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-text-secondary/70">
                      Your Email
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      className="w-full bg-surface border border-forest/[0.06] focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/30 rounded-xl py-3 px-4 text-xs font-medium text-text-primary transition-all placeholder:text-text-secondary/35"
                      {...register("email")}
                    />
                    {errors.email && (
                      <span className="text-[10px] font-bold text-red-500 mt-0.5">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Select Project Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-text-secondary/70">
                    Select Project Requirement
                  </label>
                  <select
                    className="w-full bg-surface border border-forest/[0.06] focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/30 rounded-xl py-3 px-4 text-xs font-medium text-text-primary transition-all"
                    {...register("projectType")}
                  >
                    <option value="">-- Choose option --</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.projectType && (
                    <span className="text-[10px] font-bold text-red-500 mt-0.5">
                      {errors.projectType.message}
                    </span>
                  )}
                </div>

                {/* Message Area */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-text-secondary/70">
                    Brief Project Scope
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about your project requirements, target goals, and timeline..."
                    className="w-full bg-surface border border-forest/[0.06] focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/30 rounded-xl py-3 px-4 text-xs font-medium text-text-primary transition-all resize-none placeholder:text-text-secondary/35"
                    {...register("message")}
                  />
                  {errors.message && (
                    <span className="text-[10px] font-bold text-red-500 mt-0.5">
                      {errors.message.message}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <div className="flex justify-end mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    icon={isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                </div>

              </form>
            </Card>
          </div>
        </div>
      </Container>
      </m.div>
    </Section>
  );
};

