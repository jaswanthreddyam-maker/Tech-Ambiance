import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { faqData } from "../../content/faq";
import type { FAQItem } from "../../content/faq";
import { useCursorHover } from "../../hooks/useCursorHover";
import { Plus, Minus } from "lucide-react";

export const FAQSection: React.FC = () => {
  const hoverProps = useCursorHover("pointer");
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="pricing" className="py-32 bg-transparent relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-left">
        
        {/* Section Header */}
        <div className="flex flex-col items-start gap-4 mb-20">
          <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold select-none">
            Common Inquiries
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary leading-tight">
            Frequently asked <span className="font-serif italic text-gold">questions</span>.
          </h2>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col border-t border-border-custom">
          {faqData.map((faq: FAQItem) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="border-b border-border-custom transition-all duration-300"
              >
                {/* Trigger Button */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full py-8 flex items-center justify-between text-left focus:outline-none group"
                  {...hoverProps}
                >
                  <span className="font-heading text-base md:text-lg font-bold text-text-primary group-hover:text-gold transition-colors duration-150 pr-4">
                    {faq.question}
                  </span>
                  <div className="shrink-0 p-2 border border-border-custom group-hover:border-gold rounded-full transition-colors duration-300">
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5 text-gold" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-text-secondary group-hover:text-gold" />
                    )}
                  </div>
                </button>

                {/* Dropdown Body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 text-xs md:text-sm text-text-secondary leading-relaxed font-light pr-12">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default FAQSection;
