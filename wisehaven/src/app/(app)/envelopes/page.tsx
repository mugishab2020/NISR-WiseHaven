"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import EnvelopeStatusBadge from "@/components/ui/EnvelopeStatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import { formatCountdown, formatDate, calcElapsedFraction } from "@/lib/dates";
import { formatRWF } from "@/lib/currency";
import type { EnvelopeStatus } from "@/types";
import {
  Plus, Lock, Search, ArrowRight, Wallet,
  Home, ShoppingBasket, School, Zap, Truck, Heart, Users, Briefcase,
} from "lucide-react";

const FILTER_PILLS: { label: string; value: EnvelopeStatus | "all" | "completed" }[] = [
  { label: "All Active",       value: "all"           },
  { label: "Locked",           value: "locked"        },
  { label: "Unlocking Soon",   value: "unlocking_soon"},
  { label: "Ready to Pay",     value: "ready_to_pay"  },
  { label: "Paid",             value: "paid"          },
];

const ICON_MAP: Record<string, typeof Lock> = {
  home_work: Home, shopping_basket: ShoppingBasket, bolt: Zap,
  school: School, truck: Truck, heart: Heart, users: Users, briefcase: Briefcase,
};

function EnvIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  const Icon = ICON_MAP[icon] ?? Lock;
  return <Icon size={size} />;
}

const CARD: React.CSSProperties = {
  background: "#171717",
  border: "1px solid #242424",
  borderRadius: "12px",
};

export default function EnvelopesPage() {
  const { account, availableFunds, privacyMode } = useApp();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<EnvelopeStatus | "all" | "completed">("all");

  const active     = account.envelopes.filter((e) => e.status !== "paid" && e.status !== "cancelled");
  const locked     = account.envelopes.filter((e) => e.status === "locked");
  const unlocking  = account.envelopes.filter((e) => e.status === "unlocking_soon");
  const ready      = account.envelopes.filter((e) => e.status === "ready_to_pay");
  const paid       = account.envelopes.filter((e) => e.status === "paid");

  const totalInEnvelopes = active.reduce((s, e) => s + e.amount, 0);

  const filtered = account.envelopes.filter((e) => {
    const matchFilter = filter === "all"
      ? e.status !== "paid" && e.status !== "cancelled"
      : filter === "paid"
        ? e.status === "paid" || e.status === "cancelled"
        : e.status === filter;
    const matchSearch = !search
      || e.name.toLowerCase().includes(search.toLowerCase())
      || e.categoryLabel.toLowerCase().includes(search.toLowerCase())
      || e.recipient.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock size={13} style={{ color: "#bef532" }} />
              <span
                className="font-label-sm text-label-sm uppercase tracking-[0.18em]"
                style={{ color: "#bef532" }}
              >
                Enforce Discipline · Kigali UTC+2
              </span>
            </div>
            <h1 className="font-geist font-semibold text-[28px] lg:text-[40px] text-white tracking-tight leading-none">
              Your Envelopes
            </h1>
            <p className="font-body-md text-body-md mt-1.5 max-w-lg" style={{ color: "#b5b5b5" }}>
              Every envelope protects money for something that matters.
              Funds stay locked until their maturity date.
            </p>
          </div>
          <Link
            href="/envelopes/new"
            className="flex items-center gap-2 px-5 py-3 rounded-lg font-body-md text-body-md font-semibold transition-opacity hover:opacity-90 active:scale-[0.98] self-start"
            style={{ background: "#bef532", color: "#000000" }}
          >
            <Plus size={16} />
            New Envelope
          </Link>
        </div>

        {/* ── Metrics bar ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total */}
          <div className="p-4 rounded-xl flex flex-col gap-2" style={CARD}>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                In Envelopes
              </span>
              <Wallet size={14} style={{ color: "#bef532" }} />
            </div>
            <CurrencyDisplay amount={totalInEnvelopes} size="md" />
            <span className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
              {active.length} active
            </span>
          </div>

          {/* Locked */}
          <div className="p-4 rounded-xl flex flex-col gap-2" style={CARD}>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                Locked
              </span>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-label-sm text-label-sm font-mono font-semibold"
                style={{ background: "rgba(190,245,50,0.08)", color: "#bef532" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#bef532" }} />
                {locked.length}
              </span>
            </div>
            <CurrencyDisplay amount={locked.reduce((s, e) => s + e.amount, 0)} size="md" />
            <span className="font-body-sm text-body-sm" style={{ color: "#808080" }}>Non-negotiable</span>
          </div>

          {/* Unlocking Soon */}
          <div className="p-4 rounded-xl flex flex-col gap-2" style={CARD}>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                Unlocking
              </span>
              <span
                className="px-1.5 py-0.5 rounded font-label-sm text-label-sm font-mono font-semibold animate-pulse"
                style={{ background: "rgba(255,184,0,0.10)", color: "#ffb800" }}
              >
                {unlocking.length}
              </span>
            </div>
            <CurrencyDisplay amount={unlocking.reduce((s, e) => s + e.amount, 0)} size="md" />
            <span className="font-body-sm text-body-sm" style={{ color: "#ffb800" }}>Maturing soon</span>
          </div>

          {/* Ready to Pay */}
          <div className="p-4 rounded-xl flex flex-col gap-2" style={CARD}>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                Ready to Pay
              </span>
              <span
                className="px-1.5 py-0.5 rounded font-label-sm text-label-sm font-mono font-bold"
                style={ready.length > 0 ? { background: "#bef532", color: "#000000" } : { background: "#202020", color: "#808080" }}
              >
                {ready.length}
              </span>
            </div>
            <CurrencyDisplay amount={ready.reduce((s, e) => s + e.amount, 0)} size="md" />
            <span className="font-body-sm text-body-sm" style={{ color: ready.length > 0 ? "#bef532" : "#808080" }}>
              {ready.length > 0 ? "Confirm payment" : "All secured"}
            </span>
          </div>
        </div>

        {/* ── Search + filter bar ─────────────────────────── */}
        <div className="flex flex-col gap-3 p-4 rounded-xl" style={CARD}>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#808080" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg font-body-sm text-body-sm text-white placeholder:text-[#808080] focus:outline-none transition-all"
              style={{ background: "#0d0d0d", border: "1px solid #303030" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#bef532"; e.currentTarget.style.boxShadow = "0 0 0 1px #bef532"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "#303030"; e.currentTarget.style.boxShadow = "none"; }}
              placeholder="Search by name, category, or recipient…"
              type="text"
              aria-label="Search envelopes"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {FILTER_PILLS.map((p) => {
              const count = p.value === "all"
                ? active.length
                : p.value === "paid"
                  ? paid.length
                  : account.envelopes.filter(e => e.status === p.value).length;
              const active_ = filter === p.value;
              const isAmber = p.value === "unlocking_soon";

              return (
                <button
                  key={p.value}
                  onClick={() => setFilter(p.value)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-all"
                  style={
                    active_
                      ? { background: isAmber ? "rgba(255,184,0,0.15)" : "#bef532", color: isAmber ? "#ffb800" : "#000000" }
                      : { background: "#202020", color: "#808080", border: "1px solid #303030" }
                  }
                  aria-pressed={active_}
                >
                  {isAmber && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#ffb800" }} />}
                  {p.label}
                  <span style={{ opacity: 0.6 }}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Envelopes grid ──────────────────────────────── */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Lock}
            title={search ? "No results found" : "No envelopes here"}
            description={search ? "Try a different search term." : filter === "paid" ? "No paid envelopes yet." : "Create your first envelope to start saving with purpose."}
            actionLabel={!search && filter === "all" ? "Create Envelope" : undefined}
            actionHref="/envelopes/new"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((envelope) => {
              const elapsed   = calcElapsedFraction(envelope.createdAt, envelope.maturityDate);
              const countdown = formatCountdown(envelope.maturityDate);
              const maturity  = formatDate(envelope.maturityDate);
              const isUnlocking = envelope.status === "unlocking_soon";
              const isReady     = envelope.status === "ready_to_pay";
              const isPaid      = envelope.status === "paid";

              const accent = isUnlocking ? "#ffb800" : "#bef532";
              const border = isUnlocking
                ? "rgba(255,184,0,0.30)"
                : isReady
                  ? "rgba(190,245,50,0.25)"
                  : isPaid
                    ? "#1a1a1a"
                    : "#242424";
              const bg = isUnlocking
                ? "rgba(255,184,0,0.02)"
                : isReady
                  ? "rgba(190,245,50,0.02)"
                  : "#171717";

              return (
                <div
                  key={envelope.id}
                  className="group relative flex flex-col justify-between p-4 rounded-xl"
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    boxShadow: (isUnlocking || isReady)
                      ? `0 0 24px rgba(${isUnlocking ? "255,184,0" : "190,245,50"},0.06)`
                      : "none",
                    opacity: isPaid ? 0.6 : 1,
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  }}
                >
                  {/* Accent top bar */}
                  {(isUnlocking || isReady) && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: accent }} />
                  )}

                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{
                            background: (isUnlocking || isReady) ? `rgba(${isUnlocking ? "255,184,0" : "190,245,50"},0.12)` : "#202020",
                            color: (isUnlocking || isReady) ? accent : "#808080",
                          }}
                        >
                          <EnvIcon icon={envelope.icon} size={16} />
                        </div>
                        <div>
                          <h3 className="font-body-md text-body-md font-semibold text-white leading-tight group-hover:text-[#bef532] transition-colors">
                            {envelope.name}
                          </h3>
                          <p className="font-label-sm text-label-sm" style={{ color: "#808080" }}>
                            {envelope.categoryLabel}
                          </p>
                        </div>
                      </div>
                      <EnvelopeStatusBadge status={envelope.status} />
                    </div>

                    {/* Recipient tag */}
                    <div
                      className="px-3 py-1.5 rounded-lg flex items-center justify-between"
                      style={{ background: "rgba(0,0,0,0.3)" }}
                    >
                      <span className="font-label-sm text-label-sm uppercase font-mono" style={{ color: "#808080" }}>
                        To
                      </span>
                      <span className="font-body-sm text-body-sm font-medium text-white truncate ml-2">
                        {envelope.recipient}
                      </span>
                    </div>

                    {/* Amount */}
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                        Secured Capital
                      </span>
                      <div className="mt-1">
                        <CurrencyDisplay amount={envelope.amount} size="lg" />
                      </div>
                    </div>

                    {/* Lock progress */}
                    {!isPaid && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>Countdown</span>
                          <span
                            className="font-mono font-semibold text-[11px] tracking-wider"
                            style={{ color: accent, fontFeatureSettings: '"tnum" 1' }}
                          >
                            {countdown}
                          </span>
                        </div>
                        <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: "#242424" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.round(elapsed * 100)}%`, background: accent }}
                          />
                        </div>
                        <span className="font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                          Matures: <span className="text-white">{maturity}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/envelopes/${envelope.id}`}
                    className="mt-4 w-full py-2.5 px-3 rounded-lg font-body-sm text-body-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
                    style={
                      isReady
                        ? { background: "#bef532", color: "#000000" }
                        : isUnlocking
                          ? { background: "rgba(255,184,0,0.10)", color: "#ffb800", border: "1px solid rgba(255,184,0,0.25)" }
                          : { background: "#202020", color: "#b5b5b5", border: "1px solid #303030" }
                    }
                  >
                    {isReady ? "Confirm Payment" : "View Details"}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              );
            })}

            {/* Add new envelope card */}
            {filter === "all" && !search && availableFunds > 0 && (
              <Link
                href="/envelopes/new"
                className="group flex flex-col items-center justify-center p-6 rounded-xl gap-3 text-center transition-all"
                style={{ background: "transparent", border: "1px dashed #303030" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#171717"; (e.currentTarget as HTMLElement).style.borderColor = "#bef532"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "#303030"; }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: "#202020" }}
                >
                  <Plus size={20} style={{ color: "#bef532" }} />
                </div>
                <div>
                  <p className="font-body-md text-body-md font-semibold text-white">New Envelope</p>
                  <p className="font-body-sm text-body-sm mt-0.5" style={{ color: "#808080" }}>
                    {privacyMode ? "Funds available" : `${formatRWF(availableFunds)} RWF`} free
                  </p>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
