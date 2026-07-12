export interface DomainEvent {
  id: string;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  payload: any;
  status: string;
  attempts: number;
  last_error?: string | null;
  created_at: string;
}

export interface DomainEventHandler {
  handle(event: DomainEvent): Promise<void>;
}
