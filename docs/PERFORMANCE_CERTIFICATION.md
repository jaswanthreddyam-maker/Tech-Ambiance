# Tech Ambiance Performance Certification

Every production release MUST satisfy these thresholds before deployment.

## 1. Lighthouse Core (Lab Data)
- **Desktop Score:** ≥ 90
- **Mobile Score:** ≥ 85

## 2. Core Web Vitals (Real User & Lab)
- **LCP (Largest Contentful Paint):** < 2.5 s
- **CLS (Cumulative Layout Shift):** < 0.1
- **INP (Interaction to Next Paint) / TBT:** < 200 ms

## 3. Accessibility & SEO
- **Accessibility Score:** ≥ 95
- **SEO Score:** ≥ 95
- **Best Practices:** ≥ 95

## 4. Bundle & Payload
- **Total JS Size:** No unexpected growth (>10% spike requires audit).
- **Largest Chunk:** Must be optimized and lazy-loaded where possible.
- **Duplicate Dependencies:** Zero duplicate packages (e.g., multiple versions of React).
- **CSS:** Unused CSS purged.

## 5. Security & Crawlability
- **CSP (Content Security Policy):** Must be enforced via HTTP headers (`vercel.json`), not meta tags. No `unsafe-inline` for scripts.
- **Robots:** Production domains MUST respond with `X-Robots-Tag: index, follow` (or omit the header). Preview domains should remain `noindex`.

## 6. Real User Monitoring (RUM)
- Post-launch, Core Web Vitals must be continuously monitored via Vercel Analytics or the `web-vitals` library to ensure real-world compliance matches lab benchmarks.
