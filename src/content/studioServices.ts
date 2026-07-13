import type { Service } from "../domain/service/service.types";

export const STUDIO_SERVICES: Service[] = [
  {
    id: "svc_1",
    slug: "premium-web-design",
    title: "Premium Web Design",
    description: "Custom-designed web experiences tailored to elevate your brand's digital presence and increase conversions.",
    features: ["Bespoke UI/UX", "High-Converting Layouts", "Interactive Prototyping", "Design Systems"],
  },
  {
    id: "svc_2",
    slug: "engineering",
    title: "Web Engineering",
    description: "Robust, scalable, and lightning-fast web applications built on modern architectures like Next.js and React.",
    features: ["Frontend Development", "CMS Integration", "E-Commerce Solutions", "Performance Optimization"],
  },
  {
    id: "svc_3",
    slug: "seo-growth",
    title: "SEO & Growth",
    description: "Data-driven SEO strategies that improve your search engine rankings and bring high-quality organic traffic.",
    features: ["Technical SEO", "Content Strategy", "On-page Optimization", "Analytics & Tracking"],
  },
];

export const MOCK_SERVICES = STUDIO_SERVICES;
