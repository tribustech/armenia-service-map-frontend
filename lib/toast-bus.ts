export type AppToastType = 'success' | 'error';

export interface AppToast {
  id: number;
  type: AppToastType;
  message: string;
}

type ToastListener = (toast: AppToast) => void;

const listeners = new Set<ToastListener>();
let sequence = 0;

export function publishToast(input: Omit<AppToast, 'id'>) {
  const toast: AppToast = { id: ++sequence, ...input };
  listeners.forEach((listener) => listener(toast));
}

export function subscribeToToast(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
