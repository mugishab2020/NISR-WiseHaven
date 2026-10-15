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

export default function VaultPage() {
  const { account, doUpdateVaultSettings, privacyMode } = useApp();
  const { vaultSettings } = account;

  const [sweep, setSweep] = useState(vaultSettings.sweepPercentage);
  const [customSweep, setCustomSweep] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [targetInput, setTargetInput] = useState(formatRWF(vaultSettings.targetAmount));
  const [autoSweep, setAutoSweep] = useState(vaultSettings.isAutoSweepEnabled);
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);

  const vaultBalance = account.vaultBalance;
  const goalAmount = vaultSettings.targetAmount;
  const pctFunded = goalAmount > 0 ? Math.min(100, Math.round((vaultBalance / goalAmount) * 100)) : 0;
  const toTarget = Math.max(0, goalAmount - vaultBalance);

  const vaultTxs = account.transactions.filter(
    (tx) => tx.type === "vault_sweep" || tx.type === "vault_withdrawal"
  );

  function handleSaveSettings() {
    const parsedTarget = parseRWF(targetInput);
    const result = validateVaultSettings(sweep, isNaN(parsedTarget) ? 0 : parsedTarget);
    if (!result.valid) {
      setSaveErrors(result.errors);
      return;
    }
    doUpdateVaultSettings({
      sweepPercentage: sweep,
      targetAmount: parsedTarget,
      isAutoSweepEnabled: autoSweep,
    });
    setSaveErrors({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-primary-container/15 flex items-center justify-center text-primary-fixed">
                <Shield size={12} />
              </div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Institutional Capital Shield
              </span>
            </div>
            <h1 className="font-geist font-semibold text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
              Emergency Vault
            </h1>
            <p className="font-body-md text-body-md text-secondary max-w-xl mt-1">
              Build a financial buffer before life surprises you. Protected
              separately from spendable money.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-container self-start">
            <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">
              Active Non-Spendable
            </span>
          </div>
        </div>

        {/* Hero vault status card */}
        <div className="relative w-full rounded-xl bg-surface-container-low border border-surface-container p-5 lg:p-7 overflow-hidden shadow-xl">
          <div className="absolute -right-12 -bottom-12 w-72 h-72 rounded-full bg-primary-fixed/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Stats */}
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary-container/10 text-primary-fixed font-label-sm text-label-sm font-semibold uppercase">
                  <Lock size={10} /> Shield Protected | Non-Spendable Buffer
                </span>
                <span className="font-label-sm text-label-sm text-outline font-mono uppercase">
                  Acc: #EV-7089-KGL
                </span>
              </div>

              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  Current Reserve Balance
                </span>
                <div className="mt-1">
                  <CurrencyDisplay amount={vaultBalance} size="xl" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-primary-fixed font-semibold font-mono">{pctFunded}%</span>
                  <span className="text-secondary">of target goal reached</span>
                  <div className="flex items-center gap-1 text-outline">
                    <span>Target:</span>
                    <span className="font-mono text-on-surface font-medium">
                      {privacyMode ? "••••••" : formatRWF(goalAmount)} RWF
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 rounded bg-surface-container-highest overflow-hidden flex">
                  <div
                    className="h-full bg-primary-fixed transition-all duration-1000 ease-out"
                    style={{ width: `${pctFunded}%` }}
                  />
                  <div className="h-full bg-surface-variant flex-1" />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm text-outline">
                  <span>0 RWF</span>
                  <span className="text-primary-fixed font-mono font-medium">
                    {privacyMode ? "••••••" : formatRWF(toTarget)} RWF to target
                  </span>
                  <span>{privacyMode ? "••••••" : formatRWF(goalAmount)} RWF</span>
                </div>
              </div>

              {vaultTxs[0] && (
                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                  <Check size={14} className="text-primary-fixed" />
                  <span>
                    Latest contribution:{" "}
                    <strong className="text-on-surface font-mono">
                      +{privacyMode ? "••••••" : formatRWF(vaultTxs[0].amount)} RWF
                    </strong>{" "}
                    on {formatActivityDate(vaultTxs[0].timestamp).split(" •")[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Circular gauge */}
            <div className="flex flex-col items-center gap-3 p-4 rounded bg-surface-container min-w-[200px]">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    className="text-surface-container-high"
                    cx="60" cy="60" r="48"
                    fill="transparent" stroke="currentColor" strokeWidth="8"
                  />
                  <circle
                    className="text-primary-fixed transition-all duration-700"
                    cx="60" cy="60" r="48"
                    fill="transparent" stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="301.59"
                    strokeDashoffset={301.59 - (301.59 * pctFunded) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono font-bold text-headline-md text-primary leading-none">
                    {pctFunded}%
                  </span>
                  <span className="font-label-sm text-label-sm text-outline mt-1 uppercase tracking-wider font-mono">
                    Secured
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="font-body-sm text-body-sm text-primary font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-fixed" />
                  Air-Gapped Vault Pool
                </p>
                <p className="font-label-sm text-label-sm text-outline font-mono mt-1">
                  Kigali Settlement Node 01
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Settings */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* First-sweep automation */}
            <div className="rounded-xl bg-surface-container-low border border-surface-container p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary-fixed">↻</span>
                    <h2 className="font-geist font-semibold text-headline-sm text-primary">
                      First-Sweep Automation
                    </h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary">
                    On every deposit, WiseHaven automatically sweeps your chosen
                    percentage into the Emergency Vault.
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
                  <div className="w-12 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-surface peer-checked:bg-primary-container after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>

              {/* Sweep % selector */}
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                  Automatic Allocation Rate
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {SWEEP_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setSweep(p); setShowCustom(false); }}
                      className={`py-2.5 px-3 rounded font-label-md text-label-md font-semibold font-mono transition-all ${sweep === p && !showCustom ? "bg-surface-container-high text-primary-fixed outline outline-[1.5px] outline-primary-fixed" : "bg-surface-container hover:bg-surface-container-high text-on-surface"}`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustom(!showCustom)}
                    className={`px-3 py-2 rounded font-label-md text-label-md font-medium transition-all ${showCustom ? "bg-surface-container-high text-primary-fixed outline outline-[1.5px] outline-primary-fixed" : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"}`}
                  >
                    Custom %
                  </button>
                  {showCustom && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={customSweep}
                        onChange={(e) => {
                          setCustomSweep(e.target.value);
                          const n = parseInt(e.target.value);
                          if (!isNaN(n)) setSweep(n);
                        }}
                        className="w-20 h-9 px-3 rounded bg-surface-container text-on-surface font-mono text-body-md border border-surface-container-high focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed"
                        placeholder="1-50"
                        aria-label="Custom sweep percentage"
                      />
                      <span className="font-label-sm text-label-sm text-outline">%</span>
                    </div>
                  )}
                </div>

                {saveErrors.sweepPercentage && (
                  <p className="flex items-center gap-1 font-body-sm text-body-sm text-error" role="alert">
                    <AlertCircle size={12} /> {saveErrors.sweepPercentage}
                  </p>
                )}
              </div>

              {/* Simulation preview */}
              <div className="rounded bg-surface-container p-3 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-primary-fixed mb-1">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    On Next Deposit Preview
                  </span>
                </div>
                <div className="h-2 w-full rounded bg-surface-container-highest flex overflow-hidden">
                  <div className="bg-primary-fixed h-full transition-all duration-300" style={{ width: `${sweep}%` }} />
                  <div className="bg-surface-bright h-full flex-1" />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm font-mono text-outline">
                  <span className="text-primary-fixed">Vault Sweep ({sweep}%)</span>
                  <span>Spendable ({100 - sweep}%)</span>
                </div>
              </div>

              {/* Target */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="vault-target" className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                    Target Reserve Goal
                  </label>
                  <span className="font-label-sm text-label-sm text-outline">3 months income recommended</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      id="vault-target"
                      type="text"
                      inputMode="numeric"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      className={`w-full h-12 px-4 pr-14 rounded bg-surface-container text-primary font-mono text-headline-sm font-semibold border focus:outline-none focus:ring-1 transition-all ${saveErrors.targetAmount ? "border-error focus:ring-error" : "border-surface-container-high focus:border-primary-fixed focus:ring-primary-fixed"}`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-md text-label-md font-mono text-outline pointer-events-none">
                      RWF
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-4 py-3 rounded bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {saved ? <Check size={16} /> : <Save size={16} />}
                    {saved ? "Saved!" : "Save Settings"}
                  </button>
                </div>
                {saveErrors.targetAmount && (
                  <p className="flex items-center gap-1 font-body-sm text-body-sm text-error" role="alert">
                    <AlertCircle size={12} /> {saveErrors.targetAmount}
                  </p>
                )}
              </div>
            </div>

            {/* Access Policy */}
            <div className="rounded-xl bg-surface-container-low border border-surface-container p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-geist font-semibold text-headline-sm text-primary">
                  Restricted Access Policy
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-outline font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                  Locked Reserve
                </span>
              </div>
              <div className="p-3 rounded bg-surface-container flex items-start gap-3">
                <Shield size={18} className="text-primary-fixed mt-0.5 shrink-0" />
                <div>
                  <p className="font-body-md text-body-md text-on-surface font-medium">
                    Non-Spendable Capital Protection
                  </p>
                  <p className="font-body-sm text-body-sm text-secondary mt-1">
                    Emergency Vault funds are reserved strictly for genuine
                    unexpected events. Funds require a two-step confirmation to unlock.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded bg-surface-container flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-outline">
                    <Lock size={14} />
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Casual Access</p>
                    <p className="font-body-sm text-body-sm text-primary font-medium">Prohibited</p>
                  </div>
                </div>
                <div className="p-3 rounded bg-surface-container flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary-fixed">
                    <Shield size={14} />
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Unlock</p>
                    <p className="font-body-sm text-body-sm text-primary font-medium">Dual Confirm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: History + Insights */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Contribution history */}
            <div className="rounded-xl bg-surface-container-low border border-surface-container p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-geist font-semibold text-headline-sm text-primary">
                  Contribution History
                </h3>
                <span className="font-label-sm text-label-sm text-outline font-mono">
                  {vaultTxs.length} Records
                </span>
              </div>
              {vaultTxs.length === 0 ? (
                <p className="font-body-sm text-body-sm text-outline text-center py-4">
                  No vault contributions yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {vaultTxs.map((tx) => (
                    <div key={tx.id} className="p-3 rounded bg-surface-container flex items-center justify-between gap-3 hover:bg-surface-container-high transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded bg-primary-container/10 flex items-center justify-center text-primary-fixed shrink-0">
                          <ArrowDownRight size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-body-md text-body-md text-primary font-medium truncate">
                            {tx.description}
                          </p>
                          <p className="font-body-sm text-body-sm text-outline font-mono">
                            {formatActivityDate(tx.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-headline-sm text-headline-sm font-mono text-primary-fixed font-semibold">
                          +{privacyMode ? "••••••" : formatRWF(tx.amount)}
                        </span>
                        <span className="font-label-sm text-label-sm text-outline font-mono">RWF</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick insights */}
            <div className="rounded-xl bg-surface-container-low border border-surface-container p-5 flex flex-col gap-4">
              <h3 className="font-geist font-semibold text-headline-sm text-primary">Quick Insights</h3>
              <div className="p-3 rounded bg-surface-container flex flex-col gap-3">
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  At your current sweep rate of{" "}
                  <strong className="font-mono text-primary">{sweep}% / deposit</strong>, you{" "}
                  {pctFunded >= 100 ? (
                    <span className="text-primary-fixed font-semibold">have reached your target!</span>
                  ) : (
                    <>
                      need{" "}
                      <strong className="font-mono text-primary">
                        {privacyMode ? "••••••" : formatRWF(toTarget)} RWF
                      </strong>{" "}
                      more to hit your{" "}
                      <strong className="font-mono text-primary">
                        {privacyMode ? "••••••" : formatRWF(goalAmount)} RWF
                      </strong>{" "}
                      safety target.
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="w-full py-3 px-4 rounded bg-surface-container hover:bg-surface-container-high text-primary font-body-md text-body-md font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Vault Settings
                </button>

                <button
                  type="button"
                  onClick={() => setShowUnlockConfirm(true)}
                  className="w-full py-3 px-4 rounded bg-error-container/20 text-error hover:bg-error-container/30 font-body-md text-body-md font-semibold transition-all flex items-center justify-center gap-2 border border-error/20"
                >
                  <AlertCircle size={16} />
                  Emergency Unlock Protocol
                </button>
                <p className="font-label-sm text-label-sm text-center text-outline">
                  Requires 2-step confirmation (demo only)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency unlock dialog */}
      <ConfirmDialog
        isOpen={showUnlockConfirm}
        title="Emergency Unlock Protocol"
        description="This would initiate a two-step verification to unlock Emergency Vault funds. This is a demo prototype — no real funds exist."
        confirmLabel="Acknowledge (Demo)"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => setShowUnlockConfirm(false)}
        onCancel={() => setShowUnlockConfirm(false)}
      />
    </AppShell>
  );
}
