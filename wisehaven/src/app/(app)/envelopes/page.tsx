"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import { formatRWF } from "@/lib/currency";
import type { EnvelopeResponse } from "@/lib/api";
import {
  Plus, Lock, Search, ArrowRight, Wallet,
  Home, ShoppingBasket, School, Zap, Truck, Heart,
} from "lucide-react";

const ICON_MAP: Record<string, typeof Lock> = {
  Rent: Home, Food: ShoppingBasket, Utilities: Zap,
  Education: School, Transport: Truck, Healthcare: Heart,
  Custom: Lock, Emergency: Lock,
};

function EnvIcon({ category, size = 18 }: { category: string; size?: number }) {
  const Icon = ICON_MAP[category] ?? Lock;
  return <Icon size={size} />;
}

type FilterValue = "all" | "locked" | "released" | "no_lock" | "vault";

const FILTER_PILLS: { label: string; value: FilterValue }[] = [
  { label: "All Active",    value: "all"      },
  { label: "Locked",        value: "locked"   },
  { label: "Ready to Pay",  value: "released" },
  { label: "No Lock",       value: "no_lock"  },
];

const CARD: React.CSSProperties = { background: "#171717", border: "1px solid #242424", borderRadius: "12px" };

function getLockStatus(env: EnvelopeResponse): FilterValue {
  if (!env.temporal_lock) return "no_lock";
  return env.temporal_lock.status === "LOCKED" ? "locked" : "released";
}

function formatCountdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Matured";
  const days  = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d`;
  const hrs = Math.floor(diff / 3600000);
  return `${hrs}h`;
}

export default function EnvelopesPage() {
  const { state, privacyMode } = useApp();
  const envelopes = state.envelopes.filter((e) => !e.is_emergency_vault);
  const availFunds = state.availableBalance;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const locked   = envelopes.filter((e) => e.temporal_lock?.status === "LOCKED");
  const released = envelopes.filter((e) => e.temporal_lock?.status === "RELEASED");
  const noLock   = envelopes.filter((e) => !e.temporal_lock);

  const filtered = envelopes.filter((e) => {
    const matchFilter = filter === "all" ? true : getLockStatus(e) === filter;
    const matchSearch = !search
      || e.name.toLowerCase().includes(search.toLowerCase())
      || e.category.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalInEnvelopes = envelopes.reduce((s, e) => s + Number(e.balance) + Number(e.locked_balance ?? 0), 0);

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock size={13} style={{ color: "#bef532" }} />
              <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#bef532" }}>
                Enforce Discipline
              </span>
            </div>
            <h1 className="font-geist font-semibold text-[28px] lg:text-[40px] text-white tracking-tight leading-none">Your Envelopes</h1>
            <p className="font-body-md text-body-md mt-1.5 max-w-lg" style={{ color: "#b5b5b5" }}>
              Every envelope protects demo money for something that matters.
            </p>
          </div>
          <Link href="/envelopes/new"
            className="flex items-center gap-2 px-5 py-3 rounded-lg font-body-md text-body-md font-semibold transition-opacity hover:opacity-90 self-start"
            style={{ background: "#bef532", color: "#000000" }}>
            <Plus size={16} />New Envelope
          </Link>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "In Envelopes", value: totalInEnvelopes, count: `${envelopes.length} active`, icon: Wallet },
            { label: "Locked",       value: envelopes.reduce((s,e)=>s+Number(e.locked_balance ?? 0)+(e.temporal_lock?.status === "LOCKED" ? Number(e.balance) : 0),0),  count: `${locked.length + envelopes.filter((e) => Number(e.locked_balance ?? 0) > 0).length} envelopes`,  icon: Lock },
            { label: "Ready to Pay", value: released.reduce((s,e)=>s+Number(e.balance),0), count: released.length > 0 ? "Confirm payment" : "All secured", icon: ArrowRight },
            { label: "Available Now", value: envelopes.filter((e) => e.temporal_lock?.status !== "LOCKED").reduce((s,e)=>s+Number(e.balance),0), count: `${noLock.length} envelopes`, icon: Wallet },
          ].map(({ label, value, count, icon: Icon }) => (
            <div key={label} className="p-4 rounded-xl flex flex-col gap-2" style={CARD}>
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>{label}</span>
                <Icon size={14} style={{ color: "#bef532" }} />
              </div>
              <CurrencyDisplay amount={value} size="md" />
              <span className="font-body-sm text-body-sm" style={{ color: "#808080" }}>{count}</span>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col gap-3 p-4 rounded-xl" style={CARD}>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#808080" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg font-body-sm text-body-sm text-white placeholder:text-[#808080] focus:outline-none"
              style={{ background: "#0d0d0d", border: "1px solid #303030" }}
              placeholder="Search envelopes…" aria-label="Search envelopes"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {FILTER_PILLS.map((p) => {
              const isActive = filter === p.value;
              return (
                <button key={p.value} onClick={() => setFilter(p.value)}
                  className="px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-all"
                  style={isActive ? { background: "#bef532", color: "#000000" } : { background: "#202020", color: "#808080", border: "1px solid #303030" }}>
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState icon={Lock} title={search ? "No results found" : "No envelopes here"}
            description={search ? "Try a different search." : "Create your first envelope to start saving."}
            actionLabel={!search && filter === "all" ? "Create Envelope" : undefined}
            actionHref="/envelopes/new"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((envelope) => {
              const lock = envelope.temporal_lock;
              const isLocked   = lock?.status === "LOCKED";
              const isReleased = lock?.status === "RELEASED";
              const accent = isReleased ? "#bef532" : isLocked ? "#bef532" : "#808080";
              const border = isReleased ? "rgba(190,245,50,0.25)" : isLocked ? "#242424" : "#242424";

              return (
                <div key={envelope.id} className="group relative flex flex-col justify-between p-4 rounded-xl"
                  style={{ background: "#171717", border: `1px solid ${border}`, transition: "border-color 0.15s ease" }}>
                  {isReleased && <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: "#bef532" }} />}

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#202020", color: accent }}>
                          <EnvIcon category={envelope.category} size={16} />
                        </div>
                        <div>
                          <h3 className="font-body-md text-body-md font-semibold text-white leading-tight group-hover:text-[#bef532] transition-colors">
                            {envelope.name}
                          </h3>
                          <p className="font-label-sm text-label-sm" style={{ color: "#808080" }}>{envelope.category}</p>
                        </div>
                      </div>
                      {lock ? (
                        <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold"
                          style={isLocked ? { background: "rgba(190,245,50,0.08)", color: "#bef532" } : { background: "#bef532", color: "#000" }}>
                          {isLocked ? "Locked" : "Ready"}
                        </span>
                      ) : envelope.allowance_schedule ? (
                        <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold" style={{ background: "rgba(190,245,50,0.08)", color: "#bef532" }}>
                          {envelope.allowance_schedule.frequency === "DAILY" ? "Daily allowance" : "Weekly allowance"}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm" style={{ background: "#202020", color: "#808080" }}>No lock</span>
                      )}
                    </div>

                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Available</span>
                      <div className="mt-1"><CurrencyDisplay amount={Number(envelope.balance)} size="lg" /></div>
                      {Number(envelope.locked_balance) > 0 && (
                        <p className="font-body-sm text-body-sm mt-1" style={{ color: "#808080" }}>
                          {formatRWF(Number(envelope.locked_balance))} RWF still locked
                        </p>
                      )}
                      {envelope.allowance_schedule?.is_active && (
                        <p className="font-body-sm text-body-sm mt-1" style={{ color: "#bef532" }}>
                          {formatRWF(Number(envelope.allowance_schedule.release_amount))} RWF next on {new Date(envelope.allowance_schedule.next_release_at).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {lock && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>Maturity</span>
                          <span className="font-mono font-semibold text-[11px]" style={{ color: accent }}>
                            {isLocked ? formatCountdown(lock.maturity_timestamp) : "Matured"}
                          </span>
                        </div>
                        <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: "#242424" }}>
                          <div className="h-full rounded-full" style={{ width: isReleased ? "100%" : "50%", background: accent }} />
                        </div>
                        <span className="font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                          {new Date(lock.maturity_timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link href={`/envelopes/${envelope.id}`}
                    className="mt-4 w-full py-2.5 px-3 rounded-lg font-body-sm text-body-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
                    style={isReleased ? { background: "#bef532", color: "#000000" } : { background: "#202020", color: "#b5b5b5", border: "1px solid #303030" }}>
                    {isReleased ? "Confirm Payment" : "View Details"}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              );
            })}

            {filter === "all" && !search && availFunds > 0 && (
              <Link href="/envelopes/new"
                className="group flex flex-col items-center justify-center p-6 rounded-xl gap-3 text-center transition-all"
                style={{ background: "transparent", border: "1px dashed #303030" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#171717"; (e.currentTarget as HTMLElement).style.borderColor = "#bef532"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "#303030"; }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: "#202020" }}>
                  <Plus size={20} style={{ color: "#bef532" }} />
                </div>
                <div>
                  <p className="font-body-md text-body-md font-semibold text-white">New Envelope</p>
                  <p className="font-body-sm text-body-sm mt-0.5" style={{ color: "#808080" }}>
                    {privacyMode ? "Funds available" : `${formatRWF(availFunds)} RWF`} free
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
