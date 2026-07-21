# Tech Ambiance — Digital Architecture Motion System

## Executive Overview & Core Principle

> **"The DA-Engine is an event-driven rendering system, not a Three.js application."**

> **"Not a graphic demo. An engineered digital nervous system."**

> **"Do not make DA-2A beautiful. Make it meaningful."**

Tech Ambiance does not use 3D graphics for passive decoration or visual gimmicks. Every WebGL element, particle, and mathematical line segment rendered by the **Digital Architecture Engine (DA-Engine)** serves as a direct visual expression of our agency's core positioning: **engineering precision expressed through luxury digital architecture**.

---

## 1. Phase DA-1 Status: FROZEN

As of July 21, 2026, **Phase DA-1 (Foundation Architecture)** is officially **FROZEN**.

The 6-layer engine subsystem, `EngineContext`, domain `EventBus`, unified Lenis RAF bridge, `PerformanceEngine` quality profiles, `SceneRegistry`, and `DADebugPanel` inspector are certified and locked against structural feature creep.

---

## 2. The 8 Design & Motion Principles

| Principle | Core Directive | Implementation Rule |
| :--- | :--- | :--- |
| **1. Growth** | Structures assemble rather than appear | Geometry never pops in or fades randomly; nodes compute mathematical coordinates, and conductive filaments draw linearly like CAD blueprints. |
| **2. Connection** | Relationships form before complexity emerges | Filaments connect primary seed nodes first; sub-branches, vertices, and caustics emerge only after structural relationships are established. |
| **3. Energy** | Light travels through connections with physics | Light propagation has voltage, speed, acceleration, and attenuation. Current flows along line segments like electricity, never teleporting. |
| **4. Response** | Interactions influence localized structures | Input events warp and illuminate nearby clusters with spring physics, preserving global scene stability. |
| **5. Restraint** | Motion is subtle and purposeful | Zero gratuitous 3D spinning, zero continuous camera loops, zero spatial disorientations. Movement is grounded and precise. |
| **6. Calm & Stillness** | Embrace contrast between stillness and energy | The environment defaults to complete stillness or micro-breathing; a single golden current propagation creates high-contrast luxury elegance. |
| **7. Graceful Degradation** | Identity is preserved without motion | On reduced-motion preferences or low-tier hardware, the scene freezes into an exquisite, high-contrast CAD architectural blueprint. |
| **8. Purpose Before Spectacle** | Communication precedes visual excitement | **Every rendered frame must communicate meaning before visual excitement.** If an animation exists only to look cool, delete it. |

---

## 3. Strict Scene Component Contract

Every 3D component registered in the `SceneRegistry` MUST satisfy this strict lifecycle contract:

```typescript
export interface SceneObjectContract {
  id: string;
  initialize(ctx: EngineContext): void;
  update(ctx: EngineContext, delta: number): void;
  resize?(ctx: EngineContext, width: number, height: number): void;
  pause?(ctx: EngineContext): void;
  resume?(ctx: EngineContext): void;
  dispose(ctx: EngineContext): void;
  getObject3D(): THREE.Object3D;
  onEvent?(event: string, data: any): void;
  serialize?(): Record<string, any>;
  deserialize?(data: Record<string, any>): void;
}
```

---

## 4. Architecture Decision Records (ADRs)

Key architectural decisions are documented in the repository ADR registry:
- **[ADR-001: DA-Engine Platform Architecture](file:///d:/Tech%20Ambiance/docs/architecture/adr/ADR-001_DA_ENGINE_ARCHITECTURE.md)** (`ACCEPTED & FROZEN v1.0`)

---

## 5. DA-2A Narrative Acceptance Criteria

**Phase DA-2A is complete when:**
1. The Hero section visibly assembles from seed nodes into a structural CAD network.
2. Scroll depth advances the narrative deterministically through Chapter FSM transitions.
3. Section hovers produce localized, meaningful node responses without affecting unrelated regions.
4. The 20-second idle sequence executes intentionally without visual distraction.
5. The narrative is fully compelling using ONLY simple white/gold nodes (`○────○`) and line segments.
6. The `Shift + D` DA Debug Panel confirms stable 60 FPS timing and expected event propagation.

> **Explicit Exclusion**: Phase DA-2A strictly excludes custom GLSL shaders, bloom, PBR reflections, and metallic caustics (deferred to DA-2B).

---

## 6. Decoupled 6-Layer Subsystem Architecture

```
                  ┌───────────────────────────────────────────┐
                  │    Digital Architecture Engine (DA)       │
                  └─────────────────────┬─────────────────────┘
                                        │
                                        ▼
                                 [ EngineContext ]
                                        │
     ┌──────────────────┬───────────────┼───────────────┬──────────────────┬──────────────────┐
     ▼                  ▼               ▼               ▼                  ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌───────────┐ ┌──────────────┐ ┌──────────────────┐ ┌──────────────┐
│ Interaction  │ │ Narrative    │ │ Motion    │ │ Rendering    │ │ Performance      │ │ Asset        │
│ Engine       │ │ FSM Engine   │ │ Engine    │ │ Engine       │ │ Engine           │ │ Engine       │
└──────┬───────┘ └──────┬───────┘ └─────┬─────┘ └──────┬───────┘ └────────┬─────────┘ └──────┬───────┘
       │                │               │              │                  │                  │
Normalizes input  Finite State    Pure Math     Three.js &     Quality Profiles   Shaders, Geometry,
mouse/touch/focus Machine & Scene Voltage &     Pure Render    (Ultra->Minimal),  Textures, Memory
events            State Memory    Physics Math  Execution      Context Recovery   Disposal Manager
```

---

## 5. Phased Implementation Series (DA Engine)

- **Phase DA-1**: Foundation & Certification [`STATUS: FROZEN`]
- **Phase DA-2A**: Narrative & Structural Blueprint Prototype
  - Minimal white/gold nodes (`○────○`) and line segments. Zero complex shaders.
  - Objective: Prove structural assembly narrative, scroll reactivity, and 20s idle self-assembly pacing.
- **Phase DA-2B**: Shader & Visual Refinement Layer
  - GLSL voltage propagation, metallic caustics, micro particle dust.
- **Phase DA-3**: Ecosystem Cross-Integration (StudioHQ, ScoutAI, Client Portal signatures).
