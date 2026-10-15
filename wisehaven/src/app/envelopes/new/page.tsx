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
  Truck, Heart, Users, Briefcase, AlertCircle, Check
} from "lucide-react";

const CATEGORIES: { value: EnvelopeCategory; label: string; icon: string; iconComp: typeof Lock }[] = [
  { value: "shelter", label: "Shelter / Rent", icon: "home_work", iconComp: Home },
  { value: "food", label: "Food & Groceries", icon: "shopping_basket", iconComp: ShoppingBasket },
  { value: "utilities", label: "Utilities & Bills", icon: "bolt", iconComp: Zap },
  { value: "education", label: "Education & Tuition", icon: "school", iconComp: School },
  { value: "transport", label: "Transport", icon: "truck", iconComp: Truck },
  { value: "healthcare", label: "Healthcare", icon: "heart", iconComp: Heart },
  { value: "family", label: "Family & Remittance", icon: "users", iconComp: Users },
  { value: "business", label: "Business Expenses", icon: "briefcase", iconComp: Briefcase },
  { value: "custom", label: "Custom", icon: "lock_clock", iconComp: Lock },
];

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsed = parseRWF(fields.amount);
  const previewAmount = isNaN(parsed) ? 0 : parsed;
  const remainingAfter = availableFunds - previewAmount;

  function set(key: keyof NewEnvelopeFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateNewEnvelope(fields, account);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const cat = CATEGORIES.find((c) => c.value === fields.category)!;
      doAllocateEnvelope({
        name: fields.name.trim(),
        description: fields.description.trim(),
        category: fields.category as EnvelopeCategory,
        categoryLabel: cat.label,
        icon: cat.icon,
        amount: parseRWF(fields.amount),
        recipient: fields.recipient.trim(),
        maturityDate: new Date(fields.maturityDate).toISOString(),
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
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center">
            <Check size={28} className="text-on-primary" />
          </div>
          <div className="text-center">
            <h2 className="font-geist font-semibold text-headline-sm text-primary">
              Envelope Locked!
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Your funds are secured. Redirecting…
            </p>
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
          className="flex items-center gap-1.5 text-outline hover:text-on-surface font-body-sm text-body-sm transition-colors mb-5"
        >
          <ChevronLeft size={16} />
          Back to Envelopes
        </button>

        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-2 text-primary-fixed">
            <Lock size={14} />
            <span className="font-label-sm text-label-sm uppercase tracking-widest">
              New Time-Lock
            </span>
          </div>
          <h1 className="font-geist font-semibold text-headline-xl-mobile text-primary tracking-tight">
            Create Envelope
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            Give this money a purpose and a maturity date.
          </p>
        </div>

        {/* Available funds indicator */}
        <div className="mb-5 p-3 rounded bg-surface-container-low border border-surface-container flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-outline uppercase">Available to Lock</span>
          <span className="font-mono font-semibold text-primary-fixed font-label-lg text-label-lg">
            {formatRWF(availableFunds)} RWF
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Envelope name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-name" className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Envelope Name <span className="text-error">*</span>
            </label>
            <input
              id="env-name"
              type="text"
              value={fields.name}
              onChange={(e) => set("name", e.target.value)}
              className={`w-full h-12 px-4 rounded bg-surface-container text-on-surface placeholder:text-outline font-body-md text-body-md border focus:outline-none focus:ring-1 transition-all ${errors.name ? "border-error focus:ring-error" : "border-surface-container-high focus:border-primary-fixed focus:ring-primary-fixed"}`}
              placeholder="e.g. Monthly Rent, Semester Tuition…"
              aria-describedby={errors.name ? "env-name-err" : undefined}
              aria-invalid={!!errors.name}
              maxLength={60}
            />
            {errors.name && (
              <p id="env-name-err" className="flex items-center gap-1 font-body-sm text-body-sm text-error" role="alert">
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-desc" className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Description <span className="text-outline font-normal">(optional)</span>
            </label>
            <textarea
              id="env-desc"
              value={fields.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full px-4 py-3 rounded bg-surface-container text-on-surface placeholder:text-outline font-body-md text-body-md border border-surface-container-high focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all resize-none"
              placeholder="Brief description of what this envelope is for…"
              rows={2}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Category <span className="text-error">*</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label="Select category">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => set("category", cat.value)}
                  className={`flex items-center gap-2 p-2.5 rounded border transition-all text-left ${fields.category === cat.value ? "bg-surface-container-high border-primary-fixed text-primary-fixed" : "bg-surface-container border-surface-container-high text-on-surface-variant hover:border-surface-variant"}`}
                  aria-pressed={fields.category === cat.value}
                >
                  <cat.iconComp size={14} />
                  <span className="font-body-sm text-body-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="flex items-center gap-1 font-body-sm text-body-sm text-error" role="alert">
                <AlertCircle size={12} /> {errors.category}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-amount" className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Allocation Amount (RWF) <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="env-amount"
                type="text"
                inputMode="numeric"
                value={fields.amount}
                onChange={(e) => set("amount", e.target.value)}
                className={`w-full h-12 px-4 pr-16 rounded bg-surface-container text-on-surface placeholder:text-outline font-mono text-headline-sm font-semibold border focus:outline-none focus:ring-1 transition-all ${errors.amount ? "border-error focus:ring-error" : "border-surface-container-high focus:border-primary-fixed focus:ring-primary-fixed"}`}
                placeholder="0"
                aria-describedby={errors.amount ? "env-amount-err" : "env-amount-hint"}
                aria-invalid={!!errors.amount}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-md text-label-md font-mono text-outline pointer-events-none">
                RWF
              </span>
            </div>
            {errors.amount ? (
              <p id="env-amount-err" className="flex items-center gap-1 font-body-sm text-body-sm text-error" role="alert">
                <AlertCircle size={12} /> {errors.amount}
              </p>
            ) : (
              previewAmount > 0 && (
                <p id="env-amount-hint" className="font-body-sm text-body-sm text-on-surface-variant">
                  After locking:{" "}
                  <span className={remainingAfter < 0 ? "text-error font-semibold" : "text-primary-fixed font-semibold"}>
                    {formatRWF(Math.max(0, remainingAfter))} RWF
                  </span>{" "}
                  remaining
                </p>
              )
            )}
          </div>

          {/* Recipient */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-recipient" className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Recipient / Purpose <span className="text-error">*</span>
            </label>
            <input
              id="env-recipient"
              type="text"
              value={fields.recipient}
              onChange={(e) => set("recipient", e.target.value)}
              className={`w-full h-12 px-4 rounded bg-surface-container text-on-surface placeholder:text-outline font-body-md text-body-md border focus:outline-none focus:ring-1 transition-all ${errors.recipient ? "border-error focus:ring-error" : "border-surface-container-high focus:border-primary-fixed focus:ring-primary-fixed"}`}
              placeholder="e.g. Landlord MTN MoMo, School Portal…"
              aria-describedby={errors.recipient ? "env-rec-err" : undefined}
              aria-invalid={!!errors.recipient}
            />
            {errors.recipient && (
              <p id="env-rec-err" className="flex items-center gap-1 font-body-sm text-body-sm text-error" role="alert">
                <AlertCircle size={12} /> {errors.recipient}
              </p>
            )}
          </div>

          {/* Maturity date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-maturity" className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Maturity Date & Time <span className="text-error">*</span>
            </label>
            <input
              id="env-maturity"
              type="datetime-local"
              value={fields.maturityDate}
              onChange={(e) => set("maturityDate", e.target.value)}
              className={`w-full h-12 px-4 rounded bg-surface-container text-on-surface font-mono text-body-md border focus:outline-none focus:ring-1 transition-all ${errors.maturityDate ? "border-error focus:ring-error" : "border-surface-container-high focus:border-primary-fixed focus:ring-primary-fixed"}`}
              aria-describedby={errors.maturityDate ? "env-date-err" : undefined}
              aria-invalid={!!errors.maturityDate}
            />
            {errors.maturityDate && (
              <p id="env-date-err" className="flex items-center gap-1 font-body-sm text-body-sm text-error" role="alert">
                <AlertCircle size={12} /> {errors.maturityDate}
              </p>
            )}
            <p className="font-body-sm text-body-sm text-outline">
              Funds will be locked until this date. Choose a date when the payment is due.
            </p>
          </div>

          {/* Review summary */}
          {previewAmount > 0 && fields.name && fields.category && fields.maturityDate && !errors.amount && (
            <div className="p-4 rounded bg-surface-container border border-primary-fixed/20 flex flex-col gap-2">
              <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider font-semibold">
                Review Before Locking
              </span>
              <div className="flex items-center justify-between font-body-sm text-body-sm">
                <span className="text-outline">Envelope</span>
                <span className="text-on-surface font-medium">{fields.name}</span>
              </div>
              <div className="flex items-center justify-between font-body-sm text-body-sm">
                <span className="text-outline">Amount</span>
                <span className="text-primary-fixed font-semibold font-mono">{formatRWF(previewAmount)} RWF</span>
              </div>
              <div className="flex items-center justify-between font-body-sm text-body-sm">
                <span className="text-outline">Maturity</span>
                <span className="text-on-surface font-mono">{fields.maturityDate.replace("T", " ")}</span>
              </div>
              {fields.recipient && (
                <div className="flex items-center justify-between font-body-sm text-body-sm">
                  <span className="text-outline">Recipient</span>
                  <span className="text-on-surface">{fields.recipient}</span>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded bg-surface-container text-on-surface font-body-md text-body-md font-medium hover:bg-surface-container-high border border-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock size={16} />
              {isSubmitting ? "Locking…" : "Lock Funds"}
            </button>
          </div>

          <p className="font-body-sm text-body-sm text-outline text-center">
            ⚠ This is simulated demo money only. No real funds are moved.
          </p>
        </form>
      </div>
    </AppShell>
  );
}
