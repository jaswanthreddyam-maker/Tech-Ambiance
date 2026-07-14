import type { ActionCategory } from './actions';

export interface ActionBehaviorDefinition {
  id: string;
  category?: ActionCategory;
  dangerous?: boolean;
  requiresConfirmation?: boolean;
  confirmationStyle?: "default" | "warning" | "danger";
  confirmationTitle?: string;
  confirmationMessage?: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  successMessage?: string | ((data?: any) => string);
  failureToast?: string;
  analyticsEvent?: string;
  visibility?: "hidden" | "disabled"; // when unauthorized
  audit?: boolean;
  featureFlag?: string;
  onSuccess?: 'invalidate' | 'redirect' | 'refresh' | 'none';
}

export const ACTION_BEHAVIOR_REGISTRY: Record<string, ActionBehaviorDefinition> = {
  // Placeholder for mappings. 
  // We'll migrate the UI properties from ACTION_REGISTRY here.
};
