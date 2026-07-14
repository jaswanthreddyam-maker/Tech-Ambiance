import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

interface SEOContextType {
  setSEO: (meta: SEOMetadata) => void;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

export const SEOProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seo, setSeoState] = useState<SEOMetadata>({
    title: "Tech Ambiance | Premium Digital Brand Experience Agency",
    description: "We build modern websites, powerful SEO, scalable web applications, and luxury digital brand experiences. Apple + Framer + Linear inspired studio.",
  });

  const setSEO = useCallback((meta: SEOMetadata) => {
    setSeoState(meta);
  }, []);

  useEffect(() => {
    // 1. Title
    const formattedTitle = seo.title.includes("Tech Ambiance")
      ? seo.title
      : `${seo.title} | Tech Ambiance`;
    document.title = formattedTitle;

    // Helper to select or create tags
    const getOrCreateMeta = (attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute("content", contentVal);
    };

    // 2. Description
    getOrCreateMeta("name", "description", seo.description);

    // 3. Keywords
    if (seo.keywords) {
      getOrCreateMeta("name", "keywords", seo.keywords);
    }

    // 4. OpenGraph
    getOrCreateMeta("property", "og:title", formattedTitle);
    getOrCreateMeta("property", "og:description", seo.description);
    getOrCreateMeta("property", "og:image", seo.ogImage || "https://techambiance.com/assets/images/og-default.jpg");
    getOrCreateMeta("property", "og:type", seo.ogType || "website");
    getOrCreateMeta("property", "og:url", seo.canonicalUrl || window.location.href);

    // 5. Twitter Cards
    getOrCreateMeta("name", "twitter:card", "summary_large_image");
    getOrCreateMeta("name", "twitter:title", formattedTitle);
    getOrCreateMeta("name", "twitter:description", seo.description);
    getOrCreateMeta("name", "twitter:image", seo.ogImage || "https://techambiance.com/assets/images/og-default.jpg");

    // 6. Canonical link
    const canonicalLink = seo.canonicalUrl || window.location.href;
    let linkElement = document.querySelector("link[rel='canonical']");
    if (!linkElement) {
      linkElement = document.createElement("link");
      linkElement.setAttribute("rel", "canonical");
      document.head.appendChild(linkElement);
    }
    linkElement.setAttribute("href", canonicalLink);

    // 7. Structured Data / Schema.org (JSON-LD)
    const existingScript = document.getElementById("ta-json-ld");
    if (existingScript) {
      existingScript.remove();
    }

    const defaultSchema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Tech Ambiance",
      "image": "https://techambiance.com/assets/images/logo.png",
      "description": "Premium Digital Brand Experience Agency",
      "telephone": "+91-81210-22707",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Vijayawada",
        "addressRegion": "Andhra Pradesh",
        "postalCode": "520001",
        "addressCountry": "IN"
      },
      "url": "https://techambiance.com"
    };

    const finalSchema = seo.structuredData || defaultSchema;
    const script = document.createElement("script");
    script.id = "ta-json-ld";
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(finalSchema);
    document.head.appendChild(script);

  }, [seo]);

  return (
    <SEOContext.Provider value={{ setSEO }}>
      {children}
    </SEOContext.Provider>
  );
};

export const useSEO = () => {
  const context = useContext(SEOContext);
  if (context === undefined) {
    throw new Error("useSEO must be used within an SEOProvider");
  }
  return context;
};
