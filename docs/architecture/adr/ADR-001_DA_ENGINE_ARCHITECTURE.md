# ADR-001: Digital Architecture Engine (DA-Engine) Core Platform Architecture

## Status
**ACCEPTED & FROZEN (v1.0)** — July 21, 2026

## Context
Tech Ambiance requires a luxury digital brand visual identity that communicates engineering precision, system connectivity, and architectural craft without sacrificing Lighthouse performance, mobile responsiveness, or React 19 compatibility.

Standard WebGL approaches usually involve decorating a site with unlinked 3D Canvas scenes running separate `requestAnimationFrame` loops, leading to frame drift, heavy bundle payloads, and architectural decay.

## Decision
We engineered the **Digital Architecture Engine (DA-Engine)** as an event-driven, renderer-agnostic visual operating system built upon six architectural pillars:

1. **Framework-Agnostic Core**: Three.js wrapped in a custom React 19 bridge (`AmbientCanvas.tsx`). Bypasses React Three Fiber (R3F) peer-dependency issues in React 19.
2. **Unified RAF Bridge**: Driven directly by Lenis smooth scroll ticker loop in `ScrollProvider.tsx` to eliminate the "Dual RAF Hazard".
3. **Decoupled 6-Layer Subsystem Architecture**: Subsystems (`RenderingEngine`, `MotionEngine`, `NarrativeEngine`, `InteractionEngine`, `PerformanceEngine`, `AssetEngine`) communicate via `EngineContext` and categorized `EventBus`.
4. **Finite State Machine (FSM)**: Story state transitions through 6 deterministic chapters (`Awakening` → `Convergence`).
5. **Strict Scene Contract (`SceneObjectContract`)**: All scene components implement standard lifecycle methods (`initialize`, `update`, `resize`, `pause`, `resume`, `dispose`, `onEvent`).
6. **Purpose Before Spectacle Principle**: Every rendered frame must communicate meaning before visual excitement.

## Consequences
- **Positive**: 3D rendering becomes the result of state rather than an isolated graphic demo. Bundle overhead is isolated to dynamic chunks (`+45 KiB`), and execution pauses automatically offscreen.
- **Positive**: The engine can be reused across StudioHQ, ScoutAI, and Client Portal without modifying foundation code.
- **Trade-off**: Requires strict discipline during feature additions. Structural changes to DA-1 require formal ADR justification.
