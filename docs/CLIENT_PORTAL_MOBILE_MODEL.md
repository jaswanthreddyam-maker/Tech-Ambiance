# Client Portal Mobile Architecture (Mobile Model)

## 1. Navigation Philosophy
The mobile portal strictly separates its architecture from the desktop portal layout. It utilizes a **Nested Routing Strategy** (`PortalMobileLayout` encapsulating an `Outlet`) to guarantee:
- A persistent mobile shell (no remounting for common elements like bottom tabs or global hero).
- Smooth route transitions.
- Native app-like deep linking and browser history logic (`/portal`, `/portal/project`, `/portal/updates`).

## 2. Route Hierarchy
- `/portal` ➔ Home Dashboard
- `/portal/project` ➔ Project Section (Documents, Envs, Deliverables)
- `/portal/updates` ➔ Timeline & Notifications
- *Profile / More* is not a route; it triggers a **Bottom Sheet**.

## 3. Component Hierarchy
```
src/routes/portal/components/mobile/
├── layout/
│   └── PortalMobileLayout.tsx
├── navigation/
│   ├── BottomNav.tsx
│   └── FloatingCTA.tsx
├── bottom-sheet/
│   ├── ProfileSheet.tsx
│   └── ProjectSwitchSheet.tsx
├── hero/
│   └── GlobalProjectHero.tsx
└── pages/
    ├── MobileHome.tsx
    ├── MobileProject.tsx
    └── MobileUpdates.tsx
```

## 4. Motion Guidelines
- **Bottom Navigation**: Active indicator slides at `180ms`. Icon scale `0.95 → 1` (spring).
- **Bottom Sheet**: Slide up at `260ms`. Fade backdrop at `180ms`.
- **Route Transition**: Fade + slight translate (`200–250ms`). No full-page slides.
- **Sticky Header**: Compress into 50-60px height after ~120px vertical scroll.

## 5. CSS Design Tokens
Isolated in `src/styles/portal.css`:
```css
:root {
  --portal-bottom-nav-height: 80px;
  --portal-header-height: 60px;
  --portal-fab-size: 56px;
  --portal-sheet-radius: 24px;
  --portal-safe-bottom: env(safe-area-inset-bottom);
}
```

## 6. Action Registry
Actions (like Floating CTA configuration) must not be hardcoded in views. Use `MOBILE_ROUTE_CONFIG` located in `src/routes/portal/registry/mobileRouteConfig.ts`.

## 7. Empty States
Every section must gracefully handle empty lists/data.
Examples:
- Invoices: "No invoices yet. You're all caught up."
- Activity: "No recent updates. We'll notify you as work progresses."

## 8. Styling Principles
- **Aesthetic**: Luxury + Editorial + Premium SaaS.
- **Surfaces**: Use solid colors, subtle shadows, and premium typography.
- **Glassmorphism**: Restricted strictly to overlays (bottom sheets, modals, bottom nav).
