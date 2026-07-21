# Tech Ambiance — 3D Rendering Architecture Specification

## 1. Executive Summary & Creative Direction

**Tech Ambiance** is an engineering-first, luxury digital agency. Rather than employing generic 3D visual eye-candy, our 3D interactive layer is designed around **"The Living Digital Architecture"** — a signature CAD-inspired, node-and-filament blueprint network that visually communicates software precision, system connectivity, and luxury craft.

This document details the engineering specifications, performance contracts, unified render loop architecture, and phased implementation roadmap for integrating WebGL 3D into the codebase.

---

## 2. Technical Stack & React 19 Integration

| Layer | Selection | Justification |
| :--- | :--- | :--- |
| **WebGL Library** | **Three.js** (`three` ^0.170.0) | Pure, un-opinionated WebGL library. Zero framework lock-in. Tree-shakeable footprint (~45 KiB gzipped). |
| **React Integration** | **Custom React 19 Bridge** (`AmbientCanvas.tsx`) | R3F (React Three Fiber) v8 introduces peer-dependency warnings and fiber scheduler overhead in React 19 concurrent mode. A lightweight custom React bridge hook gives 100% control over initialization, cleanup, and rendering. |
| **Shader Layer** | **Custom GLSL Shaders** (`.vert` / `.frag`) | Custom vertex deformation and fragment metallic/emissive shaders for custom lighting effects without expensive standard PBR multi-pass overhead. |
| **Scroll Sync** | **Lenis Unified RAF Loop** (`ScrollProvider.tsx`) | Eliminates the "Dual RAF Hazard" by registering Three.js frame renders directly inside Lenis's existing `requestAnimationFrame` loop. |

---

## 3. Unified Render Loop Architecture

### Dual RAF Prevention
To prevent micro-jank caused by unsynchronized `requestAnimationFrame` dispatches between Lenis and Three.js, all WebGL renders are driven by a single unified tick controller.

```
                  ┌───────────────────────────────┐
                  │   Window RequestAnimationFrame│
                  └──────────────┬────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  ScrollProvider Ticker│
                     └───────────┬───────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
    ┌─────────────────────────┐     ┌─────────────────────────┐
    │  Lenis Smooth Scroll    │     │  SceneManager.render()  │
    │  .raf(time)             │     │  (WebGL Canvas Tick)    │
    └─────────────────────────┘     └─────────────────────────┘
```

### Scene Manager Lifecycle Interface
```typescript
export class SceneManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isVisible: boolean = false;

  constructor(container: HTMLElement) {
    // Initialize WebGLRenderer with alpha, antialias: false (controlled via DPR)
  }

  public tick(time: number, scrollVelocity: number): void {
    if (!this.isVisible) return; // Pause GPU work when scrolled out of view
    this.updateNodes(time, scrollVelocity);
    this.renderer.render(this.scene, this.camera);
  }

  public destroy(): void {
    // Dispose geometry, materials, textures, webgl contexts
  }
}
```

---

## 4. Hard Performance & DPR Contracts

To protect Tech Ambiance's 95+ Lighthouse performance target, the 3D subsystem enforces these non-negotiable budgets:

1. **Bundle Footprint**: Max **+45 KiB** gzipped added to dynamic chunk.
2. **Draw Calls**: Maximum **12 draw calls** per frame (`InstancedMesh` for nodes, single line-segments buffer for connection filaments).
3. **Geometry Budget**: Maximum **15,000 vertices** across the entire 3D scene.
4. **Device Pixel Ratio (DPR) Policy**:
   - High-tier Desktop: `min(window.devicePixelRatio, 1.5)`
   - Mobile / Battery Saver: Capped at `1.0`
5. **Texture Policy**: Maximum single 1024x1024 compressed noise map. No uncompressed multi-megabyte textures.
6. **Visibility Pause**: When container is out of view (detected via `IntersectionObserver` with 0px margin), the render loop immediately halts GPU execution.

---

## 5. Signature Experience: "The Living Digital Architecture"

### Visual Aesthetic & Blueprint Engine
- **Assembly Sequence**: Upon page load, small champagne-gold nodes (`#C9A56A`) materialize in space. Filaments draw between them like CAD architectural blueprints or software dependency graphs.
- **Materiality**: Warm ivory background (`#FAF7F0`), champagne-gold glowing conductive traces, subtle marble reflection planes, and micro particle dust.
- **Cursor Reactivity**: The structural lattice subtly flexes with physical mass/inertia as the user shifts their cursor.
- **Scroll Integration**: Scroll depth unfolds the 3D network, transitioning from a micro node cluster in the Hero into macro architectural structural guides down the page.

---

## 6. Phased Implementation & Execution Roadmap

### Phase 3D-1: Infrastructure & Engine Foundation
- Implement `src/components/canvas/AmbientCanvas.tsx` React 19 bridge.
- Build `SceneManager.ts` with lifecycle initialization, window resize handlers, and WebGL context loss recovery.
- Update `ScrollProvider.tsx` to expose a unified render registry.
- Set up `useInView` IntersectionObserver pause logic and `prefers-reduced-motion` fallbacks.

### Phase 3D-2: Prototyping & Design Alignment
- Implement procedural node assembly algorithm (`InstancedMesh` + BufferGeometry filaments).
- Create custom GLSL shaders for node pulse and filament current propagation.
- Benchmark FPS, memory consumption, and draw call density.

### Phase 3D-3: Production Integration & Optimization
- Integrate dynamic hover highlights linked to UI elements (Portfolio, Services buttons).
- Perform cross-browser testing (iOS Safari, Mobile Chrome, Windows Edge).
- Finalize Lighthouse & bundle budget verification.

---

## 7. Accessibility & Fallback Guarantees

- **DOM Preservation**: The WebGL canvas renders as an ambient background element (`aria-hidden="true"` and `pointer-events-none`).
- **Screen Readers & Keyboard**: All interactive elements (CTA buttons, links, hero text) remain 100% native HTML elements.
- **Mobile & Low-Power Degradation**: If `navigator.hardwareConcurrency <= 4` or touch points indicates a low-end mobile device, 3D automatically degrades to static `GoldenLightningVeins` vector graphics.
