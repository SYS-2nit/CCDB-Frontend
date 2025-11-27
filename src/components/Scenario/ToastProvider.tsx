/*
 ******************************************************************
 작성자: 배지원
 ******************************************************************
 */
import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { ToastContext } from './ToastContext';

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<{ msg: string; type?: 'success' | 'error' }[]>([]);
  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setToasts((prev) => [...prev, { msg, type }]);
    setTimeout(() => setToasts((prev) => prev.slice(1)), 2300);
  };
  return (
    <ToastContext.Provider value={{ show }}>
        
      {children}
      <div className="toast-zone">
        {toasts.map((t, i) => (
          <div key={i} className={`toast toast--${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};