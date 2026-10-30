"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import EmptyState from "@/components/ui/EmptyState";
import { formatRWF } from "@/lib/currency";
import { ArrowDownRight, Shield, Lock, CheckCircle, Receipt, Search } from "lucide-react";

// Map backend transaction_type → display label and direction
const TX_META: Record<string, { label: string; direction: "in" | "out" | "neutral"; icon: typeof Receipt }> = {
  MANUAL_DEPOSIT: { label: "Demo Deposit",   direction: "in",      icon: ArrowDownRight },
  FIRST_SWEEP:    { label: "Vault Sweep",    direction: "in",      icon: Shield         },
  CREDIT:         { label: "Allocated",      direction: "in",      icon: Lock           },
  ALLOCATION:     { label: "Allocated",      direction: "out",     icon: Lock           },
  DEBIT:          { label: "Simulated Pay",  direction: "out",     icon: CheckCircle    },
  DEPOSIT:        { label: "Demo Deposit",   direction: "in",      icon: ArrowDownRight },
  ALLOWANCE_RELEASE: { label: "Allowance Released", direction: "neutral", icon: Lock },
};

const FILTER_OPTIONS = [
  { label: "All",      value: "all"           },
  { label: "Deposits", value: "MANUAL_DEPOSIT"},
  { label: "Vault",    value: "FIRST_SWEEP"   },
  { label: "Locked",   value: "CREDIT"        },
  { label: "Payments", value: "DEBIT"         },
];

const CARD: React.CSSProperties = { background: "#171717", border: "1px solid #242424", borderRadius: "12px" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-RW", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function ActivityPage() {
  const { state, privacyMode } = useApp();
  const { transactions } = state;

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((tx) => {
    const matchType   = filter === "all" || tx.transaction_type === filter;
    const matchSearch = !search
      || tx.description.toLowerCase().includes(search.toLowerCase())
      || (tx.envelope_name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalIn  = transactions.filter((t) => TX_META[t.transaction_type]?.direction === "in").reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = transactions.filter((t) => TX_META[t.transaction_type]?.direction === "out").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6">
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={13} style={{ color: "#808080" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#808080" }}>Audit Log</span>
          </div>
          <h1 className="font-geist font-semibold text-[28px] lg:text-[40px] text-white tracking-tight leading-none">Activity History</h1>
          <p className="font-body-md text-body-md mt-1.5" style={{ color: "#b5b5b5" }}>
            Full record of all simulated transactions in your WiseHaven demo.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Records",   value: transactions.length.toString(), mono: false, color: "#ffffff" },
            { label: "Total Deposited", value: privacyMode ? "••••••" : `+${formatRWF(totalIn)} RWF`,  mono: true, color: "#bef532" },
            { label: "Total Debited",   value: privacyMode ? "••••••" : `-${formatRWF(totalOut)} RWF`, mono: true, color: "#b5b5b5" },
          ].map(({ label, value, mono, color }) => (
            <div key={label} className="p-4 rounded-xl flex flex-col gap-2" style={CARD}>
              <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>{label}</span>
              <span className={`font-bold text-[18px] ${mono ? "font-mono" : "font-geist"}`} style={{ color }}>{value}</span>
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
              placeholder="Search transactions…" aria-label="Search activity"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {FILTER_OPTIONS.map((f) => {
              const active = filter === f.value;
              return (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  className="px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-all"
                  style={active ? { background: "#bef532", color: "#000000" } : { background: "#202020", color: "#808080", border: "1px solid #303030" }}>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction list */}
        {filtered.length === 0 ? (
          <EmptyState icon={Receipt} title="No activity found" description={search ? "Try a different search term." : "No transactions match this filter."} />
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ background: "#171717", border: "1px solid #242424" }}>
            {filtered.map((tx, i) => {
              const meta = TX_META[tx.transaction_type] ?? { label: tx.transaction_type, direction: "neutral" as const, icon: Receipt };
              const Icon = meta.icon;
              return (
                <div key={tx.id}
                  className="flex items-center justify-between gap-4 px-4 py-4 transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #1a1a1a" : "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1d1d1d"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: meta.direction === "in" ? "rgba(190,245,50,0.08)" : "#202020", color: meta.direction === "in" ? "#bef532" : "#808080" }}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-body-md text-body-md font-medium text-white truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded font-medium"
                          style={{ background: meta.direction === "in" ? "rgba(190,245,50,0.08)" : "#202020", color: meta.direction === "in" ? "#bef532" : "#808080" }}>
                          {meta.label}
                        </span>
                        {tx.envelope_name && (
                          <span className="font-body-sm text-body-sm truncate" style={{ color: "#808080" }}>{tx.envelope_name}</span>
                        )}
                        <span className="font-body-sm text-body-sm" style={{ color: "#808080" }}>{formatDate(tx.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-mono font-semibold text-[13px]"
                      style={{ color: meta.direction === "in" ? "#bef532" : "#b5b5b5" }}>
                      {meta.direction === "in" ? "+" : meta.direction === "out" ? "−" : ""}
                      {privacyMode ? "••••••" : formatRWF(Number(tx.amount))}
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
