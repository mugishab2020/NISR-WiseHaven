"use client";

import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import Link from "next/link";
import { formatRWF } from "@/lib/currency";
import {
  Lock, Wallet, Shield, ArrowDownRight, Plus,
  ArrowRight, Zap, Home, ShoppingBasket, School,
  TrendingUp, Eye, EyeOff, ArrowDownToLine,
} from "lucide-react";

// ── Style helpers ──────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: "#171717",
  border: "1px solid #242424",
  borderRadius: "12px",
};

// ── Envelope icon map ────────────────────────────────────
function EnvIcon({ category, size = 16 }: { category: string; size?: number }) {
  const map: Record<string, typeof Lock> = {
    Rent: Home, Food: ShoppingBasket, Utilities: Zap, Education: School,
  };
  const Icon = map[category] ?? Lock;
  return <Icon size={size} />;
}

// ── Tx icon ──────────────────────────────────────────────
function TxIcon({ type }: { type: string }) {
  if (type === "MANUAL_DEPOSIT") return <ArrowDownRight size={15} style={{ color: "#bef532" }} />;
  if (type === "FIRST_SWEEP")    return <Shield size={15} style={{ color: "#b5b5b5" }} />;
  return <Lock size={15} style={{ color: "#808080" }} />;
}

function txDirection(type: string): "in" | "out" | "neutral" {
  if (type === "MANUAL_DEPOSIT" || type === "CREDIT" || type === "FIRST_SWEEP") return "in";
  if (type === "DEBIT") return "out";
  return "neutral";
}

function formatCountdownFromISO(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Matured";
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d`;
  const hrs = Math.floor(diff / 3600000);
  return hrs > 0 ? `${hrs}h` : "< 1h";
}

export default function DashboardPage() {
  const { state, privacyMode, togglePrivacyMode } = useApp();
  const { wallet, envelopes, transactions, vaultBalance, availableBalance } = state;

  const totalFunds = wallet ? Number(wallet.balance) + envelopes.reduce((s, e) => s + Number(e.balance), 0) : 0;
  const activeEnvelopes = envelopes.filter((e) => e.is_active && !e.is_emergency_vault);
  const lockedTotal = activeEnvelopes
    .filter((e) => e.temporal_lock?.status === "LOCKED")
    .reduce((s, e) => s + Number(e.balance), 0);

  const lockedPct  = totalFunds > 0 ? Math.round((lockedTotal / totalFunds) * 100) : 0;
  const availPct   = totalFunds > 0 ? Math.round((availableBalance / totalFunds) * 100) : 0;
  const vaultPct   = totalFunds > 0 ? Math.round((vaultBalance / totalFunds) * 100) : 0;

  const upcomingEnvelopes = [...activeEnvelopes]
    .filter((e) => e.temporal_lock)
    .sort((a, b) =>
      new Date(a.temporal_lock!.maturity_timestamp).getTime() -
      new Date(b.temporal_lock!.maturity_timestamp).getTime()
    )
    .slice(0, 4);

  const recentTxs = transactions.slice(0, 5);
  const vaultGoal = 100000; // default target; could come from user profile
  const vaultPctOfGoal = vaultGoal > 0 ? Math.min(100, Math.round((vaultBalance / vaultGoal) * 100)) : 0;

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6">

        {/* ── Greeting ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#bef532", boxShadow: "0 0 6px rgba(190,245,50,0.7)" }} />
              <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#808080" }}>
                Demo Wallet · Kigali
              </span>
            </div>
            <h1 className="font-geist font-semibold text-headline-lg-mobile lg:text-headline-lg text-white tracking-tight">
              Welcome to WiseHaven
            </h1>
            <p className="font-body-md text-body-md mt-0.5" style={{ color: "#b5b5b5" }}>
              Every franc has a purpose. Here&apos;s your current standing.
            </p>
          </div>
          <button
            onClick={togglePrivacyMode}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-label-sm text-label-sm self-start md:self-auto transition-colors"
            style={{ background: "#171717", color: "#808080", border: "1px solid #242424" }}
          >
            {privacyMode ? <EyeOff size={14} /> : <Eye size={14} />}
            {privacyMode ? "Show figures" : "Hide figures"}
          </button>
        </div>

        {/* ── Hero financial card ──────────────────────── */}
        <div className="relative overflow-hidden p-5 sm:p-7" style={{ background: "#000000", border: "1px solid #242424", borderRadius: "16px" }}>
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(190,245,50,0.04)", filter: "blur(80px)" }} />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-[0.12em] font-semibold" style={{ color: "#808080" }}>Total Demo Funds</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold" style={{ background: "rgba(190,245,50,0.10)", color: "#bef532" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#bef532" }} />DEMO
                  </span>
                </div>
                <CurrencyDisplay amount={totalFunds} size="xl" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link href="/deposit" className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-body-sm text-body-sm font-medium transition-colors" style={{ background: "#171717", color: "#b5b5b5", border: "1px solid #303030" }}>
                  <ArrowDownToLine size={14} style={{ color: "#bef532" }} />Add Demo Money
                </Link>
                <Link href="/envelopes/new" className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-body-sm text-body-sm font-semibold transition-opacity hover:opacity-90" style={{ background: "#bef532", color: "#000000" }}>
                  <Wallet size={14} />Allocate
                </Link>
              </div>
            </div>

            {/* Allocation bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-medium" style={{ color: "#b5b5b5" }}>Capital Allocation</span>
                <span className="font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                  {lockedPct}% Locked · {availPct}% Free · {vaultPct}% Vault
                </span>
              </div>
              <div className="h-[4px] w-full rounded-full flex gap-[2px] overflow-hidden" style={{ background: "#242424" }}>
                <div className="h-full rounded-l-full transition-all duration-700" style={{ width: `${lockedPct}%`, background: "#bef532" }} />
                <div className="h-full transition-all duration-700" style={{ width: `${availPct}%`, background: "#303030" }} />
                <div className="h-full rounded-r-full transition-all duration-700" style={{ width: `${vaultPct}%`, background: "#2a2a2a" }} />
              </div>
            </div>

            {/* 3 stat pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: "#171717", border: "1px solid #242424" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={14} style={{ color: "#bef532" }} />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold" style={{ color: "#808080" }}>Locked</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold" style={{ background: "rgba(190,245,50,0.10)", color: "#bef532" }}>
                    {activeEnvelopes.filter(e => e.temporal_lock?.status === "LOCKED").length} active
                  </span>
                </div>
                <CurrencyDisplay amount={lockedTotal} size="md" />
              </div>
              <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: "#171717", border: "1px solid #242424" }}>
                <div className="flex items-center gap-2">
                  <Wallet size={14} style={{ color: "#b5b5b5" }} />
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold" style={{ color: "#808080" }}>Available</span>
                </div>
                <CurrencyDisplay amount={availableBalance} size="md" />
                <p className="font-body-sm text-body-sm flex items-center gap-1 font-medium" style={{ color: "#bef532" }}>
                  <Zap size={11} /> Ready to allocate
                </p>
              </div>
              <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: "#171717", border: "1px solid #242424" }}>
                <div className="flex items-center gap-2">
                  <Shield size={14} style={{ color: "#808080" }} />
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold" style={{ color: "#808080" }}>Emergency Vault</span>
                </div>
                <CurrencyDisplay amount={vaultBalance} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column grid ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* LEFT — Active Envelopes */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-geist font-semibold text-[18px] text-white tracking-tight">Active Envelopes</h2>
                <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold" style={{ background: "rgba(190,245,50,0.10)", color: "#bef532" }}>
                  {activeEnvelopes.length}
                </span>
              </div>
              <Link href="/envelopes" className="flex items-center gap-1 font-label-md text-label-md transition-colors" style={{ color: "#bef532" }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {activeEnvelopes.length === 0 ? (
              <div className="p-10 text-center rounded-xl" style={{ background: "#171717", border: "1px dashed #303030" }}>
                <Lock size={28} className="mx-auto mb-3" style={{ color: "#808080" }} />
                <p className="font-body-md text-body-md mb-3" style={{ color: "#b5b5b5" }}>No active envelopes yet.</p>
                <Link href="/envelopes/new" className="btn-primary inline-flex">Create your first envelope</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeEnvelopes.slice(0, 4).map((envelope) => {
                  const lock = envelope.temporal_lock;
                  const isLocked = lock?.status === "LOCKED";
                  const isReady  = lock?.status === "RELEASED";
                  const countdown = lock ? formatCountdownFromISO(lock.maturity_timestamp) : null;
                  const accentColor = isReady ? "#bef532" : "#bef532";
                  const cardBorder  = isReady ? "rgba(190,245,50,0.30)" : "#242424";

                  return (
                    <Link key={envelope.id} href={`/envelopes/${envelope.id}`}
                      className="flex flex-col justify-between p-4 rounded-xl relative overflow-hidden group"
                      style={{ background: "#171717", border: `1px solid ${cardBorder}`, transition: "border-color 0.15s ease" }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#202020", color: "#bef532" }}>
                            <EnvIcon category={envelope.category} size={15} />
                          </div>
                          <div>
                            <h3 className="font-body-md text-body-md font-semibold leading-tight text-white group-hover:text-[#bef532] transition-colors">
                              {envelope.name}
                            </h3>
                            <p className="font-label-sm text-label-sm" style={{ color: "#808080" }}>{envelope.category}</p>
                          </div>
                        </div>
                        {lock && (
                          <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold" style={isLocked ? { background: "rgba(190,245,50,0.08)", color: "#bef532" } : { background: "#202020", color: "#b5b5b5" }}>
                            {isLocked ? "Locked" : "Ready"}
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <CurrencyDisplay amount={Number(envelope.balance)} size="md" />
                        {countdown && (
                          <div className="mt-2 px-3 py-2 rounded-lg flex items-center justify-between" style={{ background: "rgba(0,0,0,0.3)" }}>
                            <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>Countdown</span>
                            <span className="font-mono font-semibold text-[12px]" style={{ color: accentColor }}>{countdown}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
                {availableBalance > 0 && (
                  <Link href="/envelopes/new" className="flex flex-col items-center justify-center p-6 rounded-xl gap-3 text-center group"
                    style={{ background: "transparent", border: "1px dashed #303030" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#171717"; (e.currentTarget as HTMLElement).style.borderColor = "#bef532"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "#303030"; }}
                  >
                    <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#202020" }}>
                      <Plus size={20} style={{ color: "#bef532" }} />
                    </div>
                    <p className="font-body-md text-body-md font-semibold text-white">New Envelope</p>
                    <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
                      {privacyMode ? "Funds available" : `${formatRWF(availableBalance)} RWF`} free
                    </p>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — Vault + Activity */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Upcoming maturities */}
            {upcomingEnvelopes.length > 0 && (
              <div className="p-4 rounded-xl flex flex-col gap-4" style={CARD}>
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} style={{ color: "#bef532" }} />
                  <h3 className="font-geist font-semibold text-[16px] text-white">Coming Up</h3>
                </div>
                <div className="flex flex-col gap-1.5">
                  {upcomingEnvelopes.map((e) => {
                    const dt = new Date(e.temporal_lock!.maturity_timestamp);
                    const day = dt.getDate().toString().padStart(2, "0");
                    const month = dt.toLocaleString("default", { month: "short" }).toUpperCase();
                    const isReady = e.temporal_lock?.status === "RELEASED";
                    const accent = isReady ? "#bef532" : "#bef532";
                    return (
                      <Link key={e.id} href={`/envelopes/${e.id}`}
                        className="flex items-center justify-between p-2.5 rounded-lg transition-colors"
                        style={{ background: "#0d0d0d" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg shrink-0" style={{ background: "rgba(190,245,50,0.08)", color: accent }}>
                            <span className="text-[8px] font-bold uppercase leading-none font-mono">{month}</span>
                            <span className="text-[14px] font-bold leading-tight font-mono">{day}</span>
                          </div>
                          <div>
                            <p className="font-body-md text-body-md font-medium text-white">{e.name}</p>
                            <p className="font-label-sm text-label-sm" style={{ color: accent }}>
                              {formatCountdownFromISO(e.temporal_lock!.maturity_timestamp) === "Matured" ? "Ready to pay" : `In ${formatCountdownFromISO(e.temporal_lock!.maturity_timestamp)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-[12px] font-semibold" style={{ color: "#ffffff" }}>
                            {privacyMode ? "••••••" : formatRWF(Number(e.balance))}
                          </span>
                          <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>RWF</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Emergency Vault */}
            <div className="p-4 rounded-xl flex flex-col gap-4 relative overflow-hidden" style={CARD}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(190,245,50,0.10)" }}>
                    <Shield size={13} style={{ color: "#bef532" }} />
                  </div>
                  <h3 className="font-geist font-semibold text-[16px] text-white">Emergency Vault</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm" style={{ background: "#202020", color: "#808080", border: "1px solid #303030" }}>Protected</span>
              </div>
              <CurrencyDisplay amount={vaultBalance} size="md" />
              <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: "#242424" }}>
                <div className="h-full rounded-full" style={{ width: `${vaultPctOfGoal}%`, background: "#bef532" }} />
              </div>
              <p className="font-label-sm text-label-sm font-semibold" style={{ color: "#bef532" }}>{vaultPctOfGoal}% of goal</p>
              <Link href="/vault" className="w-full py-2.5 px-4 rounded-lg font-body-sm text-body-sm font-medium flex items-center justify-center gap-2 transition-colors" style={{ background: "#202020", color: "#b5b5b5", border: "1px solid #303030" }}>
                Open Emergency Vault <ArrowRight size={13} />
              </Link>
            </div>

            {/* Recent activity */}
            <div className="p-4 rounded-xl flex flex-col gap-3" style={CARD}>
              <div className="flex items-center justify-between">
                <h3 className="font-geist font-semibold text-[16px] text-white">Recent Activity</h3>
                <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Ledger</span>
              </div>
              {recentTxs.length === 0 ? (
                <p className="font-body-sm text-body-sm py-3 text-center" style={{ color: "#808080" }}>No transactions yet.</p>
              ) : (
                <div className="flex flex-col">
                  {recentTxs.map((tx, i) => {
                    const dir = txDirection(tx.transaction_type);
                    return (
                      <div key={tx.id} className="py-3 flex items-center justify-between gap-3"
                        style={{ borderBottom: i < recentTxs.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#202020" }}>
                            <TxIcon type={tx.transaction_type} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-body-sm text-body-sm font-medium text-white truncate">{tx.description}</p>
                            <p className="font-label-sm text-label-sm truncate" style={{ color: "#808080" }}>
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-mono text-[12px] font-semibold" style={{ color: dir === "in" ? "#bef532" : "#b5b5b5" }}>
                            {dir === "in" ? "+" : dir === "out" ? "−" : ""}
                            {privacyMode ? "••••••" : formatRWF(Number(tx.amount))}
                          </span>
                          <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>RWF</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link href="/activity" className="flex items-center justify-center gap-1 font-label-md text-label-md" style={{ color: "#808080" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#bef532"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#808080"; }}
              >
                View full activity log <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
