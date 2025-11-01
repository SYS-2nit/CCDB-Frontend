import { useContext } from 'react';
import { ToastContext } from './ToastContext';
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('ToastProvider required');
  return ctx;
};