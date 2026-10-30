"use client";

import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { formatRWF } from "@/lib/currency";
import { Settings, Shield, Eye, EyeOff, AlertTriangle, RefreshCw } from "lucide-react";

const CARD: React.CSSProperties = { background: "#171717", border: "1px solid #242424", borderRadius: "12px", overflow: "hidden" };
const ROW_BORDER = "1px solid #1a1a1a";

export default function SettingsPage() {
  const { state, privacyMode, togglePrivacyMode, refresh } = useApp();
  const { wallet, envelopes, transactions, vaultBalance } = state;

  const totalFunds = wallet ? Number(wallet.balance) + envelopes.reduce((s, e) => s + Number(e.balance), 0) : 0;

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6 max-w-2xl">
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={13} style={{ color: "#808080" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#808080" }}>Preferences</span>
          </div>
          <h1 className="font-geist font-semibold text-[28px] text-white tracking-tight leading-none">Settings</h1>
        </div>

        {/* Demo disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "rgba(255,184,0,0.04)", border: "1px solid rgba(255,184,0,0.15)" }}>
          <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: "#ffb800" }} />
          <div>
            <p className="font-body-md text-body-md text-white font-medium">Demo Mode — Prototype Only</p>
            <p className="font-body-sm text-body-sm mt-1" style={{ color: "#b5b5b5" }}>
              WiseHaven is a simulated prototype. All figures are demo data. No real deposits, withdrawals, or payments occur. State is stored in PostgreSQL per your Clerk account.
            </p>
          </div>
        </div>

        {/* Display */}
        <div style={CARD}>
          <div className="px-4 py-3" style={{ borderBottom: ROW_BORDER }}>
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Display</span>
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              {privacyMode ? <EyeOff size={16} style={{ color: "#808080" }} /> : <Eye size={16} style={{ color: "#808080" }} />}
              <div>
                <p className="font-body-md text-body-md text-white font-medium">Privacy Mode</p>
                <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>Hide all financial figures from display</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input type="checkbox" checked={privacyMode} onChange={togglePrivacyMode} className="sr-only" aria-label="Toggle privacy mode" />
              <div className="w-11 h-6 rounded-full relative transition-colors" style={{ background: privacyMode ? "#bef532" : "#2a2a2a", border: "1px solid #303030" }}>
                <span className="absolute top-[2px] w-5 h-5 rounded-full transition-all"
                  style={{ background: privacyMode ? "#000000" : "#808080", left: privacyMode ? "calc(100% - 22px)" : "2px" }} />
              </div>
            </label>
          </div>
        </div>

        {/* Vault settings summary */}
        <div style={CARD}>
          <div className="px-4 py-3" style={{ borderBottom: ROW_BORDER }}>
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Emergency Vault</span>
          </div>
          {[
            { label: "Current Balance", value: `${privacyMode ? "••••••" : formatRWF(vaultBalance)} RWF`, color: "#bef532" },
            { label: "First-Sweep Rate", value: `${((state.userProfile?.first_sweep_percentage ?? 0.05) * 100).toFixed(0)}%`, color: "#ffffff" },
          ].map(({ label, value, color }, i, arr) => (
            <div key={label} className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < arr.length - 1 ? ROW_BORDER : "none" }}>
              <span className="font-body-sm text-body-sm" style={{ color: "#808080" }}>{label}</span>
              <span className="font-label-sm text-label-sm font-semibold font-mono" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div style={CARD}>
          <div className="px-4 py-3" style={{ borderBottom: ROW_BORDER }}>
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Demo Account</span>
          </div>
          {[
            { label: "Total Funds",    value: `${privacyMode ? "••••••" : formatRWF(totalFunds)} RWF` },
            { label: "Envelopes",      value: `${envelopes.filter(e => !e.is_emergency_vault).length} active` },
            { label: "Transactions",   value: `${transactions.length} records` },
            { label: "Data Storage",   value: "PostgreSQL (backend)" },
          ].map(({ label, value }, i, arr) => (
            <div key={label} className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < arr.length - 1 ? ROW_BORDER : "none" }}>
              <span className="font-body-sm text-body-sm" style={{ color: "#808080" }}>{label}</span>
              <span className="font-label-sm text-label-sm font-mono" style={{ color: "#b5b5b5" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Refresh */}
        <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: "#171717", border: "1px solid #242424" }}>
          <div className="flex items-center gap-2">
            <RefreshCw size={15} style={{ color: "#808080" }} />
            <h3 className="font-body-md text-body-md font-semibold" style={{ color: "#b5b5b5" }}>Refresh Data</h3>
          </div>
          <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
            Re-fetch your latest wallet balance, envelopes, and transactions from the backend.
          </p>
          <button onClick={() => refresh()}
            className="self-start flex items-center gap-2 px-4 py-2.5 rounded-lg font-body-sm text-body-sm font-semibold transition-colors"
            style={{ background: "#202020", color: "#b5b5b5", border: "1px solid #303030" }}>
            <RefreshCw size={14} /> Refresh Now
          </button>
        </div>

        {/* About */}
        <div className="p-4 rounded-xl flex flex-col gap-2" style={{ background: "#171717", border: "1px solid #242424" }}>
          <div className="flex items-center gap-2">
            <Shield size={13} style={{ color: "#808080" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>About WiseHaven</span>
          </div>
          <p className="font-body-sm text-body-sm leading-relaxed" style={{ color: "#808080" }}>
            WiseHaven is a smart, time-locked envelope budgeting prototype for Rwanda. Give Every Franc a Purpose.
          </p>
          <div className="flex items-center gap-3 pt-1 font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
            <span>v0.2.0-demo</span><span>·</span><span>Next.js 14 + FastAPI</span><span>·</span><span>Kigali, Rwanda</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
