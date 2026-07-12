export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl?: string;
  quote: string;
}

export const testimonialsData: TestimonialItem[] = [
  {
    id: "1",
    name: "Jaswanth Reddy",
    role: "Founder & CEO",
    company: "Cafe Vistaara Group",
    quote: "Tech Ambiance understood our luxury positioning instantly. They didn't just build a website; they captured the soul of our fine-dining experience. Our online reservations skyrocketed by 180% within two months of launch."
  },
  {
    id: "2",
    name: "Lalith",
    role: "Creative Director",
    company: "Aura Clinical Aesthetics",
    quote: "Every single pixel on our website feels deliberate. The animations are buttery smooth, and our patients constantly compliment us on the digital experience. Absolute masters of their craft."
  },
  {
    id: "3",
    name: "Stalin Anthony",
    role: "Operations Manager",
    company: "Prestige Fitness Clubs",
    quote: "The client portal they built for our members is a game-changer. It integrates seamlessly with our booking APIs, looks incredibly high-end, and has reduced booking friction to zero."
  },
  {
    id: "4",
    name: "Joshua",
    role: "Co-Founder",
    company: "Deco Space Interiors",
    quote: "We were looking for a studio that could bridge the gap between design and technology. Tech Ambiance exceeded all expectations. They are the Apple of digital agencies."
  }
];
