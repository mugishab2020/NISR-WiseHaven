"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatRWF, parseRWF } from "@/lib/currency";
import { formatActivityDate } from "@/lib/dates";
import { validateVaultSettings } from "@/lib/validation";
import { Shield, ArrowDownRight, AlertCircle, Save, Check, Lock } from "lucide-react";

const SWEEP_PRESETS = [5, 10, 15, 20];

const INPUT: React.CSSProperties = {
  background: "#141414", color: "#ffffff",
  border: "1px solid #242424", borderRadius: "8px",
  fontFamily: "Inter, sans-serif", fontSize: "14px",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};
const focusOn  = (el: HTMLInputElement) => { el.style.borderColor = "#bef532"; el.style.boxShadow = "0 0 0 1px #bef532, 0 0 8px rgba(190,245,50,0.12)"; };
const focusOff = (el: HTMLInputElement) => { el.style.borderColor = "#242424"; el.style.boxShadow = "none"; };

const CARD: React.CSSProperties = { background: "#171717", border: "1px solid #242424", borderRadius: "12px" };

export default function VaultPage() {
  const { account, doUpdateVaultSettings, privacyMode } = useApp();
  const { vaultSettings } = account;

  const [sweep, setSweep]               = useState(vaultSettings.sweepPercentage);
  const [customSweep, setCustomSweep]   = useState("");
  const [showCustom, setShowCustom]     = useState(false);
  const [targetInput, setTargetInput]   = useState(formatRWF(vaultSettings.targetAmount));
  const [autoSweep, setAutoSweep]       = useState(vaultSettings.isAutoSweepEnabled);
  const [saveErrors, setSaveErrors]     = useState<Record<string, string>>({});
  const [saved, setSaved]               = useState(false);
  const [showUnlock, setShowUnlock]     = useState(false);

  const vaultBalance = account.vaultBalance;
  const goalAmount   = vaultSettings.targetAmount;
  const pctFunded    = goalAmount > 0 ? Math.min(100, Math.round((vaultBalance / goalAmount) * 100)) : 0;
  const toTarget     = Math.max(0, goalAmount - vaultBalance);
  const vaultTxs     = account.transactions.filter(
    (tx) => tx.type === "vault_sweep" || tx.type === "vault_withdrawal"
  );

  // SVG ring constants
  const RADIUS = 52;
  const CIRC   = 2 * Math.PI * RADIUS; // ≈ 326.7

  function handleSave() {
    const parsed = parseRWF(targetInput);
    const result = validateVaultSettings(sweep, isNaN(parsed) ? 0 : parsed);
    if (!result.valid) { setSaveErrors(result.errors); return; }
    doUpdateVaultSettings({ sweepPercentage: sweep, targetAmount: parsed, isAutoSweepEnabled: autoSweep });
    setSaveErrors({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-5 h-5 rounded flex items-center justify-center"
                style={{ background: "rgba(190,245,50,0.10)" }}
              >
                <Shield size={11} style={{ color: "#bef532" }} />
              </div>
              <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#808080" }}>
                Institutional Capital Shield
              </span>
            </div>
            <h1 className="font-geist font-semibold text-[28px] lg:text-[40px] text-white tracking-tight leading-none">
              Emergency Vault
            </h1>
            <p className="font-body-md text-body-md mt-1.5 max-w-lg" style={{ color: "#b5b5b5" }}>
              Build a financial buffer before life surprises you. Protected separately from spendable money.
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg self-start"
            style={{ background: "#171717", border: "1px solid #242424" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#bef532" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-medium" style={{ color: "#b5b5b5" }}>
              Non-Spendable
            </span>
          </div>
        </div>

        {/* ── Hero vault card ──────────────────────────────── */}
        <div
          className="relative overflow-hidden p-5 lg:p-7"
          style={{ background: "#000000", border: "1px solid #242424", borderRadius: "16px" }}
        >
          <div
            className="absolute -right-24 -bottom-24 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "rgba(190,245,50,0.04)", filter: "blur(80px)" }}
          />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Stats */}
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-label-sm text-label-sm font-semibold uppercase"
                  style={{ background: "rgba(190,245,50,0.08)", color: "#bef532" }}
                >
                  <Lock size={10} /> Shield Protected · Non-Spendable Buffer
                </span>
              </div>

              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                  Current Reserve Balance
                </span>
                <div className="mt-1">
                  <CurrencyDisplay amount={vaultBalance} size="xl" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="font-mono font-semibold" style={{ color: "#bef532" }}>{pctFunded}%</span>
                  <div className="flex items-center gap-2" style={{ color: "#808080" }}>
                    <span>Target:</span>
                    <span className="font-mono text-white">
                      {privacyMode ? "••••••" : formatRWF(goalAmount)} RWF
                    </span>
                  </div>
                </div>
                <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: "#242424" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pctFunded}%`, background: "#bef532" }}
                  />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                  <span>0 RWF</span>
                  <span style={{ color: "#bef532" }}>
                    {privacyMode ? "••••••" : formatRWF(toTarget)} RWF to target
                  </span>
                  <span>{privacyMode ? "••••••" : formatRWF(goalAmount)} RWF</span>
                </div>
              </div>

              {vaultTxs[0] && (
                <div className="flex items-center gap-2 font-body-sm text-body-sm" style={{ color: "#b5b5b5" }}>
                  <Check size={13} style={{ color: "#bef532" }} />
                  Latest:{" "}
                  <span className="font-mono font-semibold" style={{ color: "#ffffff" }}>
                    +{privacyMode ? "••••••" : formatRWF(vaultTxs[0].amount)} RWF
                  </span>{" "}
                  on {formatActivityDate(vaultTxs[0].timestamp).split(" •")[0]}
                </div>
              )}
            </div>

            {/* SVG radial gauge */}
            <div
              className="flex flex-col items-center gap-3 p-5 rounded-xl shrink-0"
              style={{ background: "#171717", border: "1px solid #242424", minWidth: "180px" }}
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={RADIUS} fill="transparent" stroke="#242424" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r={RADIUS}
                    fill="transparent"
                    stroke="#bef532"
                    strokeWidth="8"
                    strokeDasharray={CIRC}
                    strokeDashoffset={CIRC - (CIRC * pctFunded) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="font-mono font-bold text-[22px] leading-none"
                    style={{ color: "#bef532", fontFeatureSettings: '"tnum" 1' }}
                  >
                    {pctFunded}%
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider mt-1" style={{ color: "#808080" }}>
                    Secured
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="font-body-sm text-body-sm font-medium text-white flex items-center gap-1.5 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#bef532" }} />
                  Air-Gapped Vault
                </p>
                <p className="font-label-sm text-label-sm font-mono mt-0.5" style={{ color: "#808080" }}>
                  Kigali Node 01
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* LEFT — Settings (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">

            {/* First-sweep automation */}
            <div className="p-5 rounded-xl flex flex-col gap-4" style={CARD}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: "#bef532" }}>↻</span>
                    <h2 className="font-geist font-semibold text-[18px] text-white">First-Sweep Automation</h2>
                  </div>
                  <p className="font-body-sm text-body-sm" style={{ color: "#b5b5b5" }}>
                    On every deposit, WiseHaven sweeps your chosen percentage into the Emergency Vault automatically.
                  </p>
                </div>
                {/* Toggle */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0 select-none">
                  <input
                    type="checkbox"
                    checked={autoSweep}
                    onChange={(e) => setAutoSweep(e.target.checked)}
                    className="sr-only peer"
                    aria-label="Enable auto-sweep"
                  />
                  <div
                    className="w-12 h-6 rounded-full relative transition-colors"
                    style={{ background: autoSweep ? "#bef532" : "#2a2a2a", border: "1px solid #303030" }}
                  >
                    <span
                      className="absolute top-[2px] w-5 h-5 rounded-full transition-all"
                      style={{
                        background: autoSweep ? "#000000" : "#808080",
                        left: autoSweep ? "calc(100% - 22px)" : "2px",
                      }}
                    />
                  </div>
                </label>
              </div>

              {/* Sweep presets */}
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                  Auto-Sweep Rate
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {SWEEP_PRESETS.map((p) => {
                    const sel = sweep === p && !showCustom;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => { setSweep(p); setShowCustom(false); }}
                        className="py-2.5 px-3 rounded-lg font-label-md text-label-md font-semibold font-mono transition-all"
                        style={{
                          background: sel ? "rgba(190,245,50,0.10)" : "#202020",
                          color: sel ? "#bef532" : "#b5b5b5",
                          border: `1px solid ${sel ? "#bef532" : "#303030"}`,
                        }}
                      >
                        {p}%
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustom(!showCustom)}
                    className="px-3 py-2 rounded-lg font-label-md text-label-md font-medium transition-all"
                    style={{
                      background: showCustom ? "rgba(190,245,50,0.10)" : "#202020",
                      color: showCustom ? "#bef532" : "#808080",
                      border: `1px solid ${showCustom ? "#bef532" : "#303030"}`,
                    }}
                  >
                    Custom %
                  </button>
                  {showCustom && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min={1} max={50}
                        value={customSweep}
                        onChange={(e) => { setCustomSweep(e.target.value); const n = parseInt(e.target.value); if (!isNaN(n)) setSweep(n); }}
                        style={{ ...INPUT, width: "80px", height: "36px", padding: "0 12px", fontFamily: "JetBrains Mono, monospace" }}
                        placeholder="1-50"
                        onFocus={(e) => focusOn(e.currentTarget)}
                        onBlur={(e)  => focusOff(e.currentTarget)}
                      />
                      <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>%</span>
                    </div>
                  )}
                </div>
                {saveErrors.sweepPercentage && (
                  <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>
                    <AlertCircle size={12} /> {saveErrors.sweepPercentage}
                  </p>
                )}
              </div>

              {/* Preview bar */}
              <div className="p-3 rounded-lg flex flex-col gap-2" style={{ background: "#0d0d0d" }}>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold" style={{ color: "#bef532" }}>
                  On Next Deposit Preview
                </span>
                <div className="w-full h-[4px] rounded-full flex gap-[2px] overflow-hidden" style={{ background: "#242424" }}>
                  <div
                    className="h-full rounded-l-full transition-all duration-300"
                    style={{ width: `${sweep}%`, background: "#bef532" }}
                  />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                  <span style={{ color: "#bef532" }}>Vault ({sweep}%)</span>
                  <span>Allocatable ({100 - sweep}%)</span>
                </div>
              </div>

              {/* Target goal */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="vault-target" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                    Target Reserve Goal
                  </label>
                  <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>3 months income recommended</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      id="vault-target"
                      type="text" inputMode="numeric"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      style={{ ...INPUT, width: "100%", height: "48px", padding: "0 56px 0 16px", fontFamily: "JetBrains Mono, monospace", fontSize: "18px", fontWeight: "600" }}
                      onFocus={(e) => focusOn(e.currentTarget)}
                      onBlur={(e)  => focusOff(e.currentTarget)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-md text-label-md font-mono pointer-events-none" style={{ color: "#808080" }}>
                      RWF
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-3 rounded-lg font-body-sm text-body-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-opacity hover:opacity-90"
                    style={{ background: "#bef532", color: "#000000" }}
                  >
                    {saved ? <Check size={15} /> : <Save size={15} />}
                    {saved ? "Saved!" : "Save"}
                  </button>
                </div>
                {saveErrors.targetAmount && (
                  <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>
                    <AlertCircle size={12} /> {saveErrors.targetAmount}
                  </p>
                )}
              </div>
            </div>

            {/* Access policy */}
            <div className="p-5 rounded-xl flex flex-col gap-4" style={CARD}>
              <div className="flex items-center justify-between">
                <h3 className="font-geist font-semibold text-[16px] text-white">Restricted Access Policy</h3>
                <span
                  className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-mono"
                  style={{ background: "#202020", color: "#808080", border: "1px solid #303030" }}
                >
                  Locked Reserve
                </span>
              </div>
              <div className="p-3 rounded-lg flex items-start gap-3" style={{ background: "#0d0d0d" }}>
                <Shield size={16} style={{ color: "#bef532" }} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-body-md text-body-md text-white font-medium">Non-Spendable Capital Protection</p>
                  <p className="font-body-sm text-body-sm mt-1" style={{ color: "#b5b5b5" }}>
                    Emergency Vault funds are reserved strictly for genuine unexpected events. Funds require a two-step confirmation to unlock.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Casual Access", value: "Prohibited", icon: Lock, dim: true },
                  { label: "Unlock Method", value: "Dual Confirm", icon: Shield, dim: false },
                ].map(({ label, value, icon: Icon, dim }) => (
                  <div key={label} className="p-3 rounded-lg flex items-center gap-3" style={{ background: "#0d0d0d" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#202020" }}>
                      <Icon size={14} style={{ color: dim ? "#808080" : "#bef532" }} />
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>{label}</p>
                      <p className="font-body-sm text-body-sm text-white font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowUnlock(true)}
                className="w-full py-3 rounded-lg font-body-sm text-body-sm font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ background: "rgba(255,68,68,0.08)", color: "#ff6b6b", border: "1px solid rgba(255,68,68,0.20)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,68,68,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,68,68,0.08)"; }}
              >
                <AlertCircle size={15} /> Emergency Unlock Protocol
              </button>
            </div>
          </div>

          {/* RIGHT — History (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-4 rounded-xl flex flex-col gap-4" style={CARD}>
              <div className="flex items-center justify-between">
                <h3 className="font-geist font-semibold text-[16px] text-white">Contribution History</h3>
                <span className="font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                  {vaultTxs.length} records
                </span>
              </div>
              {vaultTxs.length === 0 ? (
                <p className="font-body-sm text-body-sm text-center py-4" style={{ color: "#808080" }}>
                  No vault contributions yet.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {vaultTxs.map((tx, i) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-lg flex items-center justify-between gap-3 transition-colors"
                      style={{
                        background: "#0d0d0d",
                        borderBottom: i < vaultTxs.length - 1 ? "1px solid #1a1a1a" : "none",
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "rgba(190,245,50,0.08)" }}
                        >
                          <ArrowDownRight size={14} style={{ color: "#bef532" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-body-sm text-body-sm text-white font-medium truncate">{tx.description}</p>
                          <p className="font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                            {formatActivityDate(tx.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span
                          className="font-mono font-semibold text-[13px]"
                          style={{ color: "#bef532", fontFeatureSettings: '"tnum" 1' }}
                        >
                          +{privacyMode ? "••••••" : formatRWF(tx.amount)}
                        </span>
                        <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>RWF</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick insight */}
            <div className="p-4 rounded-xl flex flex-col gap-3" style={CARD}>
              <h3 className="font-geist font-semibold text-[16px] text-white">Insight</h3>
              <div className="p-3 rounded-lg" style={{ background: "#0d0d0d" }}>
                <p className="font-body-md text-body-md text-white leading-relaxed">
                  At <span className="font-mono" style={{ color: "#bef532" }}>{sweep}%</span> sweep rate,
                  you need{" "}
                  {pctFunded >= 100 ? (
                    <span style={{ color: "#bef532" }}>your target reached! 🎉</span>
                  ) : (
                    <>
                      <span className="font-mono" style={{ color: "#bef532" }}>
                        {privacyMode ? "••••••" : formatRWF(toTarget)} RWF
                      </span>{" "}
                      more to hit your{" "}
                      <span className="font-mono" style={{ color: "#ffffff" }}>
                        {privacyMode ? "••••••" : formatRWF(goalAmount)} RWF
                      </span>{" "}
                      safety target.
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2.5 rounded-lg font-body-sm text-body-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: "#bef532", color: "#000000" }}
              >
                <Save size={14} /> Save Vault Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showUnlock}
        title="Emergency Unlock Protocol"
        description="This would initiate a two-step verification to unlock Emergency Vault funds. This is a demo prototype — no real funds exist."
        confirmLabel="Acknowledge (Demo)"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => setShowUnlock(false)}
        onCancel={() => setShowUnlock(false)}
      />
    </AppShell>
  );
}
