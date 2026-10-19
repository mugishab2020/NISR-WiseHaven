"use client";

import {
  createContext, useContext, useState, useCallback, type ReactNode,
} from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

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

  const ACCENT: Record<ToastType, string> = {
    success: "#bef532",
    error:   "#ff6b6b",
    info:    "#808080",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-20 lg:bottom-6 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className="flex items-center gap-3 px-4 py-3 rounded-xl pointer-events-auto"
            style={{
              background: "#171717",
              border: "1px solid #303030",
              borderLeft: `3px solid ${ACCENT[toast.type]}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.60)",
            }}
          >
            {toast.type === "success" && <CheckCircle size={16} style={{ color: "#bef532", flexShrink: 0 }} />}
            {toast.type === "error"   && <AlertCircle size={16} style={{ color: "#ff6b6b", flexShrink: 0 }} />}
            {toast.type === "info"    && <Info         size={16} style={{ color: "#808080", flexShrink: 0 }} />}

            <p className="font-body-sm text-body-sm flex-1 text-white">{toast.message}</p>

            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 transition-colors"
              style={{ color: "#808080" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#808080"; }}
              aria-label="Dismiss notification"
            >
              <X size={13} />
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
