# ADR-002: Narrative Engine Finite State Machine (FSM) Model

## Status
**ACCEPTED & FROZEN (v1.0)** — July 21, 2026

## Context
Standard 3D web animations usually rely on free-form timelines or scroll progress percentages directly bound to camera positions. This tight coupling makes animations brittle, difficult to debug, and impossible to reuse across different page structures or application views.

## Decision
We engineered the `NarrativeEngine` as a **Deterministic Finite State Machine (FSM)** driven by an Event Bus:

1. **6 Story Chapters**: States transition deterministically through `Awakening`, `Expansion`, `Capability`, `Execution`, `Proof`, and `Convergence`.
2. **Event-Driven Transitions**: UI sections emit domain events (`interaction.scroll`, `interaction.hover`), which the FSM evaluates to trigger state shifts.
3. **Decoupled Memory Model**: The engine tracks visited chapters independently of UI render logic, maintaining visitor journey state across route navigations.

## Consequences
- **Positive**: React components do not contain 3D logic. Story chapters can be re-mapped to different UI sections or product flows.
- **Positive**: State transitions are 100% deterministic and observable via the `Shift + D` DA Debug Panel.
- **Trade-off**: Requires pre-defining chapter states rather than scrubbing free-form timelines arbitrarily.

## Future Reconsideration
This ADR should be revisited if:
1. Product teams require non-linear, branching narrative paths in complex web applications.
2. Analytics prove that multi-chapter state tracking causes measurable memory overhead on low-end mobile browsers.
