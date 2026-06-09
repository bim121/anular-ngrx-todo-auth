import type { ReactNode } from 'react';

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
      className={`toast toast--${type}`}
      aria-live="polite"
    >
      <span>{message}</span>
      {onDismiss ? (
        <button type="button" className="toast__dismiss" onClick={onDismiss}>
          ×
        </button>
      ) : null}
    </div>
  );
}
