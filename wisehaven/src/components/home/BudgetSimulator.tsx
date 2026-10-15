"use client";

import { useState, useCallback } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────
function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

interface SimState {
  income: number;
  vaultPct: number;
  rent: number;
  food: number;
  utilities: number;
  other: number;
}

const DEFAULTS: SimState = {
  income: 250000,
  vaultPct: 10,
  rent: 100000,
  food: 20000,
  utilities: 15000,
  other: 25000,
};

// ── Slider ────────────────────────────────────────────────────
function Slider({
  label,
  sublabel,
  value,
  min,
  max,
  step,
  onChange,
  accent = false,
}: {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accent?: boolean;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-white text-[13px] font-medium" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
            {label}
          </label>
          {sublabel && <p className="text-[#606060] text-[11px]">{sublabel}</p>}
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`font-mono font-bold text-[15px] tabular-nums ${accent ? "text-[#BEF532]" : "text-white"}`}>
            {label === "Vault sweep" ? `${value}%` : fmt(value)}
          </span>
          {label !== "Vault sweep" && (
            <span className="text-[#606060] text-[11px] font-mono">RWF</span>
          )}
        </div>
      </div>
      <div className="relative h-2 bg-[#1e1e1e] rounded-full">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-150 ${accent ? "bg-[#BEF532]" : "bg-[#474746]"}`}
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={label}
        />
        {/* Thumb visual */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 shadow-lg transition-all duration-150 ${accent ? "border-[#BEF532] bg-[#0a1200]" : "border-[#606060] bg-[#171717]"}`}
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Allocation bar ────────────────────────────────────────────
function AllocationBar({ segments }: { segments: { label: string; value: number; total: number; color: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-2.5 w-full bg-[#1e1e1e] rounded-full overflow-hidden flex">
        {segments.map((s) => {
          const pct = s.total > 0 ? (s.value / s.total) * 100 : 0;
          return (
            <div
              key={s.label}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
              style={{ width: `${pct}%`, backgroundColor: s.color }}
              title={`${s.label}: ${fmt(s.value)} RWF`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => {
          const pct = s.total > 0 ? Math.round((s.value / s.total) * 100) : 0;
          return (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-[#808080] text-[11px]">{s.label}</span>
              <span className="text-white text-[11px] font-mono tabular-nums font-medium">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BudgetSimulator() {
  const [state, setState] = useState<SimState>(DEFAULTS);

  const vault = Math.round((state.income * state.vaultPct) / 100);
  const remaining = state.income - vault;
  const envelopeTotal = state.rent + state.food + state.utilities + state.other;
  const unallocated = remaining - envelopeTotal;
  const isOverallocated = unallocated < 0;

  const update = useCallback((key: keyof SimState, raw: number) => {
    setState((prev) => {
      const next = { ...prev, [key]: raw };
      return next;
    });
  }, []);

  const incomeMax = 2000000;
  const envelopeMax = (key: keyof SimState) => {
    const others = (["rent", "food", "utilities", "other"] as const)
      .filter((k) => k !== key)
      .reduce((sum, k) => sum + state[k], 0);
    const rem = state.income - vault;
    return Math.max(0, rem - others);
  };

  return (
    <section id="features" className="py-24 bg-[#0a0a0a]" aria-labelledby="sim-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="max-w-xl mb-14">
          <p className="text-[#BEF532] text-[11px] font-mono uppercase tracking-widest mb-3">Interactive demo</p>
          <h2
            id="sim-heading"
            className="text-[36px] sm:text-[44px] font-bold leading-[1.1] tracking-[-0.025em] text-white mb-4"
            style={{ fontFamily: "Geist, Inter, sans-serif" }}
          >
            Give every franc<br />a destination.
          </h2>
          <p className="text-[#A3A3A3] text-[16px] leading-relaxed">
            See how a simple plan turns an incoming amount into purposeful savings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Left: Controls ── */}
          <div className="bg-[#111111] border border-[#242424] rounded-2xl p-6 flex flex-col gap-6">
            {/* Demo label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#BEF532]/8 border border-[#BEF532]/20 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BEF532]" />
                <span className="text-[#BEF532] text-[10px] font-mono font-semibold uppercase tracking-wider">
                  Simulated money only
                </span>
              </div>
              <button
                onClick={() => setState(DEFAULTS)}
                className="flex items-center gap-1.5 text-[#606060] hover:text-white text-[12px] transition-colors"
                aria-label="Reset to example values"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Income */}
              <Slider
                label="Monthly income"
                sublabel="Incoming amount to allocate"
                value={state.income}
                min={10000}
                max={incomeMax}
                step={5000}
                onChange={(v) => update("income", v)}
                accent
              />

              <div className="border-t border-[#1e1e1e]" />

              {/* Vault pct */}
              <Slider
                label="Vault sweep"
                sublabel="Auto-deducted first into Emergency Vault"
                value={state.vaultPct}
                min={1}
                max={30}
                step={1}
                onChange={(v) => update("vaultPct", v)}
                accent
              />

              <div className="border-t border-[#1e1e1e]" />
              <p className="text-[#606060] text-[11px] font-mono uppercase tracking-wider -mb-2">Envelope allocations</p>

              <Slider
                label="Rent"
                value={state.rent}
                min={0}
                max={Math.min(500000, incomeMax)}
                step={5000}
                onChange={(v) => update("rent", clamp(v, 0, envelopeMax("rent")))}
              />
              <Slider
                label="Food & essentials"
                value={state.food}
                min={0}
                max={Math.min(300000, incomeMax)}
                step={1000}
                onChange={(v) => update("food", clamp(v, 0, envelopeMax("food")))}
              />
              <Slider
                label="Utilities"
                value={state.utilities}
                min={0}
                max={Math.min(200000, incomeMax)}
                step={1000}
                onChange={(v) => update("utilities", clamp(v, 0, envelopeMax("utilities")))}
              />
              <Slider
                label="Other goals"
                value={state.other}
                min={0}
                max={Math.min(300000, incomeMax)}
                step={5000}
                onChange={(v) => update("other", clamp(v, 0, envelopeMax("other")))}
              />
            </div>
          </div>

          {/* ── Right: Results ── */}
          <div className="flex flex-col gap-4">

            {/* Summary card */}
            <div className="bg-[#111111] border border-[#242424] rounded-2xl p-6 flex flex-col gap-5">
              <p className="text-[#808080] text-[11px] font-mono uppercase tracking-wider">Allocation breakdown</p>

              {/* Big income */}
              <div className="flex items-end gap-2 border-b border-[#1e1e1e] pb-4">
                <span className="text-[#BEF532] font-bold font-mono text-[36px] tabular-nums leading-none">{fmt(state.income)}</span>
                <span className="text-[#BEF532]/60 font-mono text-[14px] pb-1">RWF incoming</span>
              </div>

              {/* Line items */}
              <div className="flex flex-col gap-3">
                {[
                  { label: "Emergency Vault sweep", value: vault, color: "#BEF532", note: `${state.vaultPct}%` },
                  { label: "Rent envelope", value: state.rent, color: "#4ade80" },
                  { label: "Food & essentials", value: state.food, color: "#34d399" },
                  { label: "Utilities", value: state.utilities, color: "#2dd4bf" },
                  { label: "Other goals", value: state.other, color: "#22d3ee" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[#A3A3A3] text-[13px]">{item.label}</span>
                      {item.note && (
                        <span className="text-[10px] text-[#606060] font-mono bg-[#1e1e1e] px-1.5 rounded">
                          {item.note}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-semibold text-[13px] text-white tabular-nums">
                      {fmt(item.value)} <span className="text-[#606060] font-normal">RWF</span>
                    </span>
                  </div>
                ))}

                {/* Divider */}
                <div className="border-t border-[#1e1e1e] pt-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] font-semibold ${isOverallocated ? "text-red-400" : "text-[#BEF532]"}`}>
                      {isOverallocated ? "⚠ Over-allocated" : "Unallocated"}
                    </span>
                    <span className={`font-mono font-bold text-[15px] tabular-nums ${isOverallocated ? "text-red-400" : "text-white"}`}>
                      {fmt(Math.abs(unallocated))} <span className="text-[#606060] font-normal text-[13px]">RWF</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Allocation bar */}
              <AllocationBar
                segments={[
                  { label: "Vault", value: vault, total: state.income, color: "#BEF532" },
                  { label: "Envelopes", value: isOverallocated ? remaining : envelopeTotal, total: state.income, color: "#474746" },
                  { label: "Free", value: Math.max(0, unallocated), total: state.income, color: "#242424" },
                ]}
              />

              {/* Warning */}
              {isOverallocated && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/8 border border-red-500/20">
                  <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-[12px] leading-relaxed">
                    Your envelope allocations exceed the remaining amount after the vault sweep.
                    Reduce allocations by <strong>{fmt(Math.abs(unallocated))} RWF</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Presets */}
            <div className="bg-[#111111] border border-[#242424] rounded-2xl p-4">
              <p className="text-[#606060] text-[11px] font-mono uppercase tracking-wider mb-3">Quick presets</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Low income", income: 80000, rent: 30000, food: 15000, utilities: 8000, other: 5000, vault: 10 },
                  { label: "Mid salary", income: 250000, rent: 100000, food: 20000, utilities: 15000, other: 25000, vault: 10 },
                  { label: "High earner", income: 800000, rent: 300000, food: 80000, utilities: 40000, other: 100000, vault: 15 },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setState({ income: p.income, vaultPct: p.vault, rent: p.rent, food: p.food, utilities: p.utilities, other: p.other })}
                    className="px-3 py-1.5 rounded-lg border border-[#303030] text-[#A3A3A3] text-[12px] hover:border-[#BEF532]/40 hover:text-white hover:bg-[#BEF532]/5 transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
