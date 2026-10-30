/**
 * DemoModeBanner
 *
 * Persistent, unobtrusive banner shown on all authenticated pages.
 * Clearly communicates that WiseHaven operates with demo money only.
 * No real funds, no real financial settlement.
 */

import { AlertTriangle } from "lucide-react";

export default function DemoModeBanner() {
  return (
    <div
      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-center"
      style={{
        background: "rgba(255, 184, 0, 0.06)",
        borderBottom: "1px solid rgba(255, 184, 0, 0.18)",
      }}
      role="status"
      aria-label="Demo mode notice"
    >
      <AlertTriangle
        size={12}
        className="shrink-0"
        style={{ color: "#ffb800" }}
        aria-hidden="true"
      />
      <p
        className="font-label-sm text-label-sm uppercase tracking-[0.12em] font-semibold"
        style={{ color: "#ffb800", fontSize: "11px" }}
      >
        DEMO MODE — Simulated money only. No real deposits, withdrawals, or payments.
      </p>
    </div>
  );
}
