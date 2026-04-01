'use client';

import { useEffect, useState } from 'react';
import { subscribeToToast, type AppToast } from '@/lib/toast-bus';

const TOAST_DURATION_MS = 4500;

export function ToastCenter() {
  const [toasts, setToasts] = useState<AppToast[]>([]);

  useEffect(() => {
    return subscribeToToast((toast) => {
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, TOAST_DURATION_MS);
    });
  }, []);

  function dismiss(id: number) {
    setToasts((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]'
              : 'border-[#fecaca] bg-[#fef2f2] text-[#991b1b]'
          }`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-5">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded p-1 text-current/80 transition-colors hover:bg-black/5 hover:text-current"
              aria-label="Dismiss notification"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
