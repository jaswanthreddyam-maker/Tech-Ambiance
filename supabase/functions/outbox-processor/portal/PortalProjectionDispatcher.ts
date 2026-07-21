import { FeedProjectionHandler } from './handlers/FeedProjectionHandler.ts';
import { ActionProjectionHandler } from './handlers/ActionProjectionHandler.ts';
import { HomeProjectionHandler } from './handlers/HomeProjectionHandler.ts';
import { ProjectProjectionHandler } from './handlers/ProjectProjectionHandler.ts';
import { BillingProjectionHandler } from './handlers/BillingProjectionHandler.ts';
import { ProjectionMetrics } from './ProjectionMetrics.ts';

/**
 * Portal Projection Dispatcher
 * 
 * This dispatcher is called by the Outbox Worker for every event.
 * It routes the event to the appropriate modular projection handlers.
 * 
 * Invariant: Projection handlers MUST be idempotent.
 */
export class PortalProjectionDispatcher {
  static async dispatch(event: any) {
    try {
      // 1. Core / Primary Projections
      // Every client-visible event creates exactly one Feed Item.
      if (event.is_client_visible) {
        await FeedProjectionHandler.handle(event);
      }
      
      // Actions are explicitly updated based on certain events.
      await ActionProjectionHandler.handle(event);

      // 2. Aggregated Read Models
      // These handlers react to the same events to update their denormalized state.
      await Promise.all([
        HomeProjectionHandler.handle(event),
        ProjectProjectionHandler.handle(event),
        BillingProjectionHandler.handle(event)
      ]);

      ProjectionMetrics.recordEventSuccess(event);
    } catch (error) {
      ProjectionMetrics.recordEventFailure(event, error);
      throw error; // Rethrow to let the outbox worker handle retries
    }
  }
}
