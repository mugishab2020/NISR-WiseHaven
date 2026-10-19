"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatRWF } from "@/lib/currency";
import { Settings, Shield, Eye, EyeOff, RefreshCw, AlertTriangle } from "lucide-react";

const CARD: React.CSSProperties = { background: "#171717", border: "1px solid #242424", borderRadius: "12px", overflow: "hidden" };
const ROW_BORDER = "1px solid #1a1a1a";

export default function SettingsPage() {
  const { account, privacyMode, togglePrivacyMode, doReset } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone]               = useState(false);

  function handleReset() {
    doReset();
    setShowResetConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6 max-w-2xl">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={13} style={{ color: "#808080" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#808080" }}>
              Preferences
            </span>
          </div>
          <h1 className="font-geist font-semibold text-[28px] text-white tracking-tight leading-none">
            Settings
          </h1>
        </div>

        {/* ── Demo disclaimer ──────────────────────────────── */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: "rgba(255,184,0,0.04)", border: "1px solid rgba(255,184,0,0.15)" }}
        >
          <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: "#ffb800" }} />
          <div>
            <p className="font-body-md text-body-md text-white font-medium">Demo Mode — Prototype Only</p>
            <p className="font-body-sm text-body-sm mt-1" style={{ color: "#b5b5b5" }}>
              WiseHaven is a simulated prototype. All figures are demo data. No real deposits, withdrawals, or payments occur. State is saved in your browser&apos;s localStorage only.
            </p>
          </div>
        </div>

        {/* ── Display ─────────────────────────────────────── */}
        <div style={CARD}>
          <div className="px-4 py-3" style={{ borderBottom: ROW_BORDER }}>
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Display
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              {privacyMode
                ? <EyeOff size={16} style={{ color: "#808080" }} />
                : <Eye size={16} style={{ color: "#808080" }} />
              }
              <div>
                <p className="font-body-md text-body-md text-white font-medium">Privacy Mode</p>
                <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
                  Hide all financial figures from display
                </p>
              </div>
            </div>
            {/* Toggle switch */}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={privacyMode}
                onChange={togglePrivacyMode}
                className="sr-only"
                aria-label="Toggle privacy mode"
              />
              <div
                className="w-11 h-6 rounded-full relative transition-colors"
                style={{ background: privacyMode ? "#bef532" : "#2a2a2a", border: "1px solid #303030" }}
              >
                <span
                  className="absolute top-[2px] w-5 h-5 rounded-full transition-all"
                  style={{
                    background: privacyMode ? "#000000" : "#808080",
                    left: privacyMode ? "calc(100% - 22px)" : "2px",
                  }}
                />
              </div>
            </label>
          </div>
        </div>

        {/* ── Vault settings summary ───────────────────────── */}
        <div style={CARD}>
          <div className="px-4 py-3" style={{ borderBottom: ROW_BORDER }}>
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Emergency Vault
            </span>
          </div>
          {[
            { label: "Auto-Sweep",        value: account.vaultSettings.isAutoSweepEnabled ? "Enabled" : "Disabled", color: account.vaultSettings.isAutoSweepEnabled ? "#bef532" : "#808080" },
            { label: "Sweep Percentage",  value: `${account.vaultSettings.sweepPercentage}%`, color: "#ffffff" },
            { label: "Target Goal",       value: `${formatRWF(account.vaultSettings.targetAmount)} RWF`, color: "#ffffff" },
            { label: "Current Balance",   value: `${formatRWF(account.vaultBalance)} RWF`, color: "#bef532" },
          ].map(({ label, value, color }, i, arr) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < arr.length - 1 ? ROW_BORDER : "none" }}
            >
              <span className="font-body-sm text-body-sm" style={{ color: "#808080" }}>{label}</span>
              <span className="font-label-sm text-label-sm font-semibold font-mono" style={{ color }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Account info ─────────────────────────────────── */}
        <div style={CARD}>
          <div className="px-4 py-3" style={{ borderBottom: ROW_BORDER }}>
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Demo Account
            </span>
          </div>
          {[
            { label: "Total Funds",    value: `${formatRWF(account.totalFunds)} RWF` },
            { label: "Envelopes",      value: `${account.envelopes.length} total` },
            { label: "Transactions",   value: `${account.transactions.length} records` },
            { label: "Persistence",    value: "Browser localStorage" },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < arr.length - 1 ? ROW_BORDER : "none" }}
            >
              <span className="font-body-sm text-body-sm" style={{ color: "#808080" }}>{label}</span>
              <span className="font-label-sm text-label-sm font-mono" style={{ color: "#b5b5b5" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── Reset demo data ──────────────────────────────── */}
        <div
          className="p-4 rounded-xl flex flex-col gap-3"
          style={{ background: "rgba(255,68,68,0.04)", border: "1px solid rgba(255,68,68,0.15)" }}
        >
          <div className="flex items-center gap-2">
            <RefreshCw size={15} style={{ color: "#ff6b6b" }} />
            <h3 className="font-body-md text-body-md font-semibold" style={{ color: "#ff6b6b" }}>
              Reset Demo Data
            </h3>
          </div>
          <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
            Wipes all demo state (envelopes, transactions, vault balance) and restores the original sample data. Cannot be undone.
          </p>
          {resetDone && (
            <p className="font-body-sm text-body-sm font-semibold" style={{ color: "#bef532" }}>
              ✓ Demo data has been reset to defaults.
            </p>
          )}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="self-start flex items-center gap-2 px-4 py-2.5 rounded-lg font-body-sm text-body-sm font-semibold transition-all"
            style={{ background: "rgba(255,68,68,0.10)", color: "#ff6b6b", border: "1px solid rgba(255,68,68,0.25)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,68,68,0.16)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,68,68,0.10)"; }}
          >
            <RefreshCw size={14} /> Reset Demo Data
          </button>
        </div>

        {/* ── About ───────────────────────────────────────── */}
        <div
          className="p-4 rounded-xl flex flex-col gap-2"
          style={{ background: "#171717", border: "1px solid #242424" }}
        >
          <div className="flex items-center gap-2">
            <Shield size={13} style={{ color: "#808080" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              About WiseHaven
            </span>
          </div>
          <p className="font-body-sm text-body-sm leading-relaxed" style={{ color: "#808080" }}>
            WiseHaven is a smart, time-locked envelope budgeting prototype for Rwanda. Give Every Franc a Purpose.
          </p>
          <div className="flex items-center gap-3 pt-1 font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
            <span>v0.1.0-demo</span>
            <span>·</span>
            <span>Next.js 14</span>
            <span>·</span>
            <span>Kigali, Rwanda</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Demo Data?"
        description="All envelopes, transactions, and vault history will be wiped and replaced with original sample data. This cannot be undone."
        confirmLabel="Reset Everything"
        cancelLabel="Keep My Data"
        variant="destructive"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </AppShell>
  );
}
