"use client";

import { useState } from "react";
import { Lock, X, Home, ShoppingBasket, Zap, Target, Calendar } from "lucide-react";

interface EnvelopeData {
  id: string;
  name: string;
  category: string;
  amount: string;
  amountNum: number;
  recipient: string;
  maturity: string;
  countdown: string;
  status: "locked" | "upcoming" | "ready";
  pct: number;
  icon: typeof Lock;
  purpose: string;
  details: string;
}

const ENVELOPES: EnvelopeData[] = [
  {
    id: "e1",
    name: "Rent & Service Charge",
    category: "Shelter",
    amount: "100,000",
    amountNum: 100000,
    recipient: "Landlord — Kigali Heights #4B",
    maturity: "25 Oct 2026",
    countdown: "9d 14h",
    status: "locked",
    pct: 58,
    icon: Home,
    purpose: "Monthly rent for your primary residence.",
    details:
      "This envelope locks your rent allocation until the due date, ensuring it cannot be spent on anything else. When it matures, you review the recipient details and confirm the payment — nothing moves automatically.",
  },
  {
    id: "e2",
    name: "Food & Essentials",
    category: "Food",
    amount: "20,000",
    amountNum: 20000,
    recipient: "Personal Groceries · Kimironko",
    maturity: "19 Oct 2026",
    countdown: "3d 08h",
    status: "upcoming",
    pct: 88,
    icon: ShoppingBasket,
    purpose: "Bi-weekly grocery and household essentials budget.",
    details:
      "Pre-committing food funds at income time prevents the common pattern of spending on non-essentials early in the month, then having insufficient grocery money later. Funds are protected until grocery day.",
  },
  {
    id: "e3",
    name: "REG Cashpower & WASAC",
    category: "Utilities",
    amount: "15,000",
    amountNum: 15000,
    recipient: "REG Meter #0421-9982-11",
    maturity: "17 Oct 2026",
    countdown: "Ready",
    status: "ready",
    pct: 100,
    icon: Zap,
    purpose: "Monthly electricity and water bills.",
    details:
      "This envelope has reached its maturity date. The amount is now available for the next step: you review the meter number or bill ID, confirm the transaction, and the payment is recorded in your ledger. Nothing has moved yet.",
  },
  {
    id: "e4",
    name: "Education Installment",
    category: "Education",
    amount: "25,000",
    amountNum: 25000,
    recipient: "UR College of Science",
    maturity: "30 Oct 2026",
    countdown: "14d 02h",
    status: "locked",
    pct: 30,
    icon: Target,
    purpose: "Semester tuition instalment for University of Rwanda.",
    details:
      "Locking education funds prevents the common scenario where tuition money gets spent before the payment date arrives. The temporal lock enforces the commitment made at income receipt time.",
  },
];

const STATUS_STYLES = {
  locked: {
    badge: "bg-[#BEF532]/10 text-[#BEF532] border border-[#BEF532]/20",
    bar: "bg-[#BEF532]",
    label: "Locked",
  },
  upcoming: {
    badge: "bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20",
    bar: "bg-[#FFB800]",
    label: "Upcoming",
  },
  ready: {
    badge: "bg-[#BEF532] text-[#0a1200]",
    bar: "bg-[#BEF532]",
    label: "Ready",
  },
};

function EnvelopeCard({
  env,
  onClick,
}: {
  env: EnvelopeData;
  onClick: () => void;
}) {
  const s = STATUS_STYLES[env.status];
  const Icon = env.icon;

  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left bg-[#111111] border border-[#242424] rounded-2xl p-5 hover:border-[#BEF532]/30 hover:bg-[#131313] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#BEF532] focus-visible:outline-offset-2"
      aria-label={`View details for ${env.name} envelope`}
    >
      {/* Ready top accent */}
      {env.status === "ready" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#BEF532] rounded-t-2xl" />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#BEF532]/10 flex items-center justify-center group-hover:bg-[#BEF532]/15 transition-colors">
            <Icon size={16} className="text-[#BEF532]" />
          </div>
          <div>
            <p className="text-white text-[13px] font-semibold leading-tight" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
              {env.name}
            </p>
            <p className="text-[#606060] text-[11px] mt-0.5">{env.category}</p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${s.badge}`}>
          {s.label}
        </span>
      </div>

      {/* Amount */}
      <div className="mb-3">
        <span className="font-mono font-bold text-[26px] text-[#BEF532] tabular-nums">{env.amount}</span>
        <span className="text-[#606060] text-[12px] font-mono ml-1.5">RWF</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#1e1e1e] h-1 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${s.bar}`}
          style={{ width: `${env.pct}%` }}
        />
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#606060] text-[11px]">
          <Calendar size={10} />
          <span className="font-mono">{env.maturity}</span>
        </div>
        <span className={`font-mono text-[11px] font-bold ${env.status === "ready" ? "text-[#BEF532]" : "text-[#A3A3A3]"}`}>
          {env.countdown}
        </span>
      </div>

      {/* Hover hint */}
      <div className="mt-3 pt-3 border-t border-[#1a1a1a] flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <span className="text-[#606060] text-[11px]">View details</span>
        <span className="text-[#BEF532] text-[11px]">→</span>
      </div>
    </button>
  );
}

function DetailDialog({
  env,
  onClose,
}: {
  env: EnvelopeData;
  onClose: () => void;
}) {
  const s = STATUS_STYLES[env.status];
  const Icon = env.icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-env-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-[#111111] border border-[#303030] rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BEF532]/10 flex items-center justify-center">
              <Icon size={18} className="text-[#BEF532]" />
            </div>
            <div>
              <h2 id="dialog-env-title" className="text-white font-semibold text-[16px]" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                {env.name}
              </h2>
              <p className="text-[#606060] text-[12px]">{env.category} · Illustrative data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#606060] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close detail panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>
            {s.label}
          </span>
          {env.status !== "ready" && (
            <span className="text-[#A3A3A3] text-[12px] font-mono">{env.countdown} remaining</span>
          )}
          {env.status === "ready" && (
            <span className="text-[#BEF532] text-[12px] font-mono font-semibold">Maturity reached — awaiting your confirmation</span>
          )}
        </div>

        {/* Amount */}
        <div className="bg-[#0e0e0e] rounded-xl p-4 border border-[#1e1e1e]">
          <p className="text-[#606060] text-[11px] font-mono uppercase tracking-wider mb-1">Allocated amount</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-[32px] text-[#BEF532] tabular-nums">{env.amount}</span>
            <span className="text-[#BEF532]/60 font-mono text-[14px]">RWF</span>
          </div>
          <div className="w-full bg-[#1e1e1e] h-1.5 rounded-full overflow-hidden mt-3">
            <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${env.pct}%` }} />
          </div>
          <p className="text-[#606060] text-[11px] font-mono mt-1.5">{env.pct}% of lock period elapsed</p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Maturity date", value: env.maturity },
            { label: "Recipient", value: env.recipient },
          ].map((item) => (
            <div key={item.label} className="bg-[#0e0e0e] rounded-xl p-3 border border-[#1e1e1e]">
              <p className="text-[#606060] text-[10px] font-mono uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-white text-[12px] font-medium leading-tight">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Purpose */}
        <div>
          <p className="text-[#606060] text-[11px] font-mono uppercase tracking-wider mb-2">Purpose</p>
          <p className="text-[#A3A3A3] text-[13px] leading-relaxed">{env.purpose}</p>
        </div>

        {/* How it works */}
        <div className="bg-[#BEF532]/5 border border-[#BEF532]/15 rounded-xl p-4">
          <p className="text-[#BEF532] text-[11px] font-mono uppercase tracking-wider mb-2">How it works</p>
          <p className="text-[#A3A3A3] text-[12px] leading-relaxed">{env.details}</p>
        </div>

        {/* Disclaimer */}
        <p className="text-[#404040] text-[11px] text-center font-mono">
          ⚠ This is illustrative data only. No real funds are held or transferred.
        </p>
      </div>
    </div>
  );
}

export default function EnvelopeShowcase() {
  const [selected, setSelected] = useState<EnvelopeData | null>(null);

  return (
    <section className="py-24 bg-[#060606]" aria-labelledby="envelope-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-xl mb-14">
          <p className="text-[#BEF532] text-[11px] font-mono uppercase tracking-widest mb-3">Envelopes</p>
          <h2
            id="envelope-heading"
            className="text-[36px] sm:text-[44px] font-bold leading-[1.1] tracking-[-0.025em] text-white mb-4"
            style={{ fontFamily: "Geist, Inter, sans-serif" }}
          >
            Every goal deserves<br />its own space.
          </h2>
          <p className="text-[#A3A3A3] text-[16px] leading-relaxed">
            Each envelope holds a specific allocation, protected until the date you chose.
            Click any card to see how it works.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ENVELOPES.map((env) => (
            <EnvelopeCard key={env.id} env={env} onClick={() => setSelected(env)} />
          ))}
        </div>

        {/* Status legend */}
        <div className="mt-8 flex flex-wrap gap-4 items-center">
          <span className="text-[#404040] text-[11px] font-mono uppercase tracking-wider">Status key:</span>
          {(["locked", "upcoming", "ready"] as const).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[s].badge}`}>
                {STATUS_STYLES[s].label}
              </span>
              <span className="text-[#606060] text-[11px]">
                {s === "locked" && "— not yet matured"}
                {s === "upcoming" && "— matures within 48h"}
                {s === "ready" && "— awaiting your confirmation"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail dialog */}
      {selected && (
        <DetailDialog
          env={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
