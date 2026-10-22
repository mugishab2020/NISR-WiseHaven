"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector,
} from "recharts";
import { RotateCcw, AlertTriangle, Plus, X } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────
function fmt(n: number): string { return Math.round(n).toLocaleString("en-US"); }
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

// ── Types ─────────────────────────────────────────────────────
interface CustomEnvelope { id: string; name: string; amount: number; }
interface SimState {
  income: number; vaultPct: number;
  rent: number; food: number; utilities: number; other: number;
  custom: CustomEnvelope[];
}

const DEFAULTS: SimState = {
  income: 250000, vaultPct: 10,
  rent: 100000, food: 20000, utilities: 15000, other: 25000,
  custom: [],
};

const ENVELOPE_COLORS = [
  "#a78bfa","#f472b6","#fb923c","#facc15",
  "#38bdf8","#4ade80","#f87171","#c084fc",
];

// ── Per-letter hover heading ──────────────────────────────────
function HoverHeading() {
  const lines = ["Give every franc", "a destination."];
  return (
    <h2
      className="text-[40px] sm:text-[52px] font-bold leading-[1.08] tracking-[-0.03em] text-white select-none text-center w-full"
      style={{ fontFamily: "Geist, Inter, sans-serif" }}
      aria-label={lines.join(" ")}
    >
      {lines.map((line, li) => (
        <span key={li} className="block text-center">
          {line.split("").map((char, ci) => (
            <motion.span
              key={`${li}-${ci}`}
              className="inline-block"
              style={{ whiteSpace: "pre" }}
              initial={false}
              whileHover={char !== " " ? { scale: 1.35, color: "#BEF532", y: -4 } : {}}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </span>
      ))}
    </h2>
  );
}

// ── Animated number ───────────────────────────────────────────
function AnimatedNumber({ value, color = "#ffffff" }: { value: number; color?: string }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 350);
      return () => clearTimeout(t);
    }
  }, [value]);
  return (
    <span
      className="font-mono font-bold tabular-nums inline-block"
      style={{
        color: flash ? "#BEF532" : color,
        transform: flash ? "scale(1.08)" : "scale(1)",
        transition: "color 0.15s ease, transform 0.15s ease",
      }}
    >
      {fmt(value)}
    </span>
  );
}

// ── Custom active pie shape ───────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      {/* Outer glow ring */}
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 4} outerRadius={outerRadius + 10}
        startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.18} />
      {/* Main sector — slightly expanded */}
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      {/* Centre label */}
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#ffffff"
        style={{ fontSize: "13px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#BEF532"
        style={{ fontSize: "20px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
        {fmt(payload.value)}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="#606060"
        style={{ fontSize: "11px", fontFamily: "monospace" }}>
        {(percent * 100).toFixed(1)}% · RWF
      </text>
    </g>
  );
}

// ── Tooltip ───────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="px-3 py-2 rounded-lg text-[12px] font-mono"
      style={{ background: "#111", border: `1px solid ${d.payload.color}40`, color: "#fff" }}>
      <span style={{ color: d.payload.color }}>{d.name}</span>
      <span className="ml-2 text-white">{fmt(d.value)} RWF</span>
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────
function StatusPill({ unallocated, income }: { unallocated: number; income: number }) {
  const pct = income > 0 ? Math.round(((income - Math.max(0, unallocated)) / income) * 100) : 0;
  const isOver  = unallocated < 0;
  const isFull  = unallocated === 0;
  const isClose = unallocated > 0 && unallocated <= income * 0.05;

  const color  = isOver ? "#f87171" : isFull ? "#BEF532" : isClose ? "#fbbf24" : "#606060";
  const bg     = isOver ? "rgba(248,113,113,0.08)" : isFull ? "rgba(190,245,50,0.08)" : isClose ? "rgba(251,191,36,0.08)" : "#1a1a1a";
  const border = isOver ? "rgba(248,113,113,0.25)" : isFull ? "rgba(190,245,50,0.25)" : isClose ? "rgba(251,191,36,0.25)" : "#2a2a2a";
  const label  = isOver
    ? `Over by ${fmt(Math.abs(unallocated))} RWF`
    : isFull  ? "Every franc has a purpose ✓"
    : isClose ? `Almost there — ${fmt(unallocated)} RWF left`
    :           `${fmt(unallocated)} RWF unallocated`;

  return (
    <motion.div animate={{ background: bg, borderColor: border }} transition={{ duration: 0.3 }}
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ border: `1px solid ${border}`, background: bg }}>
      <div className="flex items-center gap-2.5">
        <motion.span animate={{ backgroundColor: color, boxShadow: isFull ? "0 0 10px rgba(190,245,50,0.7)" : "none" }}
          transition={{ duration: 0.3 }} className="w-2 h-2 rounded-full shrink-0" />
        <motion.span animate={{ color }} transition={{ duration: 0.3 }} className="text-[13px] font-medium">
          {label}
        </motion.span>
      </div>
      <motion.span animate={{ color }} transition={{ duration: 0.3 }}
        className="font-mono font-bold text-[13px] tabular-nums">
        {pct}%
      </motion.span>
    </motion.div>
  );
}

// ── Slider ────────────────────────────────────────────────────
function Slider({ label, sublabel, value, min, max, step, onChange, accent = false }: {
  label: string; sublabel?: string; value: number;
  min: number; max: number; step: number;
  onChange: (v: number) => void; accent?: boolean;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-white text-[13px] font-medium" style={{ fontFamily: "Geist, Inter, sans-serif" }}>{label}</label>
          {sublabel && <p className="text-[#606060] text-[11px]">{sublabel}</p>}
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`font-mono font-bold text-[15px] tabular-nums ${accent ? "text-[#BEF532]" : "text-white"}`}>
            {label === "Vault sweep" ? `${value}%` : fmt(value)}
          </span>
          {label !== "Vault sweep" && <span className="text-[#606060] text-[11px] font-mono">RWF</span>}
        </div>
      </div>
      <div className="relative h-2 bg-[#1e1e1e] rounded-full">
        <div className={`absolute left-0 top-0 h-full rounded-full transition-all duration-150 ${accent ? "bg-[#BEF532]" : "bg-[#474746]"}`} style={{ width: `${pct}%` }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label={label} />
        <div className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 shadow-lg transition-all duration-150 ${accent ? "border-[#BEF532] bg-[#0a1200]" : "border-[#606060] bg-[#171717]"}`}
          style={{ left: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Income input ──────────────────────────────────────────────
function IncomeInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(value.toString());
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    setRaw(digits);
    const n = parseInt(digits, 10);
    if (!isNaN(n) && n > 0) onChange(clamp(n, 1000, 99_000_000));
  };
  const handleFocus = () => { setFocused(true); setRaw(value.toString()); };
  const handleBlur  = () => {
    setFocused(false);
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < 1000) setRaw(value.toString());
    else { const c = clamp(n, 1000, 99_000_000); onChange(c); setRaw(c.toString()); }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-white text-[13px] font-medium" style={{ fontFamily: "Geist, Inter, sans-serif" }}>Monthly income</p>
        <p className="text-[#606060] text-[11px]">Enter your incoming amount to allocate</p>
      </div>
      <div className="flex items-center rounded-lg overflow-hidden"
        style={{
          border: focused ? "1px solid rgba(190,245,50,0.50)" : "1px solid #2a2a2a",
          background: "#0d0d0d",
          boxShadow: focused ? "0 0 0 3px rgba(190,245,50,0.07)" : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}>
        <input type="text" inputMode="numeric"
          value={focused ? raw : fmt(value)}
          onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
          className="flex-1 bg-transparent text-[#BEF532] font-mono font-bold text-[22px] tabular-nums px-4 py-3 outline-none min-w-0"
          aria-label="Monthly income in RWF" placeholder="0" />
        <span className="text-[#BEF532]/50 font-mono text-[13px] pr-4 shrink-0">RWF</span>
      </div>
    </div>
  );
}

// ── Legend row ────────────────────────────────────────────────
function LegendRow({
  label, value, color, active, onHover,
}: {
  label: string; value: number; color: string; active: boolean; onHover: () => void;
}) {
  return (
    <motion.div
      onHoverStart={onHover}
      animate={{ opacity: active ? 1 : 0.45, x: active ? 4 : 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-center justify-between py-1.5 cursor-default"
    >
      <div className="flex items-center gap-2.5">
        <motion.span
          animate={{ backgroundColor: color, boxShadow: active ? `0 0 8px ${color}80` : "none", scale: active ? 1.3 : 1 }}
          transition={{ duration: 0.18 }}
          className="w-2.5 h-2.5 rounded-full shrink-0"
        />
        <span className="text-[13px]" style={{ color: active ? "#fff" : "#A3A3A3" }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <AnimatedNumber value={value} color={active ? "#BEF532" : "#ffffff"} />
        <span className="text-[#606060] text-[11px] font-mono">RWF</span>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function BudgetSimulator() {
  const [state, setState] = useState<SimState>(DEFAULTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName]   = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const idCounter    = useRef(0);

  useEffect(() => { setMounted(true); }, []);


  const vault         = Math.round((state.income * state.vaultPct) / 100);
  const remaining     = state.income - vault;
  const customTotal   = state.custom.reduce((s, e) => s + e.amount, 0);
  const envelopeTotal = state.rent + state.food + state.utilities + state.other + customTotal;
  const unallocated   = remaining - envelopeTotal;
  const isOverallocated = unallocated < 0;

  const update = useCallback((key: keyof Omit<SimState, "custom">, raw: number) => {
    setState((prev) => ({ ...prev, [key]: raw }));
  }, []);

  const envelopeMax = (key: "rent" | "food" | "utilities" | "other") => {
    const others = (["rent", "food", "utilities", "other"] as const)
      .filter((k) => k !== key).reduce((s, k) => s + state[k], 0);
    return Math.max(0, remaining - others - customTotal);
  };

  const addEnvelope = () => {
    const name   = newName.trim();
    const amount = parseInt(newAmount.replace(/[^0-9]/g, ""), 10);
    if (!name || isNaN(amount) || amount <= 0) return;
    idCounter.current += 1;
    setState((prev) => ({ ...prev, custom: [...prev.custom, { id: `c-${idCounter.current}`, name, amount }] }));
    setNewName(""); setNewAmount(""); setShowAddForm(false);
  };

  const removeEnvelope     = (id: string) => setState((p) => ({ ...p, custom: p.custom.filter((e) => e.id !== id) }));
  const updateCustomAmount = (id: string, amount: number) =>
    setState((p) => ({ ...p, custom: p.custom.map((e) => e.id === id ? { ...e, amount } : e) }));

  // Build pie data
  const coreSlices = [
    { name: "Vault",             value: vault,             color: "#BEF532" },
    { name: "Rent",              value: state.rent,        color: "#4ade80" },
    { name: "Food & essentials", value: state.food,        color: "#34d399" },
    { name: "Utilities",         value: state.utilities,   color: "#2dd4bf" },
    { name: "Other goals",       value: state.other,       color: "#22d3ee" },
    ...state.custom.map((e, i) => ({ name: e.name, value: e.amount, color: ENVELOPE_COLORS[i % ENVELOPE_COLORS.length] })),
  ];
  const unallocatedSlice = { name: "Unallocated", value: Math.max(0, unallocated), color: "#232323" };
  const pieData = [...coreSlices, ...(unallocated > 0 ? [unallocatedSlice] : [])];

  // Keep activeIndex in bounds when slices change
  useEffect(() => {
    if (activeIndex >= pieData.length) setActiveIndex(0);
  }, [pieData.length, activeIndex]);

  return (
    <section id="features" className="py-24 bg-[#0a0a0a]" aria-labelledby="sim-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Centered heading ── */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.p initial={{ y: 10 }} whileInView={{ y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[#BEF532] text-[11px] font-mono uppercase tracking-widest mb-5">
            Interactive demo
          </motion.p>
          <motion.div initial={{ y: 16 }} whileInView={{ y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="w-full flex flex-col items-center text-center">
            <HoverHeading />
          </motion.div>
          <motion.p initial={{ y: 12 }} whileInView={{ y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-[#606060] text-[15px] leading-relaxed mt-5 max-w-md">
            See how a simple plan turns an incoming amount into purposeful savings.
          </motion.p>
        </div>

        {/* ── Two columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT: Controls ── */}
          <motion.div
            initial={{ x: -24 }} whileInView={{ x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#111111] border border-[#242424] rounded-2xl p-6 flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#BEF532]/8 border border-[#BEF532]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BEF532]" />
                <span className="text-[#BEF532] text-[10px] font-mono font-semibold uppercase tracking-wider">Simulated money only</span>
              </div>
              <button onClick={() => { setState(DEFAULTS); setShowAddForm(false); setActiveIndex(0); }}
                className="flex items-center gap-1.5 text-[#606060] hover:text-white text-[12px] transition-colors" aria-label="Reset">
                <RotateCcw size={13} /> Reset
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <IncomeInput value={state.income} onChange={(v) => update("income", v)} />
              <div className="border-t border-[#1e1e1e]" />

              <Slider label="Vault sweep" sublabel="Auto-deducted first into Emergency Vault"
                value={state.vaultPct} min={1} max={30} step={1}
                onChange={(v) => update("vaultPct", v)} accent />
              <div className="border-t border-[#1e1e1e]" />

              <p className="text-[#606060] text-[11px] font-mono uppercase tracking-wider -mb-2">Envelope allocations</p>

              <Slider label="Rent" value={state.rent} min={0} max={Math.min(500000, state.income)} step={5000}
                onChange={(v) => update("rent", clamp(v, 0, envelopeMax("rent")))} />
              <Slider label="Food & essentials" value={state.food} min={0} max={Math.min(300000, state.income)} step={1000}
                onChange={(v) => update("food", clamp(v, 0, envelopeMax("food")))} />
              <Slider label="Utilities" value={state.utilities} min={0} max={Math.min(200000, state.income)} step={1000}
                onChange={(v) => update("utilities", clamp(v, 0, envelopeMax("utilities")))} />
              <Slider label="Other goals" value={state.other} min={0} max={Math.min(300000, state.income)} step={5000}
                onChange={(v) => update("other", clamp(v, 0, envelopeMax("other")))} />

              {/* Custom sliders */}
              <AnimatePresence>
                {state.custom.map((env, i) => (
                  <motion.div key={env.id}
                    initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }} className="flex flex-col gap-2 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ENVELOPE_COLORS[i % ENVELOPE_COLORS.length] }} />
                        <span className="text-white text-[13px] font-medium">{env.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[15px] tabular-nums text-white">
                          {fmt(env.amount)}<span className="text-[#606060] text-[11px] font-normal ml-1">RWF</span>
                        </span>
                        <button onClick={() => removeEnvelope(env.id)} className="text-[#606060] hover:text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="relative h-2 bg-[#1e1e1e] rounded-full">
                      <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-200"
                        style={{ width: `${state.income > 0 ? (env.amount / state.income) * 100 : 0}%`, backgroundColor: ENVELOPE_COLORS[i % ENVELOPE_COLORS.length] }} />
                      <input type="range" min={0}
                        max={Math.max(env.amount, Math.min(state.income, env.amount + Math.max(0, unallocated)))}
                        step={1000} value={env.amount}
                        onChange={(e) => updateCustomAmount(env.id, Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 shadow-lg"
                        style={{ left: `${state.income > 0 ? (env.amount / state.income) * 100 : 0}%`, borderColor: ENVELOPE_COLORS[i % ENVELOPE_COLORS.length], backgroundColor: "#171717" }} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add envelope */}
              <AnimatePresence mode="wait">
                {showAddForm ? (
                  <motion.div key="form"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3 p-4 rounded-xl"
                    style={{ border: "1px solid rgba(190,245,50,0.20)", background: "rgba(190,245,50,0.03)" }}>
                    <p className="text-[#BEF532] text-[11px] font-mono uppercase tracking-wider">New envelope</p>
                    <input ref={nameInputRef} type="text" value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addEnvelope(); if (e.key === "Escape") setShowAddForm(false); }}
                      placeholder="e.g. School fees, Transport…"
                      className="w-full bg-[#0d0d0d] border border-[#2a2a2a] focus:border-[#BEF532]/40 text-white text-[13px] rounded-lg px-3 py-2.5 outline-none placeholder-[#444] transition-colors" />
                    <div className="flex gap-2">
                      <input type="text" inputMode="numeric" value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value.replace(/[^0-9]/g, ""))}
                        onKeyDown={(e) => { if (e.key === "Enter") addEnvelope(); if (e.key === "Escape") setShowAddForm(false); }}
                        placeholder="Amount in RWF"
                        className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] focus:border-[#BEF532]/40 text-white font-mono text-[13px] rounded-lg px-3 py-2.5 outline-none placeholder-[#444] transition-colors" />
                      <button onClick={addEnvelope} disabled={!newName.trim() || !newAmount}
                        className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ background: "#BEF532", color: "#090b04" }}>Add</button>
                      <button onClick={() => { setShowAddForm(false); setNewName(""); setNewAmount(""); }}
                        className="px-3 py-2 rounded-lg border border-[#2a2a2a] text-[#606060] hover:text-white text-[13px] transition-colors">Cancel</button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => { setShowAddForm(true); setTimeout(() => nameInputRef.current?.focus(), 50); }}
                    className="flex items-center gap-2 text-[#606060] hover:text-[#BEF532] text-[13px] transition-colors self-start group">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[#2a2a2a] group-hover:border-[#BEF532]/40 transition-colors">
                      <Plus size={12} />
                    </span>
                    Add envelope
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── RIGHT: Pie chart + legend ── */}
          <motion.div
            initial={{ x: 24 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            {/* Chart card */}
            <div className="bg-[#111111] border border-[#242424] rounded-2xl p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <p className="text-[#808080] text-[11px] font-mono uppercase tracking-wider">Allocation breakdown</p>
                <div className="flex items-baseline gap-1.5">
                  <AnimatedNumber value={state.income} color="#BEF532" />
                  <span className="text-[#BEF532]/50 font-mono text-[12px]">RWF</span>
                </div>
              </div>

              {/* Pie chart — client only to avoid SSR hydration mismatch */}
              <div style={{ width: "100%", height: 260, display: "block" }}>
                {mounted ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={72} outerRadius={108}
                      dataKey="value"
                      strokeWidth={0}
                      activeIndex={activeIndex}
                      activeShape={ActiveShape}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={600}
                      animationEasing="ease-out"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={activeIndex === index ? 1 : 0.65}
                          style={{ cursor: "pointer", outline: "none", transition: "opacity 0.2s" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-[216px] h-[216px] rounded-full border-[18px] border-[#1e1e1e] opacity-40" />
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[#1e1e1e]" />

              {/* Legend */}
              <div className="flex flex-col divide-y divide-[#1a1a1a]">
                {coreSlices.map((slice, i) => (
                  <LegendRow key={slice.name} label={slice.name} value={slice.value}
                    color={slice.color} active={activeIndex === i}
                    onHover={() => setActiveIndex(i)} />
                ))}
                {unallocated > 0 && (
                  <LegendRow label="Unallocated" value={unallocated}
                    color="#3a3a3a" active={activeIndex === coreSlices.length}
                    onHover={() => setActiveIndex(coreSlices.length)} />
                )}
              </div>

              {/* Status pill */}
              <StatusPill unallocated={unallocated} income={state.income} />

              {isOverallocated && (
                <motion.div initial={{ y: 4 }} animate={{ y: 0 }}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/8 border border-red-500/20">
                  <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-[12px] leading-relaxed">
                    Envelopes exceed remaining income after vault sweep.
                    Reduce by <strong>{fmt(Math.abs(unallocated))} RWF</strong>.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Presets */}
            <motion.div
              initial={{ y: 12 }} whileInView={{ y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.25 }}
              className="bg-[#111111] border border-[#242424] rounded-2xl p-4"
            >
              <p className="text-[#606060] text-[11px] font-mono uppercase tracking-wider mb-3">Quick presets</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Low income",  income: 80000,  rent: 30000,  food: 15000, utilities: 8000,  other: 5000,  vault: 10 },
                  { label: "Mid salary",  income: 250000, rent: 100000, food: 20000, utilities: 15000, other: 25000, vault: 10 },
                  { label: "High earner", income: 800000, rent: 300000, food: 80000, utilities: 40000, other: 100000, vault: 15 },
                ].map((p) => (
                  <motion.button key={p.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setState({ income: p.income, vaultPct: p.vault, rent: p.rent, food: p.food, utilities: p.utilities, other: p.other, custom: [] }); setActiveIndex(0); }}
                    className="px-3 py-1.5 rounded-lg border border-[#303030] text-[#A3A3A3] text-[12px] hover:border-[#BEF532]/40 hover:text-white hover:bg-[#BEF532]/5 transition-colors">
                    {p.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
