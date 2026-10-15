"use client";

import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import EnvelopeStatusBadge from "@/components/ui/EnvelopeStatusBadge";
import Link from "next/link";
import { formatCountdown, formatDate, calcElapsedFraction, formatActivityDate, formatTimelineDate } from "@/lib/dates";
import { formatRWF } from "@/lib/currency";
import {
  Lock, Wallet, Shield, ArrowDownRight, Plus, TrendingUp,
  Eye, EyeOff, ArrowRight, Zap, Home,
  ShoppingBasket, School
} from "lucide-react";

// ── Icon map for envelope categories ──────────────────────
function EnvelopeIcon({ icon, className }: { icon: string; className?: string }) {
  const map: Record<string, typeof Lock> = {
    home_work: Home,
    shopping_basket: ShoppingBasket,
    bolt: Zap,
    school: School,
  };
  const Icon = map[icon] ?? Lock;
  return <Icon size={18} className={className} />;
}

// ── Transaction direction icon ─────────────────────────────
function TxIcon({ type }: { type: string }) {
  if (type === "deposit") return <ArrowDownRight size={16} className="text-primary-fixed" />;
  if (type === "vault_sweep") return <Shield size={16} className="text-secondary" />;
  return <Lock size={16} className="text-outline" />;
}

export default function DashboardPage() {
  const { account, availableFunds, lockedTotal, privacyMode, togglePrivacyMode } = useApp();

  const totalFunds = account.totalFunds;
  const vaultBalance = account.vaultBalance;

  const lockedPct = totalFunds > 0 ? Math.round((lockedTotal / totalFunds) * 100) : 0;
  const availablePct = totalFunds > 0 ? Math.round((availableFunds / totalFunds) * 100) : 0;
  const vaultPct = totalFunds > 0 ? Math.round((vaultBalance / totalFunds) * 100) : 0;

  const activeEnvelopes = account.envelopes.filter(
    (e) => e.status !== "paid" && e.status !== "cancelled"
  );

  const upcomingEnvelopes = [...activeEnvelopes]
    .sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime())
    .slice(0, 4);

  const recentTransactions = account.transactions.slice(0, 5);

  const vaultGoal = account.vaultSettings.targetAmount;
  const vaultPctOfGoal = vaultGoal > 0 ? Math.round((vaultBalance / vaultGoal) * 100) : 0;

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-6">
        {/* ── Greeting & controls ─────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
                Reconciled • Kigali Main Hub
              </span>
            </div>
            <h1 className="font-geist font-semibold text-headline-lg-mobile lg:text-headline-lg text-primary tracking-tight">
              Good evening, Godson
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Here is where your money stands. Every franc has a purpose.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={togglePrivacyMode}
              className="flex items-center gap-2 px-3 py-2 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label={privacyMode ? "Show figures" : "Hide figures"}
            >
              {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="font-label-md text-label-md hidden sm:inline">
                {privacyMode ? "Show figures" : "Hide figures"}
              </span>
            </button>
          </div>
        </div>

        {/* ── Hero financial summary card ─────────────────── */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 sm:p-7 shadow-2xl border border-surface-container">
          {/* Ambient glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-container/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6">
            {/* Top: Total + CTAs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    Total Reconciled Funds
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-fixed font-label-sm text-label-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />
                    Secured
                  </span>
                </div>
                <CurrencyDisplay amount={totalFunds} size="xl" />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/deposit"
                  className="px-5 py-3 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-md text-body-md font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus size={16} className="text-primary-fixed" />
                  Add Money
                </Link>
                <Link
                  href="/envelopes/new"
                  className="px-6 py-3 rounded bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <Wallet size={16} />
                  Allocate Income
                </Link>
              </div>
            </div>

            {/* Allocation bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between font-label-sm text-label-sm">
                <span className="text-on-surface-variant font-medium">Capital Allocation</span>
                <span className="text-outline">
                  {lockedPct}% Locked · {availablePct}% Available · {vaultPct}% Vault
                </span>
              </div>
              <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden flex gap-0.5 p-0.5">
                <div
                  className="h-full bg-primary-fixed rounded-l-full transition-all duration-700"
                  style={{ width: `${lockedPct}%` }}
                  title={`${lockedPct}% Locked`}
                />
                <div
                  className="h-full bg-secondary-container transition-all duration-700"
                  style={{ width: `${availablePct}%` }}
                  title={`${availablePct}% Available`}
                />
                <div
                  className="h-full bg-surface-bright rounded-r-full transition-all duration-700"
                  style={{ width: `${vaultPct}%` }}
                  title={`${vaultPct}% Vault`}
                />
              </div>
            </div>

            {/* 3 pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Locked */}
              <div className="p-4 rounded bg-surface-container-low flex flex-col justify-between hover:bg-surface-container transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-outline">
                    <Lock size={16} className="text-primary-fixed" />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                      Locked
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-fixed font-label-sm text-label-sm font-semibold">
                    {activeEnvelopes.length} Active
                  </span>
                </div>
                <div className="mt-3">
                  <CurrencyDisplay amount={lockedTotal} size="md" />
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Secured against impulse spending
                  </p>
                </div>
              </div>

              {/* Available */}
              <div className="p-4 rounded bg-surface-container-low flex flex-col justify-between hover:bg-surface-container transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-outline">
                    <Wallet size={16} className="text-secondary" />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                      Available
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
                    Unallocated
                  </span>
                </div>
                <div className="mt-3">
                  <CurrencyDisplay amount={availableFunds} size="md" />
                  <p className="font-body-sm text-body-sm text-primary-fixed mt-1 font-medium flex items-center gap-1">
                    <Zap size={12} />
                    Ready to allocate
                  </p>
                </div>
              </div>

              {/* Vault */}
              <div className="p-4 rounded bg-surface-container-low flex flex-col justify-between hover:bg-surface-container transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-outline">
                    <Shield size={16} className="text-on-surface" />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                      Emergency Vault
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-outline font-label-sm text-label-sm font-semibold">
                    Protected
                  </span>
                </div>
                <div className="mt-3">
                  <CurrencyDisplay amount={vaultBalance} size="md" />
                  <p className="font-body-sm text-body-sm text-outline mt-1 truncate">
                    Separate from general spending
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column main grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Active envelopes */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-geist font-semibold text-headline-sm text-primary tracking-tight">
                  Active Envelopes
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-primary-fixed font-label-sm text-label-sm font-semibold">
                  {activeEnvelopes.length}
                </span>
              </div>
              <Link
                href="/envelopes"
                className="font-label-md text-label-md text-primary-fixed hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            </div>

            {activeEnvelopes.length === 0 ? (
              <div className="rounded-xl bg-surface-container-low border border-dashed border-surface-container-high p-8 text-center">
                <Lock size={28} className="text-outline mx-auto mb-3" />
                <p className="font-body-md text-body-md text-on-surface-variant">
                  No active envelopes yet.
                </p>
                <Link
                  href="/envelopes/new"
                  className="inline-block mt-3 px-4 py-2 rounded bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:opacity-90"
                >
                  Create Your First Envelope
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeEnvelopes.slice(0, 4).map((envelope) => {
                  const elapsed = calcElapsedFraction(envelope.createdAt, envelope.maturityDate);
                  const countdown = formatCountdown(envelope.maturityDate);
                  const maturityStr = formatDate(envelope.maturityDate);
                  const isUnlocking = envelope.status === "unlocking_soon";
                  const isReady = envelope.status === "ready_to_pay";

                  return (
                    <Link
                      key={envelope.id}
                      href={`/envelopes/${envelope.id}`}
                      className={`
                        rounded-xl p-4 flex flex-col justify-between transition-all group
                        ${isUnlocking || isReady
                          ? "bg-surface-container-high border-2 border-primary-fixed/40 hover:border-primary-fixed"
                          : "bg-surface-container-low border border-surface-container hover:bg-surface-container hover:border-surface-variant"
                        }
                        relative overflow-hidden
                      `}
                    >
                      {/* Accent bar for unlocking */}
                      {(isUnlocking || isReady) && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-fixed" />
                      )}

                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${isUnlocking || isReady ? "bg-primary-container text-on-primary" : "bg-surface-container-high text-primary-fixed"}`}>
                              <EnvelopeIcon icon={envelope.icon} />
                            </div>
                            <div>
                              <h3 className="font-body-md text-body-md font-semibold text-primary group-hover:text-primary-fixed transition-colors leading-tight">
                                {envelope.name}
                              </h3>
                              <p className="font-label-sm text-label-sm text-outline">
                                {envelope.categoryLabel}
                              </p>
                            </div>
                          </div>
                          <EnvelopeStatusBadge status={envelope.status} />
                        </div>

                        <div className="mt-4">
                          <div className="flex items-baseline justify-between">
                            <CurrencyDisplay amount={envelope.amount} size="md" />
                          </div>
                          <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-2 overflow-hidden">
                            <div
                              className="bg-primary-fixed h-full rounded-full transition-all"
                              style={{ width: `${Math.round(elapsed * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 flex flex-col gap-1.5 bg-surface-container-lowest/40 p-2 rounded">
                        <div className="flex items-center justify-between font-label-sm text-label-sm">
                          <span className="text-outline">Countdown</span>
                          <span className={`font-medium flex items-center gap-1 ${isUnlocking || isReady ? "text-primary-fixed font-bold" : "text-primary-fixed"}`}>
                            {countdown}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
                          <span>Matures</span>
                          <span className="text-on-surface-variant font-mono">{maturityStr}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {/* Add prompt */}
                {availableFunds > 0 && (
                  <Link
                    href="/envelopes/new"
                    className="rounded-xl bg-surface-container-low/40 hover:bg-surface-container-low border border-dashed border-surface-container-high transition-all flex flex-col items-center justify-center p-6 gap-3 text-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary-fixed group-hover:scale-110 transition-transform">
                      <Plus size={22} />
                    </div>
                    <div>
                      <p className="font-body-md text-body-md font-semibold text-primary">
                        Add Priority Envelope
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        {privacyMode ? "Funds available" : `${formatRWF(availableFunds)} RWF`} unassigned
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            )}

            {/* Unallocated funds banner */}
            {availableFunds > 0 && activeEnvelopes.length > 0 && (
              <div className="rounded-xl bg-surface-container-lowest border border-surface-container p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-fixed shrink-0">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <p className="font-body-md text-body-md text-on-surface font-medium">
                      You have{" "}
                      <span className="text-primary-fixed font-semibold">
                        {privacyMode ? "••••••" : `${formatRWF(availableFunds)} RWF`}
                      </span>{" "}
                      unassigned
                    </p>
                    <p className="font-body-sm text-body-sm text-outline">
                      Rule #1: Give every franc a destination.
                    </p>
                  </div>
                </div>
                <Link
                  href="/envelopes/new"
                  className="shrink-0 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-primary-fixed font-label-md text-label-md font-medium transition-colors whitespace-nowrap"
                >
                  Lock Now
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT column: Timeline + Vault + Activity */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Coming up timeline */}
            {upcomingEnvelopes.length > 0 && (
              <div className="rounded-xl bg-surface-container-low border border-surface-container p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary-fixed" />
                    <h3 className="font-geist font-semibold text-headline-sm text-primary tracking-tight">
                      Coming Up
                    </h3>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Scheduled
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {upcomingEnvelopes.map((e) => {
                    const { day, month } = formatTimelineDate(e.maturityDate);
                    return (
                      <Link
                        key={e.id}
                        href={`/envelopes/${e.id}`}
                        className="flex items-center justify-between p-2.5 rounded bg-surface-container-lowest/60 hover:bg-surface-container-lowest transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex flex-col items-center justify-center w-10 h-10 rounded shrink-0 ${e.status === "unlocking_soon" || e.status === "ready_to_pay" ? "bg-primary-container/15 text-primary-fixed" : "bg-surface-container-high text-outline"}`}>
                            <span className="font-label-sm text-[9px] font-bold uppercase leading-none">{month}</span>
                            <span className="font-label-lg text-label-lg font-bold leading-tight">{day}</span>
                          </div>
                          <div>
                            <p className="font-body-md text-body-md font-semibold text-primary">{e.name}</p>
                            <p className={`font-label-sm text-label-sm ${e.status === "unlocking_soon" ? "text-primary-fixed" : "text-outline"}`}>
                              {formatCountdown(e.maturityDate) === "Matured" ? "Ready to pay" : `In ${formatCountdown(e.maturityDate)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-label-md text-label-md font-semibold text-primary font-mono">
                            {privacyMode ? "••••••" : formatRWF(e.amount)}
                          </span>
                          <span className="font-label-sm text-label-sm text-outline">RWF</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Emergency Vault card */}
            <div className="rounded-xl bg-surface-container-low border border-surface-container p-4 flex flex-col gap-4 relative overflow-hidden">
              <Shield size={80} className="absolute -right-4 -bottom-4 text-surface-container-highest/20 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-primary-container/20 text-primary-fixed flex items-center justify-center">
                      <Shield size={14} />
                    </div>
                    <h3 className="font-geist font-semibold text-headline-sm text-primary tracking-tight">
                      Emergency Vault
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-outline font-label-sm text-label-sm">
                    Level 1 Safety
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <CurrencyDisplay amount={vaultBalance} size="md" />
                    <span className="font-label-sm text-label-sm text-outline">
                      Goal:{" "}
                      <span>{privacyMode ? "••••••" : formatRWF(vaultGoal)}</span> RWF
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-primary-fixed h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, vaultPctOfGoal)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 font-label-sm text-label-sm">
                    <span className="text-primary-fixed font-medium">{vaultPctOfGoal}% funded</span>
                    <span className="text-outline">
                      {privacyMode ? "••••••" : formatRWF(Math.max(0, vaultGoal - vaultBalance))} RWF to target
                    </span>
                  </div>
                </div>
                <div className="mt-3 p-2.5 rounded bg-surface-container-lowest/80 flex items-center gap-2">
                  <span className="text-primary-fixed">↻</span>
                  <span className="font-label-sm text-label-sm font-semibold text-primary-fixed">
                    {account.vaultSettings.sweepPercentage}% auto-sweep{" "}
                    {account.vaultSettings.isAutoSweepEnabled ? "enabled" : "disabled"}
                  </span>
                </div>
              </div>
              <Link
                href="/vault"
                className="relative z-10 w-full py-2.5 px-4 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-md text-body-md font-medium transition-colors flex items-center justify-center gap-2 group"
              >
                Open Emergency Vault
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Recent activity */}
            <div className="rounded-xl bg-surface-container-low border border-surface-container p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-geist font-semibold text-headline-sm text-primary tracking-tight">
                  Recent Activity
                </h3>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Audit Log
                </span>
              </div>
              <div className="flex flex-col divide-y divide-surface-container-high/40">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                        <TxIcon type={tx.type} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body-md text-body-md font-medium text-primary truncate">
                          {tx.description}
                        </p>
                        <p className="font-body-sm text-body-sm text-outline truncate">
                          {formatActivityDate(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className={`font-label-md text-label-md font-semibold font-mono ${tx.direction === "in" ? "text-primary-fixed" : "text-on-surface-variant"}`}>
                        {tx.direction === "in" ? "+" : tx.direction === "out" ? "-" : ""}
                        {privacyMode ? "••••••" : formatRWF(tx.amount)}
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">RWF</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/activity"
                className="text-center font-label-md text-label-md text-outline hover:text-primary-fixed flex items-center justify-center gap-1 transition-colors"
              >
                View all activity
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
