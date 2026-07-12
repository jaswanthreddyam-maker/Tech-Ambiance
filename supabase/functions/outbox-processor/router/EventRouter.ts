import { DomainEvent, DomainEventHandler } from "../types.ts";

// The Event Router serves as the compile-time registry.
// This guarantees that there are no giant dynamic switch statements, 
// and all handlers are strictly type-safe and explicitly registered.

export class EventRouter {
  private registry: Map<string, DomainEventHandler> = new Map();

  register(eventType: string, handler: DomainEventHandler): void {
    this.registry.set(eventType, handler);
  }

  async route(event: DomainEvent): Promise<void> {
    const handler = this.registry.get(event.event_type);
    
    if (!handler) {
      console.warn(`No handler registered for event type: ${event.event_type}`);
      // If we throw here, the event will fail and retry. 
      // It's better to explicitly fail it so it moves to DLQ if unregistered.
      throw new Error(`Unhandled event type: ${event.event_type}`);
    }

    await handler.handle(event);
  }
}
