"use client";

import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import EnvelopeStatusBadge from "@/components/ui/EnvelopeStatusBadge";
import Link from "next/link";
import {
  formatCountdown, calcElapsedFraction,
  formatActivityDate, formatTimelineDate,
} from "@/lib/dates";
import { formatRWF } from "@/lib/currency";
import {
  Lock, Wallet, Shield, ArrowDownRight, Plus,
  ArrowRight, Zap, Home, ShoppingBasket, School,
  TrendingUp, Eye, EyeOff, ArrowDownToLine,
} from "lucide-react";

// ── Inline style helpers ─────────────────────────────────
const CARD: React.CSSProperties = {
  background: "#171717",
  border: "1px solid #242424",
  borderRadius: "12px",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};



// ── Envelope icon map ────────────────────────────────────
function EnvIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  const map: Record<string, typeof Lock> = {
    home_work: Home, shopping_basket: ShoppingBasket,
    bolt: Zap, school: School,
  };
  const Icon = map[icon] ?? Lock;
  return <Icon size={size} />;
}

// ── Tx icon ──────────────────────────────────────────────
function TxIcon({ type }: { type: string }) {
  if (type === "deposit")     return <ArrowDownRight size={15} style={{ color: "#bef532" }} />;
  if (type === "vault_sweep") return <Shield size={15} style={{ color: "#b5b5b5" }} />;
  return <Lock size={15} style={{ color: "#808080" }} />;
}

export default function DashboardPage() {
  const { account, availableFunds, lockedTotal, privacyMode, togglePrivacyMode } = useApp();

  const { totalFunds, vaultBalance } = account;
  const lockedPct   = totalFunds > 0 ? Math.round((lockedTotal  / totalFunds) * 100) : 0;
  const availPct    = totalFunds > 0 ? Math.round((availableFunds / totalFunds) * 100) : 0;
  const vaultPct    = totalFunds > 0 ? Math.round((vaultBalance  / totalFunds) * 100) : 0;

  const activeEnvelopes = account.envelopes.filter(
    (e) => e.status !== "paid" && e.status !== "cancelled"
  );
  const upcomingEnvelopes = [...activeEnvelopes]
    .sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime())
    .slice(0, 4);
  const recentTxs = account.transactions.slice(0, 5);

  const vaultGoal       = account.vaultSettings.targetAmount;
  const vaultPctOfGoal  = vaultGoal > 0 ? Math.min(100, Math.round((vaultBalance / vaultGoal) * 100)) : 0;

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6">

        {/* ── Greeting ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#bef532", boxShadow: "0 0 6px rgba(190,245,50,0.7)" }}
              />
              <span
                className="font-label-sm text-label-sm uppercase tracking-[0.18em]"
                style={{ color: "#808080" }}
              >
                Reconciled · Kigali Main Hub
              </span>
            </div>
            <h1 className="font-geist font-semibold text-headline-lg-mobile lg:text-headline-lg text-white tracking-tight">
              Good evening, Godson
            </h1>
            <p className="font-body-md text-body-md mt-0.5" style={{ color: "#b5b5b5" }}>
              Every franc has a purpose. Here&apos;s your current standing.
            </p>
          </div>
          <button
            onClick={togglePrivacyMode}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-label-sm text-label-sm self-start md:self-auto transition-colors"
            style={{ background: "#171717", color: "#808080", border: "1px solid #242424" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#303030"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#242424"; (e.currentTarget as HTMLElement).style.color = "#808080"; }}
          >
            {privacyMode ? <EyeOff size={14} /> : <Eye size={14} />}
            {privacyMode ? "Show figures" : "Hide figures"}
          </button>
        </div>

        {/* ── Hero financial card ──────────────────────── */}
        <div
          className="relative overflow-hidden p-5 sm:p-7"
          style={{
            background: "#000000",
            border: "1px solid #242424",
            borderRadius: "16px",
          }}
        >
          {/* Ambient lime glow */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "rgba(190,245,50,0.04)", filter: "blur(80px)" }}
          />

          <div className="relative z-10 flex flex-col gap-6">
            {/* Total + CTAs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="font-label-sm text-label-sm uppercase tracking-[0.12em] font-semibold"
                    style={{ color: "#808080" }}
                  >
                    Total Reconciled Funds
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold"
                    style={{ background: "rgba(190,245,50,0.10)", color: "#bef532" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#bef532" }} />
                    Secured
                  </span>
                </div>
                <CurrencyDisplay amount={totalFunds} size="xl" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/deposit"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-body-sm text-body-sm font-medium transition-colors"
                  style={{ background: "#171717", color: "#b5b5b5", border: "1px solid #303030" }}
                >
                  <ArrowDownToLine size={14} style={{ color: "#bef532" }} />
                  Add Money
                </Link>
                <Link
                  href="/envelopes/new"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-body-sm text-body-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "#bef532", color: "#000000" }}
                >
                  <Wallet size={14} />
                  Allocate Income
                </Link>
              </div>
            </div>

            {/* Allocation bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-medium" style={{ color: "#b5b5b5" }}>
                  Capital Allocation
                </span>
                <span className="font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                  {lockedPct}% Locked · {availPct}% Free · {vaultPct}% Vault
                </span>
              </div>
              {/* Segmented bar */}
              <div
                className="h-[4px] w-full rounded-full flex gap-[2px] overflow-hidden"
                style={{ background: "#242424" }}
              >
                <div
                  className="h-full rounded-l-full transition-all duration-700"
                  style={{ width: `${lockedPct}%`, background: "#bef532" }}
                  title={`${lockedPct}% Locked`}
                />
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${availPct}%`, background: "#303030" }}
                  title={`${availPct}% Available`}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-700"
                  style={{ width: `${vaultPct}%`, background: "#2a2a2a" }}
                  title={`${vaultPct}% Vault`}
                />
              </div>
            </div>

            {/* 3 stat pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Locked */}
              <div
                className="p-4 rounded-xl flex flex-col gap-3"
                style={{ background: "#171717", border: "1px solid #242424" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={14} style={{ color: "#bef532" }} />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold" style={{ color: "#808080" }}>
                      Locked
                    </span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold"
                    style={{ background: "rgba(190,245,50,0.10)", color: "#bef532" }}
                  >
                    {activeEnvelopes.length} active
                  </span>
                </div>
                <div>
                  <CurrencyDisplay amount={lockedTotal} size="md" />
                  <p className="font-body-sm text-body-sm mt-1" style={{ color: "#808080" }}>
                    Secured against impulse
                  </p>
                </div>
              </div>

              {/* Available */}
              <div
                className="p-4 rounded-xl flex flex-col gap-3"
                style={{ background: "#171717", border: "1px solid #242424" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet size={14} style={{ color: "#b5b5b5" }} />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold" style={{ color: "#808080" }}>
                      Available
                    </span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold"
                    style={{ background: "#202020", color: "#b5b5b5", border: "1px solid #303030" }}
                  >
                    Unallocated
                  </span>
                </div>
                <div>
                  <CurrencyDisplay amount={availableFunds} size="md" />
                  <p className="font-body-sm text-body-sm mt-1 flex items-center gap-1 font-medium" style={{ color: "#bef532" }}>
                    <Zap size={11} /> Ready to allocate
                  </p>
                </div>
              </div>

              {/* Vault */}
              <div
                className="p-4 rounded-xl flex flex-col gap-3"
                style={{ background: "#171717", border: "1px solid #242424" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={14} style={{ color: "#808080" }} />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold" style={{ color: "#808080" }}>
                      Emergency Vault
                    </span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full font-label-sm text-label-sm"
                    style={{ background: "#202020", color: "#808080", border: "1px solid #303030" }}
                  >
                    Protected
                  </span>
                </div>
                <div>
                  <CurrencyDisplay amount={vaultBalance} size="md" />
                  <p className="font-body-sm text-body-sm mt-1" style={{ color: "#808080" }}>
                    Separate from general funds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column grid ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* LEFT — Active Envelopes (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-geist font-semibold text-[18px] text-white tracking-tight">
                  Active Envelopes
                </h2>
                <span
                  className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold"
                  style={{ background: "rgba(190,245,50,0.10)", color: "#bef532" }}
                >
                  {activeEnvelopes.length}
                </span>
              </div>
              <Link
                href="/envelopes"
                className="flex items-center gap-1 font-label-md text-label-md transition-colors"
                style={{ color: "#bef532" }}
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {activeEnvelopes.length === 0 ? (
              <div
                className="p-10 text-center rounded-xl"
                style={{ background: "#171717", border: "1px dashed #303030" }}
              >
                <Lock size={28} className="mx-auto mb-3" style={{ color: "#808080" }} />
                <p className="font-body-md text-body-md mb-3" style={{ color: "#b5b5b5" }}>
                  No active envelopes yet.
                </p>
                <Link href="/envelopes/new" className="btn-primary inline-flex">
                  Create your first envelope
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeEnvelopes.slice(0, 4).map((envelope) => {
                  const elapsed   = calcElapsedFraction(envelope.createdAt, envelope.maturityDate);
                  const countdown = formatCountdown(envelope.maturityDate);
                  const isUnlocking = envelope.status === "unlocking_soon";
                  const isReady     = envelope.status === "ready_to_pay";

                  // Amber for unlocking, lime for ready, default for locked
                  const accentColor = isUnlocking ? "#ffb800" : isReady ? "#bef532" : "#bef532";
                  const cardBorder  = isUnlocking
                    ? "rgba(255,184,0,0.30)"
                    : isReady
                    ? "rgba(190,245,50,0.30)"
                    : "#242424";
                  const cardBg      = isUnlocking
                    ? "rgba(255,184,0,0.03)"
                    : isReady
                    ? "rgba(190,245,50,0.03)"
                    : "#171717";
                  const cardGlow    = isUnlocking
                    ? "0 0 24px rgba(255,184,0,0.08)"
                    : isReady
                    ? "0 0 24px rgba(190,245,50,0.08)"
                    : "none";

                  return (
                    <Link
                      key={envelope.id}
                      href={`/envelopes/${envelope.id}`}
                      className="flex flex-col justify-between p-4 rounded-xl relative overflow-hidden group"
                      style={{
                        background: cardBg,
                        border: `1px solid ${cardBorder}`,
                        boxShadow: cardGlow,
                        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                      }}
                    >
                      {/* Top accent line for active states */}
                      {(isUnlocking || isReady) && (
                        <div
                          className="absolute top-0 left-0 right-0 h-[2px]"
                          style={{ background: accentColor }}
                        />
                      )}

                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background: isUnlocking || isReady
                                ? `rgba(${isUnlocking ? "255,184,0" : "190,245,50"},0.12)`
                                : "#202020",
                              color: accentColor,
                            }}
                          >
                            <EnvIcon icon={envelope.icon} size={15} />
                          </div>
                          <div>
                            <h3
                              className="font-body-md text-body-md font-semibold leading-tight text-white group-hover:text-[#bef532] transition-colors"
                            >
                              {envelope.name}
                            </h3>
                            <p className="font-label-sm text-label-sm" style={{ color: "#808080" }}>
                              {envelope.categoryLabel}
                            </p>
                          </div>
                        </div>
                        <EnvelopeStatusBadge status={envelope.status} />
                      </div>

                      {/* Amount + lock bar */}
                      <div className="mt-4">
                        <CurrencyDisplay amount={envelope.amount} size="md" />
                        {/* Segmented progress bar — 4px spec */}
                        <div
                          className="w-full h-[4px] rounded-full mt-2.5 overflow-hidden"
                          style={{ background: "#242424" }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round(elapsed * 100)}%`,
                              background: accentColor,
                            }}
                          />
                        </div>
                      </div>

                      {/* Countdown footer */}
                      <div
                        className="mt-3 px-3 py-2 rounded-lg flex items-center justify-between"
                        style={{ background: "rgba(0,0,0,0.3)" }}
                      >
                        <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>
                          Countdown
                        </span>
                        <span
                          className="font-mono font-semibold text-[12px] tracking-wider"
                          style={{ color: accentColor, fontFeatureSettings: '"tnum" 1, "zero" 1' }}
                        >
                          {countdown}
                        </span>
                      </div>
                    </Link>
                  );
                })}

                {/* Add new envelope prompt */}
                {availableFunds > 0 && (
                  <Link
                    href="/envelopes/new"
                    className="flex flex-col items-center justify-center p-6 rounded-xl gap-3 text-center group transition-colors"
                    style={{ background: "transparent", border: "1px dashed #303030" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#171717"; (e.currentTarget as HTMLElement).style.borderColor = "#bef532"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "#303030"; }}
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ background: "#202020" }}
                    >
                      <Plus size={20} style={{ color: "#bef532" }} />
                    </div>
                    <div>
                      <p className="font-body-md text-body-md font-semibold text-white">
                        New Envelope
                      </p>
                      <p className="font-body-sm text-body-sm mt-0.5" style={{ color: "#808080" }}>
                        {privacyMode ? "Funds available" : `${formatRWF(availableFunds)} RWF`} free
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            )}

            {/* Unallocated banner */}
            {availableFunds > 0 && activeEnvelopes.length > 0 && (
              <div
                className="flex items-center justify-between gap-4 p-4 rounded-xl"
                style={{ background: "#171717", border: "1px solid #242424" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(190,245,50,0.08)" }}
                  >
                    <TrendingUp size={16} style={{ color: "#bef532" }} />
                  </div>
                  <div>
                    <p className="font-body-md text-body-md text-white font-medium">
                      {privacyMode ? "Funds" : `${formatRWF(availableFunds)} RWF`}{" "}
                      <span style={{ color: "#bef532" }}>unassigned</span>
                    </p>
                    <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
                      Rule #1 — give every franc a destination.
                    </p>
                  </div>
                </div>
                <Link
                  href="/envelopes/new"
                  className="shrink-0 px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-opacity hover:opacity-80 whitespace-nowrap"
                  style={{ background: "#bef532", color: "#000000" }}
                >
                  Lock Now
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT — Timeline + Vault + Activity (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">

            {/* Coming up timeline */}
            {upcomingEnvelopes.length > 0 && (
              <div className="p-4 rounded-xl flex flex-col gap-4" style={CARD}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={15} style={{ color: "#bef532" }} />
                    <h3 className="font-geist font-semibold text-[16px] text-white">Coming Up</h3>
                  </div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                    Scheduled
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {upcomingEnvelopes.map((e) => {
                    const { day, month } = formatTimelineDate(e.maturityDate);
                    const isAmber = e.status === "unlocking_soon";
                    const accent  = isAmber ? "#ffb800" : "#bef532";
                    return (
                      <Link
                        key={e.id}
                        href={`/envelopes/${e.id}`}
                        className="flex items-center justify-between p-2.5 rounded-lg transition-colors"
                        style={{ background: "#0d0d0d" }}
                        onMouseEnter={(el) => { (el.currentTarget as HTMLElement).style.background = "#202020"; }}
                        onMouseLeave={(el) => { (el.currentTarget as HTMLElement).style.background = "#0d0d0d"; }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex flex-col items-center justify-center w-10 h-10 rounded-lg shrink-0"
                            style={{ background: `rgba(${isAmber ? "255,184,0" : "190,245,50"},0.08)`, color: accent }}
                          >
                            <span className="text-[8px] font-bold uppercase leading-none font-mono">{month}</span>
                            <span className="text-[14px] font-bold leading-tight font-mono">{day}</span>
                          </div>
                          <div>
                            <p className="font-body-md text-body-md font-medium text-white">{e.name}</p>
                            <p className="font-label-sm text-label-sm" style={{ color: accent }}>
                              {formatCountdown(e.maturityDate) === "Matured" ? "Ready to pay" : `In ${formatCountdown(e.maturityDate)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span
                            className="font-mono text-[12px] font-semibold"
                            style={{ color: "#ffffff", fontFeatureSettings: '"tnum" 1' }}
                          >
                            {privacyMode ? "••••••" : formatRWF(e.amount)}
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
              <Shield
                size={72}
                className="absolute -right-3 -bottom-3 pointer-events-none"
                style={{ color: "#242424" }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(190,245,50,0.10)" }}
                    >
                      <Shield size={13} style={{ color: "#bef532" }} />
                    </div>
                    <h3 className="font-geist font-semibold text-[16px] text-white">Emergency Vault</h3>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full font-label-sm text-label-sm"
                    style={{ background: "#202020", color: "#808080", border: "1px solid #303030" }}
                  >
                    Level 1 Safety
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <CurrencyDisplay amount={vaultBalance} size="md" />
                    <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>
                      Goal: {privacyMode ? "••••••" : formatRWF(vaultGoal)} RWF
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div
                    className="w-full h-[4px] rounded-full mt-2.5 overflow-hidden"
                    style={{ background: "#242424" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${vaultPctOfGoal}%`, background: "#bef532" }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-label-sm text-label-sm font-semibold" style={{ color: "#bef532" }}>
                      {vaultPctOfGoal}% funded
                    </span>
                    <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>
                      {privacyMode ? "••••••" : formatRWF(Math.max(0, vaultGoal - vaultBalance))} RWF to go
                    </span>
                  </div>
                </div>

                <div
                  className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                >
                  <span style={{ color: "#bef532" }}>↻</span>
                  <span className="font-label-sm text-label-sm font-semibold" style={{ color: "#bef532" }}>
                    {account.vaultSettings.sweepPercentage}% auto-sweep{" "}
                    {account.vaultSettings.isAutoSweepEnabled ? "enabled" : "disabled"}
                  </span>
                </div>
              </div>

              <Link
                href="/vault"
                className="relative z-10 w-full py-2.5 px-4 rounded-lg font-body-sm text-body-sm font-medium flex items-center justify-center gap-2 group transition-colors"
                style={{ background: "#202020", color: "#b5b5b5", border: "1px solid #303030" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#b5b5b5"; }}
              >
                Open Emergency Vault
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Recent activity */}
            <div className="p-4 rounded-xl flex flex-col gap-3" style={CARD}>
              <div className="flex items-center justify-between">
                <h3 className="font-geist font-semibold text-[16px] text-white">Recent Activity</h3>
                <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                  Audit Log
                </span>
              </div>

              <div className="flex flex-col">
                {recentTxs.map((tx, i) => (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-3"
                    style={{
                      borderBottom: i < recentTxs.length - 1 ? "1px solid #1a1a1a" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#202020" }}
                      >
                        <TxIcon type={tx.type} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body-sm text-body-sm font-medium text-white truncate">
                          {tx.description}
                        </p>
                        <p className="font-label-sm text-label-sm truncate" style={{ color: "#808080" }}>
                          {formatActivityDate(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span
                        className="font-mono text-[12px] font-semibold"
                        style={{
                          color: tx.direction === "in" ? "#bef532" : "#b5b5b5",
                          fontFeatureSettings: '"tnum" 1',
                        }}
                      >
                        {tx.direction === "in" ? "+" : tx.direction === "out" ? "−" : ""}
                        {privacyMode ? "••••••" : formatRWF(tx.amount)}
                      </span>
                      <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>RWF</span>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/activity"
                className="flex items-center justify-center gap-1 font-label-md text-label-md transition-colors"
                style={{ color: "#808080" }}
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
