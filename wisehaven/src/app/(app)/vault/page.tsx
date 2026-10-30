"use client";

import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import { formatRWF } from "@/lib/currency";
import { Shield, ArrowDownRight, Lock } from "lucide-react";

const CARD: React.CSSProperties = { background: "#171717", border: "1px solid #242424", borderRadius: "12px" };

const VAULT_GOAL = 100_000; // default demo goal in RWF

export default function VaultPage() {
  const { state, privacyMode } = useApp();
  const { vaultBalance, vaultEnvelope, transactions } = state;

  const pctFunded    = VAULT_GOAL > 0 ? Math.min(100, Math.round((vaultBalance / VAULT_GOAL) * 100)) : 0;
  const toTarget     = Math.max(0, VAULT_GOAL - vaultBalance);
  const CIRC         = 2 * Math.PI * 52;

  // Vault-related transactions
  const vaultTxs = transactions.filter(
    (tx) => tx.envelope_id === vaultEnvelope?.id
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(190,245,50,0.10)" }}>
                <Shield size={11} style={{ color: "#bef532" }} />
              </div>
              <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#808080" }}>
                Emergency Reserve
              </span>
            </div>
            <h1 className="font-geist font-semibold text-[28px] lg:text-[40px] text-white tracking-tight leading-none">
              Emergency Vault
            </h1>
            <p className="font-body-md text-body-md mt-1.5 max-w-lg" style={{ color: "#b5b5b5" }}>
              Build a financial buffer before life surprises you. Demo money — non-spendable reserve.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg self-start"
            style={{ background: "#171717", border: "1px solid #242424" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#bef532" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-medium" style={{ color: "#b5b5b5" }}>
              Demo Reserve
            </span>
          </div>
        </div>

        {/* Hero card */}
        <div className="relative overflow-hidden p-5 lg:p-7"
          style={{ background: "#000000", border: "1px solid #242424", borderRadius: "16px" }}>
          <div className="absolute -right-24 -bottom-24 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "rgba(190,245,50,0.04)", filter: "blur(80px)" }} />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Stats */}
            <div className="flex flex-col gap-4 flex-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-label-sm text-label-sm font-semibold uppercase self-start"
                style={{ background: "rgba(190,245,50,0.08)", color: "#bef532" }}>
                <Lock size={10} /> Shield Protected · Non-Spendable Demo Buffer
              </span>
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                  Current Demo Reserve Balance
                </span>
                <div className="mt-1"><CurrencyDisplay amount={vaultBalance} size="xl" /></div>
              </div>

              {/* Progress */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="font-mono font-semibold" style={{ color: "#bef532" }}>{pctFunded}%</span>
                  <div className="flex items-center gap-2" style={{ color: "#808080" }}>
                    <span>Goal:</span>
                    <span className="font-mono text-white">{privacyMode ? "••••••" : formatRWF(VAULT_GOAL)} RWF</span>
                  </div>
                </div>
                <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: "#242424" }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pctFunded}%`, background: "#bef532" }} />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                  <span>0 RWF</span>
                  <span style={{ color: "#bef532" }}>{privacyMode ? "••••••" : formatRWF(toTarget)} RWF to goal</span>
                  <span>{privacyMode ? "••••••" : formatRWF(VAULT_GOAL)} RWF</span>
                </div>
              </div>
            </div>

            {/* Radial gauge */}
            <div className="flex flex-col items-center gap-3 p-5 rounded-xl shrink-0"
              style={{ background: "#171717", border: "1px solid #242424", minWidth: "180px" }}>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="transparent" stroke="#242424" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="transparent" stroke="#bef532" strokeWidth="8"
                    strokeDasharray={CIRC} strokeDashoffset={CIRC - (CIRC * pctFunded) / 100}
                    strokeLinecap="round" className="transition-all duration-700" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono font-bold text-[22px] leading-none" style={{ color: "#bef532" }}>{pctFunded}%</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider mt-1" style={{ color: "#808080" }}>Secured</span>
                </div>
              </div>
              <div className="text-center">
                <p className="font-body-sm text-body-sm font-medium text-white flex items-center gap-1.5 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#bef532" }} />Demo Vault
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contribution history + info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Access policy */}
            <div className="p-5 rounded-xl flex flex-col gap-4" style={CARD}>
              <h3 className="font-geist font-semibold text-[16px] text-white">Vault Policy</h3>
              <div className="p-3 rounded-lg flex items-start gap-3" style={{ background: "#0d0d0d" }}>
                <Shield size={16} style={{ color: "#bef532" }} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-body-md text-body-md text-white font-medium">Non-Spendable Demo Reserve</p>
                  <p className="font-body-sm text-body-sm mt-1" style={{ color: "#b5b5b5" }}>
                    Emergency Vault funds are the first-sweep allocation from each demo deposit (5% default).
                    In a production system, these would require a two-step confirmation to unlock.
                    In this demo, they are separate from your spendable envelope balances.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Casual Spending", value: "Not allowed" },
                  { label: "First-Sweep Rate", value: "5% default"  },
                  { label: "Balance Source",   value: "Auto-sweep"  },
                  { label: "Environment",      value: "Demo only"   },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-lg" style={{ background: "#0d0d0d" }}>
                    <p className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>{label}</p>
                    <p className="font-body-sm text-body-sm text-white font-medium mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Contribution history */}
            <div className="p-4 rounded-xl flex flex-col gap-4" style={CARD}>
              <div className="flex items-center justify-between">
                <h3 className="font-geist font-semibold text-[16px] text-white">Contribution History</h3>
                <span className="font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>{vaultTxs.length} records</span>
              </div>
              {vaultTxs.length === 0 ? (
                <p className="font-body-sm text-body-sm text-center py-4" style={{ color: "#808080" }}>
                  No vault contributions yet. Add demo money to start.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {vaultTxs.map((tx, i) => (
                    <div key={tx.id} className="p-3 rounded-lg flex items-center justify-between gap-3"
                      style={{ background: "#0d0d0d", borderBottom: i < vaultTxs.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(190,245,50,0.08)" }}>
                          <ArrowDownRight size={14} style={{ color: "#bef532" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-body-sm text-body-sm text-white font-medium truncate">{tx.description}</p>
                          <p className="font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-mono font-semibold text-[13px]" style={{ color: "#bef532" }}>
                          +{privacyMode ? "••••••" : formatRWF(Number(tx.amount))}
                        </span>
                        <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>RWF</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
