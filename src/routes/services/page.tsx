import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { servicesRepository } from '../../repositories/servicesRepository';
import type { Transformation, DigitalAsset, TechItem } from '../../repositories/servicesRepository';
import { portfolioRepository } from '../../repositories/portfolioRepository';
import type { Project } from '../../domain/project/project.types';

// ============================================================================
// Hero Section
// ============================================================================
const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 md:px-12 bg-[#FAF7F0] overflow-hidden pt-32 pb-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#C5A572]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#0B3D2E]/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex items-center justify-center gap-3"
        >
          <span className="w-8 h-[1px] bg-[#C5A572]"></span>
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#C5A572] uppercase">
            Tech Ambiance Digital
          </span>
          <span className="w-8 h-[1px] bg-[#C5A572]"></span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="font-['Cormorant_Garamond'] text-5xl md:text-7xl lg:text-8xl text-[#0B3D2E] font-bold leading-[1.05] tracking-tight max-w-5xl mx-auto mb-10"
        >
          We don't build websites.<br className="hidden md:block"/>
          <span className="italic text-[#0B3D2E]/80">We build businesses</span><br className="hidden md:block"/>
          that happen to run on software.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/contact"
            className="group relative bg-[#0B3D2E] text-[#FAF7F0] px-8 py-4 rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10 text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              Start Your Transformation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-[#C5A572]/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// Industries & Problems Section (Sticky Scroll)
// ============================================================================
const TransformationsSection: React.FC = () => {
  const [data, setData] = useState<Transformation[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    servicesRepository.getTransformations().then(setData);
  }, []);

  return (
    <section className="bg-[#0B3D2E] py-32 px-6 md:px-12 relative text-[#FAF7F0]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
          
          {/* Sticky Left Column: Industries */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-32">
              <h2 className="font-mono text-xs font-bold tracking-[0.2em] text-[#C5A572] uppercase mb-8">
                The Expertise
              </h2>
              <h3 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl font-bold mb-12 leading-tight">
                Specialized industry <br/> transformations.
              </h3>
              
              <div className="flex flex-col gap-6">
                {data.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveIdx(idx)}
                    className={`text-left text-2xl md:text-3xl font-bold transition-all duration-300 ${
                      activeIdx === idx 
                        ? 'text-[#C5A572] translate-x-2' 
                        : 'text-[#FAF7F0]/30 hover:text-[#FAF7F0]/60'
                    }`}
                  >
                    {item.industry}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrolling Right Column: Problems -> Solutions */}
          <div className="lg:col-span-7 flex flex-col justify-center min-h-[50vh]">
            <AnimatePresence mode="wait">
              {data[activeIdx] && (
                <motion.div
                  key={data[activeIdx].id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-10 md:p-16 backdrop-blur-sm"
                >
                  <div className="flex flex-col gap-12">
                    <div>
                      <div className="text-red-400 font-mono text-sm tracking-widest uppercase mb-4 flex items-center gap-3">
                        <span className="w-4 h-[1px] bg-red-400"></span> The Status Quo
                      </div>
                      <h4 className="text-3xl md:text-4xl font-bold text-white/50 strike line-through decoration-red-500/50">
                        {data[activeIdx].before}
                      </h4>
                    </div>

                    <div className="w-8 h-8 rounded-full border border-[#C5A572]/30 flex items-center justify-center text-[#C5A572]">
                      ↓
                    </div>

                    <div>
                      <div className="text-[#C5A572] font-mono text-sm tracking-widest uppercase mb-4 flex items-center gap-3">
                        <span className="w-4 h-[1px] bg-[#C5A572]"></span> The Tech Ambiance Standard
                      </div>
                      <h4 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                        {data[activeIdx].after}
                      </h4>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// What We Build
// ============================================================================
const DigitalAssetsSection: React.FC = () => {
  const [data, setData] = useState<DigitalAsset[]>([]);
  
  useEffect(() => {
    servicesRepository.getDigitalAssets().then(setData);
  }, []);

  return (
    <section className="py-32 px-6 md:px-12 bg-[#FAF7F0]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="font-mono text-xs font-bold tracking-[0.2em] text-[#C5A572] uppercase mb-6">
            Digital Assets We Create
          </h2>
          <h3 className="font-['Cormorant_Garamond'] text-4xl md:text-6xl text-[#0B3D2E] font-bold max-w-3xl leading-tight">
            Engineering scalable systems for modern enterprises.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-[#0B3D2E]/10 p-10 rounded-2xl group hover:border-[#C5A572]/50 hover:shadow-xl transition-all duration-500"
            >
              <div className="w-12 h-12 bg-[#FAF7F0] rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Box className="w-5 h-5 text-[#C5A572]" />
              </div>
              <h4 className="text-xl font-bold text-[#0B3D2E] mb-4">{asset.title}</h4>
              <p className="text-[#0B3D2E]/70 leading-relaxed">
                {asset.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// Proven Transformations (Case Studies)
// ============================================================================
const ProvenTransformationsSection: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    // Only fetch published projects that have metrics to show as proof
    portfolioRepository.getAllProjects().then(data => {
      const published = data.filter(p => p.status === 'PUBLISHED' && p.metrics.length > 0);
      setProjects(published.slice(0, 3)); // Show top 3
    });
  }, []);

  if (projects.length === 0) return null;

  return (
    <section className="py-32 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="font-mono text-xs font-bold tracking-[0.2em] text-[#C5A572] uppercase mb-6">
            Proven Transformations
          </h2>
          <h3 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl text-[#0B3D2E] font-bold">
            The results of applied engineering.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <Link to={`/portfolio/${project.slug}`} className="block relative overflow-hidden rounded-2xl aspect-[4/5] mb-6">
                <img 
                  src={project.cover_image_path || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D2E]/90 via-[#0B3D2E]/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h4 className="text-white text-2xl font-bold mb-2">{project.title}</h4>
                  
                  {project.metrics[0] && (
                    <div className="flex items-end gap-3 text-[#C5A572] mt-4">
                      <span className="text-4xl font-bold leading-none">
                        {project.metrics[0].display_prefix}{project.metrics[0].value}{project.metrics[0].suffix}
                      </span>
                      <span className="text-sm font-bold uppercase tracking-widest text-white/70 mb-1">
                        {project.metrics[0].label}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-[#0B3D2E] font-bold uppercase tracking-widest text-sm hover:text-[#C5A572] transition-colors">
            View All Cases <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// StudioHQ
// ============================================================================
const StudioHQSection: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 bg-[#0B3D2E] text-[#FAF7F0]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="font-mono text-xs font-bold tracking-[0.2em] text-[#C5A572] uppercase mb-8">
            The StudioHQ Differentiator
          </h2>
          <h3 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl font-bold mb-10 leading-tight">
            Most agencies disappear the moment your website launches.<br/>
            <span className="text-[#C5A572] italic">We don't.</span>
          </h3>
          
          <p className="text-[#FAF7F0]/70 text-lg leading-relaxed mb-12 max-w-lg">
            Every client receives exclusive access to StudioHQ—a dedicated operating system for your project. No more digging through email threads for assets, staging links, or milestones. Everything is centralized, secure, and transparent.
          </p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {['Project Timeline', 'Live Deliverables', 'Secure Credentials', 'Key Milestones', 'Design Files', 'Direct Communication'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#C5A572] rounded-full"></span>
                <span className="font-bold text-sm tracking-wide text-[#FAF7F0]/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#C5A572]/20 to-transparent rounded-[2rem] blur-2xl" />
          <div className="relative bg-[#072a1f] border border-white/10 rounded-3xl p-2 shadow-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
            {/* Minimal abstract representation of StudioHQ UI instead of a realistic screenshot for timelessness */}
            <div className="w-full h-full bg-black/20 rounded-2xl border border-white/5 p-8 flex flex-col relative overflow-hidden">
              <div className="w-full flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#C5A572]">StudioHQ Client Portal</div>
              </div>
              
              <div className="flex-1 flex gap-6">
                <div className="w-1/4 h-full flex flex-col gap-4">
                  <div className="w-full h-8 bg-white/5 rounded-lg" />
                  <div className="w-3/4 h-8 bg-white/5 rounded-lg" />
                  <div className="w-full h-8 bg-white/10 rounded-lg border border-[#C5A572]/30" />
                  <div className="w-5/6 h-8 bg-white/5 rounded-lg" />
                </div>
                <div className="flex-1 h-full flex flex-col gap-4">
                  <div className="w-full h-32 bg-gradient-to-br from-white/10 to-transparent rounded-xl border border-white/5" />
                  <div className="w-full flex-1 bg-white/5 rounded-xl border border-white/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// Technology Restrained Grid
// ============================================================================
const TechnologySection: React.FC = () => {
  const [tech, setTech] = useState<TechItem[]>([]);

  useEffect(() => {
    servicesRepository.getTechStack().then(setTech);
  }, []);

  return (
    <section className="py-32 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="font-mono text-xs font-bold tracking-[0.2em] text-[#C5A572] uppercase mb-16">
          The Engineering Stack
        </h2>
        
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 max-w-4xl mx-auto">
          {tech.map((item) => (
            <div 
              key={item.id}
              className="text-xl md:text-2xl font-bold text-[#0B3D2E]/40 hover:text-[#0B3D2E] transition-colors duration-300 cursor-default"
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// CTA & Pricing Philosophy
// ============================================================================
const CTASection: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 bg-[#FAF7F0] border-t border-[#0B3D2E]/10">
      <div className="max-w-4xl mx-auto text-center">
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-left mb-24 max-w-3xl mx-auto">
          <div className="col-span-2 md:col-span-3 text-center mb-8">
            <h2 className="font-mono text-xs font-bold tracking-[0.2em] text-[#C5A572] uppercase">
              The Philosophy
            </h2>
          </div>
          {['Every engagement is custom.', 'Strategy First.', 'Fixed Scope.', 'Transparent Delivery.', 'No templates.', 'No subscriptions unless requested.'].map((principle, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[#C5A572] mt-1">✦</span>
              <span className="font-bold text-[#0B3D2E]">{principle}</span>
            </div>
          ))}
        </div>

        <h3 className="font-['Cormorant_Garamond'] text-5xl md:text-7xl font-bold text-[#0B3D2E] mb-12 leading-tight">
          Let's map your next digital flagship.
        </h3>

        <Link
          to="/contact"
          className="inline-flex items-center gap-4 bg-[#0B3D2E] text-[#FAF7F0] px-10 py-5 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#0B3D2E]/20 group"
        >
          <span className="text-sm font-bold tracking-widest uppercase">
            Schedule a 30-Minute Strategy Session
          </span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

// ============================================================================
// Main Page Export
// ============================================================================
export const ServicesPage: React.FC = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="w-full min-h-screen bg-[#FAF7F0]">
      <HeroSection />
      <TransformationsSection />
      <DigitalAssetsSection />
      <ProvenTransformationsSection />
      <StudioHQSection />
      <TechnologySection />
      <CTASection />
    </main>
  );
};

export default ServicesPage;
