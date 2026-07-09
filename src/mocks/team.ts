export interface TeamMember {
  id: string;
  number: string;
  name: string;
  role: string;
  responsibility: string;
  bio: string;
  skills: string[];
  image: string;
  socials: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "01",
    number: "01",
    name: "Jaswanth Reddy",
    role: "Founder & Creative Director",
    responsibility: "Architecting editorial flagships & brand telemetry.",
    bio: "Pioneering the intersection of editorial Swiss typography and high-performance digital flagships. Oversees all visual telemetry, luxury interaction weight, and brand philosophy across client ecosystems.",
    skills: ["Creative Direction", "Luxury Brand Systems", "Spatial Typography", "Interaction Physics"],
    image: "/team/member-1.jpg",
    socials: {
      linkedin: "#",
      twitter: "#",
      github: "#",
    },
  },
  {
    id: "02",
    number: "02",
    name: "Lalithendra",
    role: "Systems & Infrastructure",
    responsibility: "Architecting zero-latency software pipelines.",
    bio: "Architecting zero-latency distributed software pipelines and bespoke LLM integration layers. Ensures mission-critical stability, strict type safety, and real-time edge performance.",
    skills: ["AI & Telemetry", "Distributed Systems", "TypeScript Rigor", "Edge Compute"],
    image: "/team/member-2.png",
    socials: {
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: "03",
    number: "03",
    name: "Joshua",
    role: "Product Motion & WebGL",
    responsibility: "Crafting 60fps interaction physics & UI choreography.",
    bio: "Crafting buttery 60fps micro-interactions, hardware-accelerated shaders, and fluid DOM choreography. Brings editorial layouts to life with unhurried, tactile precision.",
    skills: ["Framer Motion Rig", "Custom Shaders", "UI Choreography", "Design Systems"],
    image: "/team/member-3.jpg",
    socials: {
      linkedin: "#",
      twitter: "#",
      github: "#",
    },
  },
  {
    id: "04",
    number: "04",
    name: "Stalin Antony",
    role: "Full-Stack Architecture",
    responsibility: "Engineering high-concurrency cloud ecosystems.",
    bio: "Specializing in scalable cloud architectures, high-concurrency database models, and automated deployment pipelines that keep client flagships secure and lightning-fast.",
    skills: ["Cloud Infrastructure", "High-Concurrency Backend", "Zero-Trust Security", "Automated CI/CD"],
    image: "/team/member-4.jpg",
    socials: {
      linkedin: "#",
      github: "#",
    },
  },
];
