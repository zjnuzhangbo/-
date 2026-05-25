import { useEffect, useState, useCallback } from 'react';

interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let _toastId = 0;
let _addToast: ((msg: string, type: ToastData['type']) => void) | null = null;

export function toast(message: string, type: ToastData['type'] = 'success') {
  _addToast?.(message, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((message: string, type: ToastData['type']) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  useEffect(() => { _addToast = addToast; return () => { _addToast = null; }; }, [addToast]);

  const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-primary' };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`${colors[t.type]} text-white px-4 py-3 rounded-lg shadow-lg text-sm animate-slide-in`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
