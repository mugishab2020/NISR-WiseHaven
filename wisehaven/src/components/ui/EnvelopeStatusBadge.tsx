"use client";

import type { EnvelopeStatus } from "@/types";
import { Lock, Unlock, CheckCircle, Check, XCircle } from "lucide-react";

interface EnvelopeStatusBadgeProps {
  status: EnvelopeStatus;
  className?: string;
}

export default function EnvelopeStatusBadge({
  status,
  className,
}: EnvelopeStatusBadgeProps) {
  switch (status) {
    case "locked":
      return (
        <span
          role="status"
          aria-label="Envelope status: Locked"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-medium border ${className ?? ""}`}
          style={{
            background: "rgba(190,245,50,0.08)",
            color: "#bef532",
            borderColor: "rgba(190,245,50,0.20)",
          }}
        >
          <Lock size={10} />
          <span>Locked</span>
        </span>
      );

    case "unlocking_soon":
      return (
        <span
          role="status"
          aria-label="Envelope status: Unlocking Soon"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold border animate-pulse ${className ?? ""}`}
          style={{
            background: "rgba(255,184,0,0.10)",
            color: "#ffb800",
            borderColor: "rgba(255,184,0,0.25)",
          }}
        >
          <Unlock size={10} />
          <span>Unlocking Soon</span>
        </span>
      );

    case "ready_to_pay":
      return (
        <span
          role="status"
          aria-label="Envelope status: Ready to Pay"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${className ?? ""}`}
          style={{ background: "#bef532", color: "#000000" }}
        >
          <CheckCircle size={10} />
          <span>Ready to Pay</span>
        </span>
      );

    case "paid":
      return (
        <span
          role="status"
          aria-label="Envelope status: Paid"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-medium bg-surface-container-highest text-outline ${className ?? ""}`}
        >
          <Check size={10} />
          <span>Paid</span>
        </span>
      );

    case "cancelled":
      return (
        <span
          role="status"
          aria-label="Envelope status: Cancelled"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-medium border ${className ?? ""}`}
          style={{
            background: "rgba(255,68,68,0.08)",
            color: "#ff6b6b",
            borderColor: "rgba(255,68,68,0.20)",
          }}
        >
          <XCircle size={10} />
          <span>Cancelled</span>
        </span>
      );
  }
}
