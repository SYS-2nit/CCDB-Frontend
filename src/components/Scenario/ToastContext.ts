import { createContext } from 'react';

export const ToastContext = createContext<{ show: (msg: string, type?: 'success' | 'error') => void } | null>(null);