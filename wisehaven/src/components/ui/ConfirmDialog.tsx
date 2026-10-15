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
  cancelLabel = "Cancel",
  variant = "default",
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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-surface-container-low rounded-xl border border-surface-container-high shadow-2xl p-space-md flex flex-col gap-space-md">
        <div className="flex items-start gap-3">
          {variant === "destructive" && (
            <div className="w-10 h-10 rounded bg-error-container/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-error" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h2
              id="dialog-title"
              className="font-headline-sm text-headline-sm text-primary font-semibold"
            >
              {title}
            </h2>
            <p
              id="dialog-desc"
              className="font-body-sm text-body-sm text-on-surface-variant"
            >
              {description}
            </p>
          </div>
        </div>

        {children && (
          <div className="rounded bg-surface-container p-space-sm">
            {children}
          </div>
        )}

        <div className="flex items-center gap-space-sm justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded bg-surface-container text-on-surface font-body-md text-body-md hover:bg-surface-container-high border border-surface-container-high transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              variant === "destructive"
                ? "px-4 py-2.5 rounded bg-error-container/20 text-error font-body-md text-body-md font-semibold hover:bg-error-container/30 border border-error/20 transition-all"
                : "px-4 py-2.5 rounded bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:opacity-90 transition-opacity"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
