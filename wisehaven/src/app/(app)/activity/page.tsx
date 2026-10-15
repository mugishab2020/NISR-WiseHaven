"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import EmptyState from "@/components/ui/EmptyState";
import { formatRWF } from "@/lib/currency";
import { formatActivityDate } from "@/lib/dates";
import type { TransactionType } from "@/types";
import {
  ArrowDownRight, Shield, Lock, CheckCircle, Receipt, Search
} from "lucide-react";

const TYPE_FILTERS: { label: string; value: TransactionType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Deposits", value: "deposit" },
  { label: "Vault", value: "vault_sweep" },
  { label: "Allocations", value: "envelope_allocation" },
  { label: "Payments", value: "envelope_payment" },
];

const TX_ICONS: Record<TransactionType, typeof Receipt> = {
  deposit: ArrowDownRight,
  vault_sweep: Shield,
  envelope_allocation: Lock,
  envelope_payment: CheckCircle,
  envelope_cancelled: Receipt,
  vault_withdrawal: ArrowDownRight,
};

const TX_LABELS: Record<TransactionType, string> = {
  deposit: "Deposit",
  vault_sweep: "Vault Sweep",
  envelope_allocation: "Envelope Locked",
  envelope_payment: "Simulated Payment",
  envelope_cancelled: "Cancelled",
  vault_withdrawal: "Vault Withdrawal",
};

export default function ActivityPage() {
  const { account, privacyMode } = useApp();
  const [filter, setFilter] = useState<TransactionType | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = account.transactions.filter((tx) => {
    const matchType = filter === "all" || tx.type === filter;
    const matchSearch =
      !search ||
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.subDescription.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalIn = account.transactions
    .filter((tx) => tx.direction === "in")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalOut = account.transactions
    .filter((tx) => tx.direction === "out")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-6">
        {/* Header */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={14} className="text-outline" />
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
              Audit Log
            </span>
          </div>
          <h1 className="font-geist font-semibold text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
            Activity History
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            A full record of all simulated transactions in your WiseHaven demo.
          </p>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-4 rounded bg-surface-container-low border border-surface-container flex flex-col gap-1.5">
            <span className="font-label-sm text-label-sm text-outline uppercase">Total Records</span>
            <span className="font-mono font-bold text-headline-sm text-primary">
              {account.transactions.length}
            </span>
          </div>
          <div className="p-4 rounded bg-surface-container-low border border-surface-container flex flex-col gap-1.5">
            <span className="font-label-sm text-label-sm text-outline uppercase">Total Deposited</span>
            <span className="font-mono font-bold text-headline-sm text-primary-fixed">
              {privacyMode ? "••••••" : `+${formatRWF(totalIn)}`} RWF
            </span>
          </div>
          <div className="p-4 rounded bg-surface-container-low border border-surface-container flex flex-col gap-1.5 col-span-2 lg:col-span-1">
            <span className="font-label-sm text-label-sm text-outline uppercase">Total Allocated</span>
            <span className="font-mono font-bold text-headline-sm text-on-surface-variant">
              {privacyMode ? "••••••" : `-${formatRWF(totalOut)}`} RWF
            </span>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col gap-3 bg-surface-container-low border border-surface-container rounded p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded bg-surface-container text-primary placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary-fixed"
              placeholder="Search activity…"
              type="text"
              aria-label="Search activity"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all whitespace-nowrap ${filter === f.value ? "bg-primary-container text-on-primary" : "bg-surface-container hover:bg-surface-container-high text-secondary"}`}
                aria-pressed={filter === f.value}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No activity found"
            description={search ? "Try a different search term." : "No transactions match this filter."}
          />
        ) : (
          <div className="rounded-xl bg-surface-container-low border border-surface-container overflow-hidden">
            <div className="flex flex-col divide-y divide-surface-container">
              {filtered.map((tx) => {
                const Icon = TX_ICONS[tx.type] ?? Receipt;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${tx.direction === "in" ? "bg-primary-container/15 text-primary-fixed" : "bg-surface-container-high text-on-surface-variant"}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body-md text-body-md font-medium text-primary truncate">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`font-label-sm text-label-sm px-1.5 py-0.5 rounded-full font-medium ${tx.type === "deposit" ? "bg-primary-container/10 text-primary-fixed" : "bg-surface-container-high text-outline"}`}>
                            {TX_LABELS[tx.type]}
                          </span>
                          <span className="font-body-sm text-body-sm text-outline truncate">
                            {formatActivityDate(tx.timestamp)}
                          </span>
                        </div>
                        {tx.subDescription && (
                          <p className="font-body-sm text-body-sm text-outline truncate mt-0.5">
                            {tx.subDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className={`font-label-lg text-label-lg font-semibold font-mono ${tx.direction === "in" ? "text-primary-fixed" : "text-on-surface-variant"}`}>
                        {tx.direction === "in" ? "+" : tx.direction === "out" ? "-" : ""}
                        {privacyMode ? "••••••" : formatRWF(tx.amount)}
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">RWF</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="font-body-sm text-body-sm text-outline text-center">
          ⚠ All transactions are simulated demo data. No real money is involved.
        </p>
      </div>
    </AppShell>
  );
}
