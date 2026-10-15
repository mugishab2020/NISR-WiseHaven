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
  Plus, Lock, Search, ArrowRight, Wallet, Home, ShoppingBasket,
  School, Zap, Truck, Heart, Users, Briefcase
} from "lucide-react";

const FILTER_PILLS: { label: string; value: EnvelopeStatus | "all" | "completed" }[] = [
  { label: "All", value: "all" },
  { label: "Locked", value: "locked" },
  { label: "Unlocking Soon", value: "unlocking_soon" },
  { label: "Ready to Pay", value: "ready_to_pay" },
  { label: "Paid / Completed", value: "paid" },
];

const ICON_MAP: Record<string, typeof Lock> = {
  home_work: Home,
  shopping_basket: ShoppingBasket,
  bolt: Zap,
  school: School,
  truck: Truck,
  heart: Heart,
  users: Users,
  briefcase: Briefcase,
};

function EnvIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICON_MAP[icon] ?? Lock;
  return <Icon size={18} className={className} />;
}

export default function EnvelopesPage() {
  const { account, availableFunds, privacyMode } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<EnvelopeStatus | "all" | "completed">("all");

  const totalInEnvelopes = account.envelopes
    .filter((e) => e.status !== "paid" && e.status !== "cancelled")
    .reduce((s, e) => s + e.amount, 0);

  const locked = account.envelopes.filter((e) => e.status === "locked");
  const unlocking = account.envelopes.filter((e) => e.status === "unlocking_soon");
  const ready = account.envelopes.filter((e) => e.status === "ready_to_pay");
  const paid = account.envelopes.filter((e) => e.status === "paid");

  const filtered = account.envelopes.filter((e) => {
    const matchesFilter =
      filter === "all"
        ? e.status !== "paid" && e.status !== "cancelled"
        : filter === "paid"
          ? e.status === "paid" || e.status === "cancelled"
          : e.status === filter;

    const matchesSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.categoryLabel.toLowerCase().includes(search.toLowerCase()) ||
      e.recipient.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 text-primary-fixed mb-1">
              <Lock size={14} />
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">
                Enforce Discipline • Kigali UTC+2
              </span>
            </div>
            <h1 className="font-geist font-semibold text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
              Your Envelopes
            </h1>
            <p className="font-body-md text-body-md text-secondary max-w-xl mt-1">
              Every envelope protects money for something that matters. Funds stay
              locked until their maturity date.
            </p>
          </div>
          <Link
            href="/envelopes/new"
            className="flex items-center gap-2 px-4 py-3 rounded bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary-container/10 self-start"
          >
            <Plus size={18} />
            Create New Envelope
          </Link>
        </div>

        {/* Metrics bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded bg-surface-container-low border border-surface-container flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline uppercase">Total in Envelopes</span>
              <Wallet size={16} className="text-primary-fixed" />
            </div>
            <CurrencyDisplay amount={totalInEnvelopes} size="md" />
            <span className="font-body-sm text-body-sm text-secondary">
              {account.envelopes.filter(e => e.status !== "paid" && e.status !== "cancelled").length} envelopes
            </span>
          </div>
          <div className="p-4 rounded bg-surface-container-low border border-surface-container flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline uppercase">Locked</span>
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-primary-fixed font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />
                {locked.length}
              </span>
            </div>
            <CurrencyDisplay amount={locked.reduce((s, e) => s + e.amount, 0)} size="md" />
            <span className="font-body-sm text-body-sm text-secondary">Non-negotiable</span>
          </div>
          <div className="p-4 rounded bg-surface-container-low border border-surface-container flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline uppercase">Unlocking Soon</span>
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-primary-container/10 text-primary-fixed font-mono animate-pulse">
                {unlocking.length}
              </span>
            </div>
            <CurrencyDisplay amount={unlocking.reduce((s, e) => s + e.amount, 0)} size="md" className="text-primary-fixed" />
            <span className="font-body-sm text-body-sm text-on-surface-variant">Maturing soon</span>
          </div>
          <div className="p-4 rounded bg-surface-container-low border border-surface-container flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline uppercase">Ready to Pay</span>
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-primary-container text-on-primary font-mono">
                {ready.length}
              </span>
            </div>
            <CurrencyDisplay amount={ready.reduce((s, e) => s + e.amount, 0)} size="md" className={ready.length > 0 ? "text-primary-fixed" : "text-outline"} />
            <span className="font-body-sm text-body-sm text-secondary">
              {ready.length > 0 ? "Confirm payment" : "All secured"}
            </span>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col gap-3 bg-surface-container-low p-4 rounded border border-surface-container">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-9 pr-4 rounded bg-surface-container text-primary placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary-fixed transition-all"
              placeholder="Search by name, category, or recipient…"
              type="text"
              aria-label="Search envelopes"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {FILTER_PILLS.map((p) => (
              <button
                key={p.value}
                onClick={() => setFilter(p.value)}
                className={`
                  px-3 py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all whitespace-nowrap flex items-center gap-1.5
                  ${filter === p.value
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container hover:bg-surface-container-high text-secondary"
                  }
                `}
                aria-pressed={filter === p.value}
              >
                {p.value === "unlocking_soon" && (
                  <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                )}
                {p.label}{" "}
                <span className="opacity-70">
                  ({p.value === "all"
                    ? account.envelopes.filter(e => e.status !== "paid" && e.status !== "cancelled").length
                    : p.value === "paid"
                      ? paid.length
                      : account.envelopes.filter(e => e.status === p.value).length
                  })
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Envelopes grid */}
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
              const elapsed = calcElapsedFraction(envelope.createdAt, envelope.maturityDate);
              const countdown = formatCountdown(envelope.maturityDate);
              const maturityStr = formatDate(envelope.maturityDate);
              const isActive = envelope.status === "unlocking_soon" || envelope.status === "ready_to_pay";

              return (
                <div
                  key={envelope.id}
                  className={`
                    group relative flex flex-col justify-between p-4 rounded border transition-all
                    ${isActive
                      ? "bg-surface-container-high border-primary-fixed/40 hover:border-primary-fixed shadow-lg"
                      : envelope.status === "paid"
                        ? "bg-surface-container-lowest border-surface-container opacity-70"
                        : "bg-surface-container-low border-surface-container hover:bg-surface-container hover:border-surface-variant"
                    }
                  `}
                >
                  {/* Accent top bar */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-fixed rounded-t" />
                  )}

                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${isActive ? "bg-primary-container text-on-primary" : "bg-surface-container-high text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-colors"}`}>
                          <EnvIcon icon={envelope.icon} />
                        </div>
                        <div>
                          <h3 className="font-headline-sm text-headline-sm font-semibold text-primary leading-tight">
                            {envelope.name}
                          </h3>
                          <span className="font-label-sm text-label-sm text-outline">
                            {envelope.categoryLabel}
                          </span>
                        </div>
                      </div>
                      <EnvelopeStatusBadge status={envelope.status} />
                    </div>

                    {/* Recipient */}
                    <div className="px-3 py-1.5 rounded bg-surface-container flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-outline uppercase font-mono">
                        Recipient
                      </span>
                      <span className="text-on-surface font-medium font-body-sm text-body-sm truncate ml-2 text-right">
                        {envelope.recipient}
                      </span>
                    </div>

                    {/* Amount */}
                    <div>
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                        Secured Capital
                      </span>
                      <div className="mt-0.5">
                        <CurrencyDisplay amount={envelope.amount} size="lg" className={isActive ? "text-primary-fixed" : undefined} />
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-label-sm text-label-sm">
                        <span className="text-outline font-mono">Countdown</span>
                        <span className={`font-mono font-medium ${isActive ? "text-primary-fixed font-bold" : "text-primary"}`}>
                          {countdown}
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-1.5 rounded overflow-hidden flex gap-0.5">
                        <div
                          className="bg-primary-fixed h-full"
                          style={{ width: `${Math.round(elapsed * 100)}%` }}
                        />
                        <div
                          className="bg-surface-variant h-full flex-1"
                        />
                      </div>
                      <div className="flex items-center justify-between font-label-sm text-label-sm text-secondary pt-0.5">
                        <span>Matures: <strong className="text-on-surface">{maturityStr}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/envelopes/${envelope.id}`}
                    className={`
                      mt-4 w-full py-2.5 px-3 rounded font-body-sm text-body-sm font-medium flex items-center justify-center gap-1.5 transition-colors
                      ${envelope.status === "ready_to_pay"
                        ? "bg-primary-container hover:opacity-90 text-on-primary font-semibold"
                        : "bg-surface-container hover:bg-surface-container-high text-primary group-hover:text-primary-fixed"
                      }
                    `}
                  >
                    {envelope.status === "ready_to_pay" ? "Confirm Payment" : "View Details"}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}

            {/* Add envelope card */}
            {filter === "all" && !search && availableFunds > 0 && (
              <Link
                href="/envelopes/new"
                className="group relative flex flex-col justify-between p-4 rounded bg-surface-container-low/40 hover:bg-surface-container-low transition-all border border-dashed border-surface-container-high"
              >
                <div className="flex flex-col items-center text-center justify-center h-full py-8 gap-3">
                  <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary-fixed group-hover:scale-110 transition-transform shadow-md">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-semibold text-primary">
                      Add Priority Envelope
                    </h4>
                    <p className="font-body-sm text-body-sm text-secondary mt-1">
                      Give your{" "}
                      <span className="text-primary-fixed font-semibold font-mono">
                        {privacyMode ? "••••••" : `${formatRWF(availableFunds)} RWF`}
                      </span>{" "}
                      a destination.
                    </p>
                  </div>
                  <span className="mt-2 px-4 py-2 rounded bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-primary font-body-md text-body-md font-semibold transition-all flex items-center gap-2">
                    <Lock size={14} />
                    Create Envelope
                  </span>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
