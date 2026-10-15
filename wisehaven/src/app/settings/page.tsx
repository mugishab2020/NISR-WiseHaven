"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatRWF } from "@/lib/currency";
import { Settings, Shield, Eye, EyeOff, RefreshCw, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const { account, privacyMode, togglePrivacyMode, doReset } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  function handleReset() {
    doReset();
    setShowResetConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-6 max-w-2xl">
        {/* Header */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-1">
            <Settings size={14} className="text-outline" />
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
              Preferences
            </span>
          </div>
          <h1 className="font-geist font-semibold text-headline-xl-mobile text-primary tracking-tight">
            Settings
          </h1>
        </div>

        {/* Demo disclaimer */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex items-start gap-3">
          <AlertTriangle size={16} className="text-outline shrink-0 mt-0.5" />
          <div>
            <p className="font-body-md text-body-md text-on-surface font-medium">
              Demo Mode — Prototype Only
            </p>
            <p className="font-body-sm text-body-sm text-outline mt-1">
              WiseHaven is a simulated prototype. All money figures are demo
              data. No real deposits, withdrawals, or payments are made. Demo
              state is saved in your browser&apos;s localStorage only.
            </p>
          </div>
        </div>

        {/* Display settings */}
        <div className="rounded-xl bg-surface-container-low border border-surface-container overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-container">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Display
            </span>
          </div>
          <div className="divide-y divide-surface-container">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                {privacyMode ? (
                  <EyeOff size={18} className="text-on-surface-variant" />
                ) : (
                  <Eye size={18} className="text-on-surface-variant" />
                )}
                <div>
                  <p className="font-body-md text-body-md text-primary font-medium">
                    Privacy Mode
                  </p>
                  <p className="font-body-sm text-body-sm text-outline">
                    Hide financial figures from display
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyMode}
                  onChange={togglePrivacyMode}
                  className="sr-only peer"
                  aria-label="Toggle privacy mode"
                />
                <div className="w-12 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-surface peer-checked:bg-primary-container after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
          </div>
        </div>

        {/* Vault settings summary */}
        <div className="rounded-xl bg-surface-container-low border border-surface-container overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-container">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Emergency Vault
            </span>
          </div>
          <div className="divide-y divide-surface-container">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-body-sm text-body-sm text-outline">Auto-Sweep</span>
              <span className={`font-label-sm text-label-sm font-semibold ${account.vaultSettings.isAutoSweepEnabled ? "text-primary-fixed" : "text-outline"}`}>
                {account.vaultSettings.isAutoSweepEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-body-sm text-body-sm text-outline">Sweep Percentage</span>
              <span className="font-label-sm text-label-sm font-semibold text-primary font-mono">
                {account.vaultSettings.sweepPercentage}%
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-body-sm text-body-sm text-outline">Target Goal</span>
              <span className="font-label-sm text-label-sm font-semibold text-primary font-mono">
                {formatRWF(account.vaultSettings.targetAmount)} RWF
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-body-sm text-body-sm text-outline">Current Balance</span>
              <span className="font-label-sm text-label-sm font-semibold text-primary-fixed font-mono">
                {formatRWF(account.vaultBalance)} RWF
              </span>
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="rounded-xl bg-surface-container-low border border-surface-container overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-container">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Demo Account
            </span>
          </div>
          <div className="divide-y divide-surface-container">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-body-sm text-body-sm text-outline">Total Funds</span>
              <span className="font-label-sm text-label-sm font-semibold text-primary font-mono">
                {formatRWF(account.totalFunds)} RWF
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-body-sm text-body-sm text-outline">Envelopes</span>
              <span className="font-label-sm text-label-sm text-primary font-mono">
                {account.envelopes.length} total
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-body-sm text-body-sm text-outline">Transactions</span>
              <span className="font-label-sm text-label-sm text-primary font-mono">
                {account.transactions.length} records
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-body-sm text-body-sm text-outline">Persistence</span>
              <span className="font-label-sm text-label-sm text-outline">Browser localStorage</span>
            </div>
          </div>
        </div>

        {/* Reset demo */}
        <div className="rounded-xl bg-error-container/10 border border-error/20 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="text-error" />
            <h3 className="font-body-md text-body-md font-semibold text-error">
              Reset Demo Data
            </h3>
          </div>
          <p className="font-body-sm text-body-sm text-outline">
            This will wipe all demo state (envelopes, transactions, vault
            balance) and restore the original sample data. This action cannot be
            undone.
          </p>
          {resetDone && (
            <p className="font-body-sm text-body-sm text-primary-fixed font-semibold">
              ✓ Demo data has been reset to defaults.
            </p>
          )}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="self-start px-4 py-2.5 rounded bg-error-container/20 text-error font-body-md text-body-md font-semibold hover:bg-error-container/30 border border-error/20 transition-all flex items-center gap-2"
          >
            <RefreshCw size={15} />
            Reset Demo Data
          </button>
        </div>

        {/* About */}
        <div className="rounded-xl bg-surface-container-lowest border border-surface-container p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-outline" />
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">About WiseHaven</span>
          </div>
          <p className="font-body-sm text-body-sm text-outline leading-relaxed">
            WiseHaven is a smart, time-locked envelope budgeting prototype for Rwanda.
            Give Every Franc a Purpose.
          </p>
          <div className="flex items-center gap-3 pt-1 font-label-sm text-label-sm text-outline font-mono">
            <span>v0.1.0-demo</span>
            <span>•</span>
            <span>Next.js 14 + TypeScript</span>
            <span>•</span>
            <span>Kigali, Rwanda</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Demo Data?"
        description="All envelopes, transactions, and vault history will be wiped and replaced with the original sample data. This cannot be undone."
        confirmLabel="Reset Everything"
        cancelLabel="Keep My Data"
        variant="destructive"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </AppShell>
  );
}
