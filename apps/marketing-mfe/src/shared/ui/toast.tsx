import type { ReactNode } from 'react';
import { Button } from '@marketing/shared/ui/button';
import { cn } from '@marketing/shared/lib/utils';

type ToastType = 'success' | 'error';

interface ToastProps {
  type: ToastType;
  message: string;
  onDismiss?: () => void;
}

export function Toast({ type, message, onDismiss }: ToastProps): ReactNode {
  return (
    <div
      role="status"
      className={cn(
        'mb-4 flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border px-3.5 py-3 text-sm',
        type === 'success' &&
          'border-[var(--color-success-border)] bg-[var(--color-success-subtle)] text-[var(--color-success-text)]',
        type === 'error' &&
          'border-[var(--color-danger)] bg-[var(--color-danger-subtle)] text-[var(--color-danger-text)]'
      )}
      aria-live="polite"
    >
      <span>{message}</span>
      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-inherit"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </Button>
      ) : null}
    </div>
  );
}
