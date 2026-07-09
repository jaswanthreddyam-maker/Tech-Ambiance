import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCursorHover } from "../hooks/useCursorHover";
import { useSEO } from "../providers/SEOProvider";

export const NotFoundPage: React.FC = () => {
  const { setSEO } = useSEO();
  const hoverProps = useCursorHover("pointer");

  React.useEffect(() => {
    setSEO({
      title: "404 Page Not Found | Tech Ambiance",
      description: "The digital experience you are trying to reach doesn't exist.",
    });
  }, [setSEO]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center text-center gap-6 max-w-md mx-auto min-h-[60vh]"
    >
      <h1 className="font-heading text-8xl font-black text-gold/30 tracking-wider">
        404
      </h1>
      <h2 className="font-heading text-2xl font-bold text-text-primary">
        Experience not found.
      </h2>
      <p className="text-xs text-text-secondary leading-relaxed font-light mb-4">
        The route you are requesting does not exist in our studio mapping environment. Please verify the URL or return to experience homepage.
      </p>
      
      <Link
        to="/experience"
        className="bg-gold text-white text-xs uppercase tracking-widest font-bold px-8 py-4 rounded-full hover:bg-gold/90 transition-all duration-300 shadow-sm"
        {...hoverProps}
      >
        Return to Experience
      </Link>
    </motion.div>
  );
};
export default NotFoundPage;
