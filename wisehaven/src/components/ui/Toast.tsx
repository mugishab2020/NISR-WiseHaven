"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-20 lg:bottom-6 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border
              ${
                toast.type === "success"
                  ? "bg-surface-container-low border-primary-fixed/20 text-on-surface"
                  : toast.type === "error"
                    ? "bg-surface-container-low border-error/20 text-on-surface"
                    : "bg-surface-container-low border-surface-container-high text-on-surface"
              }
              animate-in slide-in-from-right-5 fade-in
            `}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} className="text-primary-fixed shrink-0" />
            ) : toast.type === "error" ? (
              <AlertCircle size={18} className="text-error shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-outline shrink-0" />
            )}
            <p className="font-body-sm text-body-sm flex-1">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-outline hover:text-on-surface transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
