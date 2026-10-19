"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { validateNewEnvelope, type NewEnvelopeFields } from "@/lib/validation";
import { formatRWF, parseRWF } from "@/lib/currency";
import { futureDatetimeLocal } from "@/lib/dates";
import type { EnvelopeCategory } from "@/types";
import {
  Lock, ChevronLeft, Home, ShoppingBasket, Zap, School,
  Truck, Heart, Users, Briefcase, AlertCircle, Check,
} from "lucide-react";

const CATEGORIES: {
  value: EnvelopeCategory;
  label: string;
  icon: string;
  iconComp: typeof Lock;
}[] = [
  { value: "shelter",    label: "Shelter / Rent",      icon: "home_work",        iconComp: Home          },
  { value: "food",       label: "Food & Groceries",    icon: "shopping_basket",  iconComp: ShoppingBasket },
  { value: "utilities",  label: "Utilities & Bills",   icon: "bolt",             iconComp: Zap            },
  { value: "education",  label: "Education & Tuition", icon: "school",           iconComp: School         },
  { value: "transport",  label: "Transport",           icon: "truck",            iconComp: Truck          },
  { value: "healthcare", label: "Healthcare",          icon: "heart",            iconComp: Heart          },
  { value: "family",     label: "Family & Remittance", icon: "users",            iconComp: Users          },
  { value: "business",   label: "Business Expenses",   icon: "briefcase",        iconComp: Briefcase      },
  { value: "custom",     label: "Custom",              icon: "lock_clock",       iconComp: Lock           },
];

// Input style helpers
const INPUT: React.CSSProperties = {
  width: "100%", height: "48px", padding: "0 16px",
  background: "#141414", color: "#ffffff",
  border: "1px solid #242424", borderRadius: "8px",
  fontSize: "14px", fontFamily: "Inter, sans-serif",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};
const INPUT_FOCUS = (el: HTMLInputElement | HTMLTextAreaElement, on: boolean) => {
  el.style.borderColor = on ? "#bef532" : "#242424";
  el.style.boxShadow   = on ? "0 0 0 1px #bef532, 0 0 8px rgba(190,245,50,0.12)" : "none";
};
const INPUT_ERROR: React.CSSProperties = { borderColor: "rgba(255,107,107,0.6)" };

export default function NewEnvelopePage() {
  const router = useRouter();
  const { account, availableFunds, doAllocateEnvelope } = useApp();

  const [fields, setFields] = useState<NewEnvelopeFields>({
    name: "",
    description: "",
    category: "",
    amount: "",
    recipient: "",
    maturityDate: futureDatetimeLocal(30, 9),
  });
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [submitted, setSubmitted]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsed        = parseRWF(fields.amount);
  const previewAmount = isNaN(parsed) ? 0 : parsed;
  const remaining     = availableFunds - previewAmount;

  function set(key: keyof NewEnvelopeFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateNewEnvelope(fields, account);
    if (!result.valid) { setErrors(result.errors); return; }
    setIsSubmitting(true);
    try {
      const cat = CATEGORIES.find((c) => c.value === fields.category)!;
      doAllocateEnvelope({
        name:          fields.name.trim(),
        description:   fields.description.trim(),
        category:      fields.category as EnvelopeCategory,
        categoryLabel: cat.label,
        icon:          cat.icon,
        amount:        parseRWF(fields.amount),
        recipient:     fields.recipient.trim(),
        maturityDate:  new Date(fields.maturityDate).toISOString(),
      });
      setSubmitted(true);
      setTimeout(() => router.push("/envelopes"), 1500);
    } catch (err) {
      setErrors({ amount: err instanceof Error ? err.message : "Allocation failed." });
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#bef532" }}>
            <Check size={28} style={{ color: "#000000" }} />
          </div>
          <div className="text-center">
            <h2 className="font-geist font-semibold text-[20px] text-white">Envelope Locked!</h2>
            <p className="font-body-md text-body-md mt-1" style={{ color: "#b5b5b5" }}>Your funds are secured. Redirecting…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto pb-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 font-body-sm text-body-sm mb-5 transition-colors"
          style={{ color: "#808080" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#808080"; }}
        >
          <ChevronLeft size={16} /> Back to Envelopes
        </button>

        {/* Page title */}
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-2">
            <Lock size={13} style={{ color: "#bef532" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#bef532" }}>
              New Time-Lock
            </span>
          </div>
          <h1 className="font-geist font-semibold text-[28px] text-white tracking-tight">Create Envelope</h1>
          <p className="font-body-md text-body-md" style={{ color: "#b5b5b5" }}>
            Give this money a purpose and a maturity date.
          </p>
        </div>

        {/* Available funds bar */}
        <div
          className="mb-5 p-3 rounded-lg flex items-center justify-between"
          style={{ background: "#171717", border: "1px solid #242424" }}
        >
          <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
            Available to Lock
          </span>
          <span
            className="font-mono font-semibold text-[14px]"
            style={{ color: "#bef532", fontFeatureSettings: '"tnum" 1, "zero" 1' }}
          >
            {formatRWF(availableFunds)} RWF
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-name" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Envelope Name <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <input
              id="env-name"
              type="text"
              value={fields.name}
              onChange={(e) => set("name", e.target.value)}
              style={{ ...INPUT, ...(errors.name ? INPUT_ERROR : {}) }}
              placeholder="e.g. Monthly Rent, Semester Tuition…"
              onFocus={(e) => INPUT_FOCUS(e.currentTarget, true)}
              onBlur={(e)  => INPUT_FOCUS(e.currentTarget, false)}
              maxLength={60}
            />
            {errors.name && (
              <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-desc" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Description <span style={{ color: "#808080", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              id="env-desc"
              value={fields.description}
              onChange={(e) => set("description", e.target.value)}
              style={{
                ...INPUT, height: "auto", padding: "12px 16px",
                resize: "none" as const, fontFamily: "Inter, sans-serif",
              }}
              placeholder="Brief description of what this envelope is for…"
              rows={2}
              onFocus={(e) => INPUT_FOCUS(e.currentTarget, true)}
              onBlur={(e)  => INPUT_FOCUS(e.currentTarget, false)}
            />
          </div>

          {/* Category grid */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Category <span style={{ color: "#ff6b6b" }}>*</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const sel = fields.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => set("category", cat.value)}
                    className="flex items-center gap-2 p-3 rounded-lg text-left transition-all"
                    style={{
                      background: sel ? "rgba(190,245,50,0.08)" : "#171717",
                      border: `1px solid ${sel ? "#bef532" : "#242424"}`,
                      color: sel ? "#bef532" : "#b5b5b5",
                    }}
                    aria-pressed={sel}
                  >
                    <cat.iconComp size={14} />
                    <span className="font-body-sm text-body-sm font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>
                <AlertCircle size={12} /> {errors.category}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-amount" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Allocation Amount (RWF) <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <div className="relative">
              <input
                id="env-amount"
                type="text"
                inputMode="numeric"
                value={fields.amount}
                onChange={(e) => set("amount", e.target.value)}
                style={{
                  ...INPUT, paddingRight: "56px",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "20px", fontWeight: "600",
                  ...(errors.amount ? INPUT_ERROR : {}),
                }}
                placeholder="0"
                onFocus={(e) => INPUT_FOCUS(e.currentTarget, true)}
                onBlur={(e)  => INPUT_FOCUS(e.currentTarget, false)}
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 font-label-md text-label-md font-mono pointer-events-none"
                style={{ color: "#808080" }}
              >
                RWF
              </span>
            </div>
            {errors.amount ? (
              <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>
                <AlertCircle size={12} /> {errors.amount}
              </p>
            ) : previewAmount > 0 && (
              <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
                After locking:{" "}
                <span
                  className="font-mono font-semibold"
                  style={{ color: remaining < 0 ? "#ff6b6b" : "#bef532" }}
                >
                  {formatRWF(Math.max(0, remaining))} RWF
                </span>{" "}
                remaining
              </p>
            )}
          </div>

          {/* Recipient */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-recipient" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Recipient / Purpose <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <input
              id="env-recipient"
              type="text"
              value={fields.recipient}
              onChange={(e) => set("recipient", e.target.value)}
              style={{ ...INPUT, ...(errors.recipient ? INPUT_ERROR : {}) }}
              placeholder="e.g. Landlord MTN MoMo, School Portal, EUCL Meter #…"
              onFocus={(e) => INPUT_FOCUS(e.currentTarget, true)}
              onBlur={(e)  => INPUT_FOCUS(e.currentTarget, false)}
            />
            {errors.recipient && (
              <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>
                <AlertCircle size={12} /> {errors.recipient}
              </p>
            )}
          </div>

          {/* Maturity date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-maturity" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Maturity Date & Time <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <input
              id="env-maturity"
              type="datetime-local"
              value={fields.maturityDate}
              onChange={(e) => set("maturityDate", e.target.value)}
              style={{
                ...INPUT,
                fontFamily: "JetBrains Mono, monospace",
                ...(errors.maturityDate ? INPUT_ERROR : {}),
              }}
              onFocus={(e) => INPUT_FOCUS(e.currentTarget, true)}
              onBlur={(e)  => INPUT_FOCUS(e.currentTarget, false)}
            />
            {errors.maturityDate ? (
              <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>
                <AlertCircle size={12} /> {errors.maturityDate}
              </p>
            ) : (
              <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
                Funds will be locked until this exact date and time.
              </p>
            )}
          </div>

          {/* Review summary */}
          {previewAmount > 0 && fields.name && fields.category && fields.maturityDate && !errors.amount && (
            <div
              className="p-4 rounded-xl flex flex-col gap-2"
              style={{ background: "rgba(190,245,50,0.04)", border: "1px solid rgba(190,245,50,0.15)" }}
            >
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold" style={{ color: "#bef532" }}>
                Review Before Locking
              </span>
              {[
                { label: "Envelope",  value: fields.name },
                { label: "Amount",    value: `${formatRWF(previewAmount)} RWF`, mono: true, highlight: true },
                { label: "Maturity",  value: fields.maturityDate.replace("T", " "), mono: true },
                ...(fields.recipient ? [{ label: "Recipient", value: fields.recipient }] : []),
              ].map(({ label, value, mono, highlight }) => (
                <div key={label} className="flex items-center justify-between font-body-sm text-body-sm">
                  <span style={{ color: "#808080" }}>{label}</span>
                  <span
                    className={mono ? "font-mono" : ""}
                    style={{ color: highlight ? "#bef532" : "#ffffff", fontWeight: highlight ? 600 : 400 }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Submit row */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-lg font-body-md text-body-md font-medium transition-colors"
              style={{ background: "#171717", color: "#b5b5b5", border: "1px solid #242424" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#303030"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#242424"; (e.currentTarget as HTMLElement).style.color = "#b5b5b5"; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg font-body-md text-body-md font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#bef532", color: "#000000" }}
            >
              <Lock size={15} />
              {isSubmitting ? "Locking…" : "Lock Funds"}
            </button>
          </div>

          <p className="font-body-sm text-body-sm text-center" style={{ color: "#808080" }}>
            ⚠ This is simulated demo money only. No real funds are moved.
          </p>
        </form>
      </div>
    </AppShell>
  );
}
