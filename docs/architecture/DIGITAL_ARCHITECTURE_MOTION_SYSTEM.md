# Tech Ambiance — Digital Architecture Motion System

## Executive Overview & Core Principle

> **"The DA-Engine is an event-driven rendering system, not a Three.js application."**

> **"Not a graphic demo. An engineered digital nervous system."**

Tech Ambiance does not use 3D graphics for passive decoration or visual gimmicks. Every WebGL element, particle, and mathematical line segment rendered by the **Digital Architecture Engine (DA-Engine)** serves as a direct visual expression of our agency's core positioning: **engineering precision expressed through luxury digital architecture**.

---

## 1. The 8 Design & Motion Principles

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

## 2. Decoupled 6-Layer Subsystem Architecture

To ensure multi-year maintainability and seamless reuse across StudioHQ, ScoutAI, and the Client Portal, the DA-Engine is architected into 6 independent subsystems wired via a shared `EngineContext` and a categorized `EventBus`:

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

### Unidirectional Event & Data Pipeline
```
Interaction Event ──> EventBus ──> Narrative FSM ──> Motion Physics ──> Rendering Draw
```

### Layer Responsibilities
1. **Interaction Engine**: Normalizes desktop mouse, mobile touch proximity, keyboard focus traversal, and future voice/AI inputs into categorized `interaction.*` events (`interaction.pointer`, `interaction.hover`, `interaction.scroll`).
2. **Narrative FSM Engine**: Finite State Machine handling 6 story states (`Awakening`, `Expansion`, `Capability`, `Execution`, `Proof`, `Convergence`) and tracking visitor exploration memory (`narrative.chapter`, `narrative.memory`).
3. **Motion Engine**: Pure renderer-agnostic math library (`Spring()`, `Voltage()`, `Noise()`, `Interpolation()`). Knows nothing about Three.js or DOM objects.
4. **Rendering Engine**: Pure WebGL layer containing Three.js scene, cameras, instanced geometries, GLSL shaders, and PBR materials. Receives render state, never raw interaction events.
5. **Performance Engine**: Manages 5 Quality Profiles (`Ultra`, `High`, `Balanced`, `Low`, `Minimal`), DPR scaling, offscreen `IntersectionObserver` pause, and WebGL context loss recovery (`performance.profile`, `performance.pause`).
6. **Asset Engine**: Owns WebGL resources (shaders, geometry buffers, textures, material cache) and enforces zero-memory-leak disposal lifecycle (`asset.loaded`, `asset.disposed`).

---

## 3. The Cinematic Story Finite State Machine (FSM)

```typescript
export enum NarrativeState {
  Awakening = 'Awakening',   // Chapter 1: Hero seed assembly (4 initial nodes compute & draw filaments)
  Expansion = 'Expansion',   // Chapter 2: BuiltFor / Success (Graph expands into space)
  Capability = 'Capability', // Chapter 3: Services / Showreel (Cluster expansion into 4 core pillars)
  Execution = 'Execution',   // Chapter 4: Process / Difference (Sequential current propagation)
  Proof = 'Proof',           // Chapter 5: Portfolio / Proof (Node illumination & journey memory)
  Convergence = 'Convergence'// Chapter 6: Contact / CTA (All active filaments stream toward CTA)
}
```

---

## 4. Performance Quality Profiles

The `PerformanceEngine` dynamically resolves one of five quality profiles based on device benchmark capabilities:

| Profile | Target DPR | Geometry Detail | FPS Cap | Shader Quality | Pause Policy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ultra** | `min(dpr, 1.5)` | 15,000 vertices | 60 FPS | Full Caustics + Metallic PBR | Off-screen |
| **High** | `min(dpr, 1.25)` | 10,000 vertices | 60 FPS | Medium Shaders | Off-screen |
| **Balanced** | `1.0` | 5,000 vertices | 60 FPS | Basic Shaders | Off-screen |
| **Low** | `1.0` | 2,000 vertices | 30 FPS | Flat Emissive | Off-screen |
| **Minimal** | `1.0` | 0 (Static Blueprint) | 0 (Static) | Disabled (Vector Fallback) | Always Static |

---

## 5. Automated Certification Requirements

1. **Memory Leak Certification**: Automated mount -> unmount lifecycle validation ensuring zero un-disposed WebGL buffers, textures, event listeners, or un-canceled RAF callbacks.
2. **Context Loss Recovery Certification**: Simulates `WEBGL_lose_context` extension trigger, verifying that the `PerformanceEngine` handles context recovery, re-initializes `AssetEngine` buffers, and seamlessly resumes rendering.

---

## 6. Phased Implementation Series (DA Engine)

- **Phase DA-1**: 6-Layer Subsystem Engine, Shared `EngineContext`, Categorized `EventBus`, and Lenis Unified RAF Ticker Integration.
- **Phase DA-2**: Blueprint Node Engine, Voltage Physics Shaders & 20s Idle Self-Assembly Prototype.
- **Phase DA-3**: Cinematic Story Narrative Integration, Scene Memory, and Performance/Memory Certification.
