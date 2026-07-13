import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, FileText, Code, Briefcase, Users } from "lucide-react";
import { publicationRepository } from "../../repositories/publicationRepository";
import { ROUTES } from "../../routes/routes";

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Execute global search
  const results = React.useMemo(() => {
    if (!query.trim()) return [];

    const publications = publicationRepository.search(query);
    
    // In a real scenario, we would search other repositories here (Services, Projects, etc)
    // For V1, we map publication results and add generic quick links for empty searches.

    return publications.map(p => ({
      id: p.id,
      title: p.title,
      type: p.category,
      icon: <FileText className="w-4 h-4" />,
      action: () => navigate(`/insights/${p.slug}`)
    }));
  }, [query, navigate]);

  const defaultLinks = [
    { id: '1', title: 'View Services', type: 'Navigation', icon: <Code className="w-4 h-4" />, action: () => navigate(ROUTES.services) },
    { id: '2', title: 'Explore Portfolio', type: 'Navigation', icon: <Briefcase className="w-4 h-4" />, action: () => navigate(ROUTES.portfolio) },
    { id: '3', title: 'Read the Manifesto', type: 'Navigation', icon: <Users className="w-4 h-4" />, action: () => navigate(ROUTES.manifesto) },
  ];

  const displayResults = query.trim() ? results : defaultLinks;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0B3D2E]/80 backdrop-blur-sm z-[9999]"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#FAF7F0] rounded-2xl shadow-2xl overflow-hidden z-[10000] border border-[#0B3D2E]/10"
          >
            {/* Search Input */}
            <div className="flex items-center px-6 py-4 border-b border-[#0B3D2E]/10">
              <Search className="w-5 h-5 text-[#0B3D2E]/50 mr-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, case studies, services..."
                className="flex-1 bg-transparent border-none outline-none text-[#0B3D2E] text-lg font-medium placeholder:text-[#0B3D2E]/30"
              />
              <div className="flex items-center gap-1 text-[10px] font-semibold text-[#0B3D2E]/40 border border-[#0B3D2E]/10 px-2 py-1 rounded">
                <span>ESC</span>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {displayResults.length === 0 ? (
                <div className="py-12 text-center text-[#0B3D2E]/50 text-sm font-medium">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {displayResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        result.action();
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-[#0B3D2E]/5 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#0B3D2E]/5 flex items-center justify-center text-[#0B3D2E]/50 group-hover:text-[#C5A572] transition-colors">
                          {result.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#0B3D2E] group-hover:text-[#C5A572] transition-colors">{result.title}</h4>
                          <p className="text-[10px] uppercase tracking-widest text-[#0B3D2E]/50 mt-1">{result.type}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#0B3D2E]/20 group-hover:text-[#C5A572] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
