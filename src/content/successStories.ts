export interface SuccessStoryMetric {
  value: string;
  label: string;
}

export interface SuccessStory {
  slug: string;
  title: string;
  industry: string;
  summary: string;
  metrics: SuccessStoryMetric[];
  thumbnail: string;
  featuredImage: string;
  accentColor: string;
  status: 'PUBLISHED' | 'ARCHIVED';
  displayOrder: number;
  externalUrl?: string;
  imageFit?: 'cover' | 'contain';
}

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    slug: 'coffee-mine',
    title: 'Coffee Mine',
    industry: 'Luxury Hospitality & Fine Dining',
    summary:
      'A bespoke digital flagship that transformed physical culinary elegance into high-converting online table reservations.',
    metrics: [
      { value: '+180%', label: 'Table Reservations' },
      { value: '1.2s', label: 'Lighthouse Load Time' },
      { value: '98/100', label: 'SEO Performance Score' },
    ],
    thumbnail: 'linear-gradient(135deg, #0B3027 0%, #07221C 100%)',
    featuredImage: '/assets/images/projects/coffee-mine-cover-opt.webp',
    accentColor: '#C9A56A',
    status: 'PUBLISHED',
    displayOrder: 1,
    externalUrl: 'https://venerable-kheer-de1b18.netlify.app/',
  },
  {
    slug: 'go-chicken',
    title: 'Go Chicken',
    industry: 'High-Velocity QSR & Instant Commerce',
    summary:
      'An ultra-fast mobile ordering ecosystem engineered for instant commerce, zero friction checkout, and peak order volumes.',
    metrics: [
      { value: '3.4x', label: 'Order Velocity' },
      { value: '0.6s', label: 'Checkout Interactive' },
      { value: '99.99%', label: 'Peak Reliability' },
    ],
    thumbnail: 'linear-gradient(135deg, #153C30 0%, #0A241D 100%)',
    featuredImage: '/assets/images/projects/go-chicken-landing-opt.webp',
    accentColor: '#E6D3A3',
    status: 'PUBLISHED',
    displayOrder: 2,
    externalUrl: 'https://go-chicken-rz1f.vercel.app/',
  },
  {
    slug: 'gym-bolt',
    title: 'GYM Bolt',
    industry: 'Health & Fitness Center',
    summary:
      'A high-performance digital platform engineered for fitness enthusiasts, driving membership growth and streamlined gym operations.',
    metrics: [
      { value: '+240%', label: 'Membership Signups' },
      { value: '+62%', label: 'Organic Search Reach' },
      { value: '99/100', label: 'Core Web Vitals' },
    ],
    thumbnail: 'linear-gradient(135deg, #0F352B 0%, #08261F 100%)',
    featuredImage: '/assets/images/projects/gym-bolt-cover-opt.webp',
    accentColor: '#C9A56A',
    status: 'PUBLISHED',
    displayOrder: 3,
    externalUrl: 'https://wildfitnessgym.netlify.app',
  },
];
