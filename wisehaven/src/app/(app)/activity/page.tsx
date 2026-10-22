"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import EmptyState from "@/components/ui/EmptyState";
import { formatRWF } from "@/lib/currency";
import { formatActivityDate } from "@/lib/dates";
import type { TransactionType } from "@/types";
import { ArrowDownRight, Shield, Lock, CheckCircle, Receipt, Search } from "lucide-react";

const TYPE_FILTERS: { label: string; value: TransactionType | "all" }[] = [
  { label: "All",         value: "all"                  },
  { label: "Deposits",    value: "deposit"               },
  { label: "Vault",       value: "vault_sweep"           },
  { label: "Locked",      value: "envelope_allocation"   },
  { label: "Payments",    value: "envelope_payment"      },
];

const TX_ICONS: Record<TransactionType, typeof Receipt> = {
  deposit:              ArrowDownRight,
  vault_sweep:          Shield,
  envelope_allocation:  Lock,
  envelope_payment:     CheckCircle,
  envelope_cancelled:   Receipt,
  vault_withdrawal:     ArrowDownRight,
};

const TX_LABELS: Record<TransactionType, string> = {
  deposit:             "Deposit",
  vault_sweep:         "Vault Sweep",
  envelope_allocation: "Locked",
  envelope_payment:    "Simulated Payment",
  envelope_cancelled:  "Cancelled",
  vault_withdrawal:    "Vault Withdrawal",
};

const CARD: React.CSSProperties = { background: "#171717", border: "1px solid #242424", borderRadius: "12px" };

export default function ActivityPage() {
  const { account, privacyMode } = useApp();
  const [filter, setFilter] = useState<TransactionType | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = account.transactions.filter((tx) => {
    const matchType   = filter === "all" || tx.type === filter;
    const matchSearch = !search
      || tx.description.toLowerCase().includes(search.toLowerCase())
      || tx.subDescription.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalIn  = account.transactions.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
  const totalOut = account.transactions.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={13} style={{ color: "#808080" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#808080" }}>
              Audit Log
            </span>
          </div>
          <h1 className="font-geist font-semibold text-[28px] lg:text-[40px] text-white tracking-tight leading-none">
            Activity History
          </h1>
          <p className="font-body-md text-body-md mt-1.5" style={{ color: "#b5b5b5" }}>
            Full record of all simulated transactions in your WiseHaven demo.
          </p>
        </div>

        {/* ── Summary metrics ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Records",   value: account.transactions.length.toString(), mono: false, color: "#ffffff" },
            { label: "Total Deposited", value: privacyMode ? "••••••" : `+${formatRWF(totalIn)} RWF`,  mono: true,  color: "#bef532" },
            { label: "Total Allocated", value: privacyMode ? "••••••" : `-${formatRWF(totalOut)} RWF`, mono: true,  color: "#b5b5b5" },
          ].map(({ label, value, mono, color }) => (
            <div key={label} className="p-4 rounded-xl flex flex-col gap-2" style={CARD}>
              <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>{label}</span>
              <span className={`font-bold text-[18px] ${mono ? "font-mono" : "font-geist"}`} style={{ color }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Search + filter ──────────────────────────────── */}
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
              placeholder="Search activity…"
              aria-label="Search activity"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {TYPE_FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className="px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-all"
                  style={
                    active
                      ? { background: "#bef532", color: "#000000" }
                      : { background: "#202020", color: "#808080", border: "1px solid #303030" }
                  }
                  aria-pressed={active}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Transaction list ─────────────────────────────── */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No activity found"
            description={search ? "Try a different search term." : "No transactions match this filter."}
          />
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ background: "#171717", border: "1px solid #242424" }}>
            {filtered.map((tx, i) => {
              const Icon = TX_ICONS[tx.type] ?? Receipt;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-4 px-4 py-4 transition-colors"
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid #1a1a1a" : "none",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1d1d1d"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: tx.direction === "in" ? "rgba(190,245,50,0.08)" : "#202020",
                        color: tx.direction === "in" ? "#bef532" : "#808080",
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-body-md text-body-md font-medium text-white truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="font-label-sm text-label-sm px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: tx.type === "deposit" ? "rgba(190,245,50,0.08)" : "#202020",
                            color: tx.type === "deposit" ? "#bef532" : "#808080",
                          }}
                        >
                          {TX_LABELS[tx.type]}
                        </span>
                        <span className="font-body-sm text-body-sm truncate" style={{ color: "#808080" }}>
                          {formatActivityDate(tx.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className="font-mono font-semibold text-[13px]"
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
              );
            })}
          </div>
        )}

        <p className="font-body-sm text-body-sm text-center" style={{ color: "#808080" }}>
          ⚠ All transactions are simulated demo data. No real money is involved.
        </p>
      </div>
    </AppShell>
  );
}
