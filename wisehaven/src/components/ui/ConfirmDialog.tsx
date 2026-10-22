"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  variant      = "default",
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(8px)" }}
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md flex flex-col gap-5 p-5"
        style={{
          background: "#171717",
          border: "1px solid #303030",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.80)",
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          {variant === "destructive" && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,68,68,0.10)" }}
            >
              <AlertTriangle size={18} style={{ color: "#ff6b6b" }} />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h2
              id="dialog-title"
              className="font-geist font-semibold text-[18px] text-white leading-tight"
            >
              {title}
            </h2>
            <p
              id="dialog-desc"
              className="font-body-sm text-body-sm leading-relaxed"
              style={{ color: "#b5b5b5" }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Optional children (summary details) */}
        {children && (
          <div
            className="rounded-xl p-3"
            style={{ background: "#0d0d0d", border: "1px solid #242424" }}
          >
            {children}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg font-body-sm text-body-sm font-medium transition-colors"
            style={{ background: "#202020", color: "#b5b5b5", border: "1px solid #303030" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; (e.currentTarget as HTMLElement).style.borderColor = "#404040"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#b5b5b5"; (e.currentTarget as HTMLElement).style.borderColor = "#303030"; }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-lg font-body-sm text-body-sm font-semibold transition-all active:scale-[0.98]"
            style={
              variant === "destructive"
                ? { background: "rgba(255,68,68,0.12)", color: "#ff6b6b", border: "1px solid rgba(255,68,68,0.30)" }
                : { background: "#bef532", color: "#000000" }
            }
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
