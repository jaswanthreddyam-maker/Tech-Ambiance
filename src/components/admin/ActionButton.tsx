import React, { useState } from 'react';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { ACTION_REGISTRY } from '../../auth/registry/actions';
import { ACTION_BEHAVIOR_REGISTRY } from '../../auth/registry/actionBehavior';
import { ConfirmationDialog } from './ConfirmationDialog';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  actionId: string;
  onAction: () => Promise<void> | void;
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  actionId, 
  onAction, 
  children, 
  className,
  ...props 
}) => {
  const { can, isLoading: isPermissionsLoading } = usePermissions();
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const actionConfig = ACTION_REGISTRY[actionId];
  const behaviorConfig = ACTION_BEHAVIOR_REGISTRY[actionId] || actionConfig; // Fallback to inline behavior temporarily

  // If action is not registered, log a warning and fall back to disabled to be safe.
  if (!actionConfig) {
    console.warn(`ActionButton: Action ID "${actionId}" is not registered in ACTION_REGISTRY.`);
    return (
      <button disabled className={`opacity-50 cursor-not-allowed ${className || ''}`} {...props}>
        {children}
      </button>
    );
  }

  const isAuthorized = can(actionConfig.requiredPermission);

  // Handle visibility policy (hidden vs disabled)
  if (!isAuthorized && behaviorConfig.visibility === 'hidden') {
    return null;
  }

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      // Fire analytics event
      if (behaviorConfig.analyticsEvent) {
        console.debug("[Action]", behaviorConfig.analyticsEvent);
      }

      await onAction();

      // Fire success toast (mocked for now, assumes global toast provider eventually)
      const successMsg = typeof behaviorConfig.successMessage === 'function' 
        ? behaviorConfig.successMessage() 
        : behaviorConfig.successMessage;

      if (successMsg) {
        console.log(`[Toast Success]: ${successMsg}`);
      }
    } catch (error) {
      console.error(`Action ${actionId} failed:`, error);
      // Fire failure toast
      if (behaviorConfig.failureToast) {
        console.error(`[Toast Error]: ${behaviorConfig.failureToast}`, error);
      } else {
        const errorMsg = actionConfig.failureToast || 'Action failed. Please try again.';
        console.error(`[Toast Error]: ${errorMsg}`);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthorized || isExecuting || isPermissionsLoading) return;

    if (behaviorConfig.requiresConfirmation) {
      setShowConfirmation(true);
    } else {
      handleExecute();
    }
  };

  const isDisabled = !isAuthorized || isExecuting || isPermissionsLoading || props.disabled;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        title={!isAuthorized ? `Requires permission: ${actionConfig.requiredPermission}` : undefined}
        className={`relative transition-all ${className || ''} ${!isAuthorized ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        {...props}
      >
        <span className={`flex items-center justify-center gap-2 ${isExecuting ? 'opacity-0' : 'opacity-100'}`}>
          {children}
        </span>
        
        {isExecuting && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
          </span>
        )}
      </button>

      {behaviorConfig.requiresConfirmation && showConfirmation && (
        <ConfirmationDialog
          isOpen={showConfirmation}
          title={behaviorConfig.confirmationTitle || "Are you sure?"}
          message={behaviorConfig.confirmationMessage || "This action cannot be undone."}
          style={behaviorConfig.confirmationStyle || "default"}
          confirmLabel={behaviorConfig.confirmButtonLabel || "Confirm"}
          cancelLabel={behaviorConfig.cancelButtonLabel || "Cancel"}
          onConfirm={() => {
            setShowConfirmation(false);
            handleExecute();
          }}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
};
