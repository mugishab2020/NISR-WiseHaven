"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import EnvelopeStatusBadge from "@/components/ui/EnvelopeStatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatRWF } from "@/lib/currency";
import { formatCountdown, formatDate, calcElapsedFraction, formatActivityDate } from "@/lib/dates";
import {
  ChevronLeft, Lock, CheckCircle, AlertCircle,
  Home, ShoppingBasket, Zap, School, Truck, Heart, Users, Briefcase,
} from "lucide-react";

const ICON_MAP: Record<string, typeof Lock> = {
  home_work: Home, shopping_basket: ShoppingBasket, bolt: Zap,
  school: School, truck: Truck, heart: Heart, users: Users, briefcase: Briefcase,
};

const CARD: React.CSSProperties = {
  background: "#171717",
  border: "1px solid #242424",
  borderRadius: "12px",
};

export default function EnvelopeDetailPage() {
  const params   = useParams<{ id: string }>();
  const router   = useRouter();
  const { account, doConfirmPayment, privacyMode } = useApp();

  const [showConfirm, setShowConfirm] = useState(false);
  const [paid, setPaid]               = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const envelope = account.envelopes.find((e) => e.id === params.id);

  if (!envelope) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle size={40} style={{ color: "#808080" }} />
          <h2 className="font-geist font-semibold text-[18px] text-white">Envelope not found</h2>
          <button
            onClick={() => router.push("/envelopes")}
            className="px-4 py-2.5 rounded-lg font-body-md text-body-md transition-colors"
            style={{ background: "#202020", color: "#b5b5b5", border: "1px solid #303030" }}
          >
            Back to Envelopes
          </button>
        </div>
      </AppShell>
    );
  }

  const Icon      = ICON_MAP[envelope.icon] ?? Lock;
  const elapsed   = calcElapsedFraction(envelope.createdAt, envelope.maturityDate);
  const countdown = formatCountdown(envelope.maturityDate);
  const isPaid    = envelope.status === "paid";
  const isUnlocking = envelope.status === "unlocking_soon";
  const isReady   = envelope.status === "ready_to_pay";
  const relatedTx = account.transactions.filter((tx) => tx.envelopeId === envelope.id);

  const accent  = isUnlocking ? "#ffb800" : "#bef532";
  const heroBg  = isUnlocking ? "rgba(255,184,0,0.02)" : isReady ? "rgba(190,245,50,0.02)" : "#171717";
  const heroBorder = isUnlocking ? "rgba(255,184,0,0.30)" : isReady ? "rgba(190,245,50,0.25)" : "#242424";

  function handleConfirmPayment() {
    try {
      doConfirmPayment(envelope!.id);
      setPaid(true);
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
      setShowConfirm(false);
    }
  }

  if (paid) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "#bef532" }}
          >
            <CheckCircle size={28} style={{ color: "#000000" }} />
          </div>
          <div className="text-center">
            <h2 className="font-geist font-semibold text-[20px] text-white">Payment Confirmed!</h2>
            <p className="font-body-md text-body-md mt-1" style={{ color: "#b5b5b5" }}>
              Demo payment of {formatRWF(envelope.amount)} RWF recorded.
            </p>
            <p className="font-body-sm text-body-sm mt-1" style={{ color: "#808080" }}>
              ⚠ This is a simulated payment. No real money was transferred.
            </p>
          </div>
          <button
            onClick={() => router.push("/envelopes")}
            className="px-5 py-3 rounded-lg font-body-md text-body-md font-semibold hover:opacity-90"
            style={{ background: "#bef532", color: "#000000" }}
          >
            Back to Envelopes
          </button>
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
          <ChevronLeft size={16} />
          Back to Envelopes
        </button>

        {/* ── Hero card ─────────────────────────────────── */}
        <div
          className="relative p-5 rounded-xl overflow-hidden mb-4"
          style={{ background: heroBg, border: `1px solid ${heroBorder}` }}
        >
          {/* Top accent bar */}
          {(isUnlocking || isReady) && (
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accent }} />
          )}
          {/* Ghost icon */}
          <div className="absolute -right-5 -bottom-5 pointer-events-none" style={{ color: "#242424" }}>
            <Icon size={96} />
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: (isUnlocking || isReady) ? `rgba(${isUnlocking ? "255,184,0" : "190,245,50"},0.12)` : "#202020",
                    color: (isUnlocking || isReady) ? accent : "#808080",
                  }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h1 className="font-geist font-semibold text-[20px] text-white">{envelope.name}</h1>
                  <p className="font-label-sm text-label-sm mt-0.5" style={{ color: "#808080" }}>
                    {envelope.categoryLabel}
                  </p>
                </div>
              </div>
              <EnvelopeStatusBadge status={envelope.status} />
            </div>

            {/* Amount */}
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                Secured Capital
              </span>
              <div className="mt-1">
                <CurrencyDisplay amount={envelope.amount} size="lg" />
              </div>
            </div>

            {/* Lock progress */}
            {!isPaid && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>Lock Progress</span>
                  <span
                    className="font-mono font-bold text-[13px] tracking-wider"
                    style={{ color: accent, fontFeatureSettings: '"tnum" 1, "zero" 1' }}
                  >
                    {countdown}
                  </span>
                </div>
                <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: "#242424" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(elapsed * 100)}%`, background: accent }}
                  />
                </div>
                <div className="flex items-center justify-between font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                  <span>{formatDate(envelope.createdAt)}</span>
                  <span className="text-white">{formatDate(envelope.maturityDate)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Details ───────────────────────────────────── */}
        <div className="p-4 rounded-xl flex flex-col gap-3 mb-4" style={CARD}>
          <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
            Envelope Details
          </span>
          {[
            { label: "Recipient",     value: envelope.recipient },
            { label: "Maturity Date", value: formatDate(envelope.maturityDate) },
            { label: "Created",       value: formatDate(envelope.createdAt) },
            { label: "Category",      value: envelope.categoryLabel },
            ...(envelope.description ? [{ label: "Notes", value: envelope.description }] : []),
            ...(envelope.paidAt ? [{ label: "Paid At", value: formatDate(envelope.paidAt) }] : []),
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className="py-2.5 flex items-start justify-between gap-3"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid #1a1a1a" : "none" }}
            >
              <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>{label}</span>
              <span className="font-body-sm text-body-sm font-medium text-white text-right">{value}</span>
            </div>
          ))}
        </div>

        {/* ── Activity ──────────────────────────────────── */}
        {relatedTx.length > 0 && (
          <div className="p-4 rounded-xl flex flex-col gap-3 mb-4" style={CARD}>
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Activity
            </span>
            {relatedTx.map((tx, i) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 py-2"
                style={{ borderBottom: i < relatedTx.length - 1 ? "1px solid #1a1a1a" : "none" }}
              >
                <div>
                  <p className="font-body-sm text-body-sm font-medium text-white">{tx.description}</p>
                  <p className="font-label-sm text-label-sm" style={{ color: "#808080" }}>
                    {formatActivityDate(tx.timestamp)}
                  </p>
                </div>
                <span
                  className="font-mono text-[12px] font-semibold whitespace-nowrap"
                  style={{
                    color: tx.direction === "in" ? "#bef532" : "#b5b5b5",
                    fontFeatureSettings: '"tnum" 1',
                  }}
                >
                  {tx.direction === "in" ? "+" : "−"}
                  {privacyMode ? "••••••" : formatRWF(tx.amount)} RWF
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ─────────────────────────────────────── */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg flex items-center gap-2"
            style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.20)" }}
          >
            <AlertCircle size={15} style={{ color: "#ff6b6b" }} />
            <p className="font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>{error}</p>
          </div>
        )}

        {/* ── Action buttons ────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {isReady && !isPaid && (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-3.5 rounded-lg font-body-md text-body-md font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#bef532", color: "#000000" }}
            >
              <CheckCircle size={18} />
              Confirm Simulated Payment
            </button>
          )}

          {isUnlocking && (
            <div
              className="w-full py-3 rounded-lg font-body-md text-body-md font-semibold flex items-center justify-center gap-2"
              style={{ background: "rgba(255,184,0,0.08)", color: "#ffb800", border: "1px solid rgba(255,184,0,0.25)" }}
            >
              <Lock size={16} className="animate-pulse" />
              Unlocking Soon — {countdown}
            </div>
          )}

          {envelope.status === "locked" && (
            <div
              className="w-full py-3 rounded-lg font-body-md text-body-md flex items-center justify-center gap-2"
              style={{ background: "#171717", color: "#808080", border: "1px solid #242424" }}
            >
              <Lock size={16} />
              Locked until {formatDate(envelope.maturityDate)}
            </div>
          )}

          {isPaid && (
            <div
              className="w-full py-3 rounded-lg font-body-md text-body-md flex items-center justify-center gap-2"
              style={{ background: "#171717", color: "#808080", border: "1px solid #242424" }}
            >
              <CheckCircle size={16} />
              Payment Completed {envelope.paidAt ? formatDate(envelope.paidAt) : ""}
            </div>
          )}

          <button
            onClick={() => router.push("/envelopes")}
            className="w-full py-2.5 rounded-lg font-body-md text-body-md font-medium transition-colors"
            style={{ background: "#171717", color: "#b5b5b5", border: "1px solid #242424" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#303030"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#242424"; (e.currentTarget as HTMLElement).style.color = "#b5b5b5"; }}
          >
            Back to Envelopes
          </button>
        </div>

        {/* ── Confirm dialog ────────────────────────────── */}
        <ConfirmDialog
          isOpen={showConfirm}
          title="Confirm Simulated Payment"
          description={`This will simulate a payment of ${formatRWF(envelope.amount)} RWF to ${envelope.recipient}. Demo only — no real transfer occurs.`}
          confirmLabel="Confirm Payment"
          cancelLabel="Cancel"
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowConfirm(false)}
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between font-body-sm text-body-sm">
              <span style={{ color: "#808080" }}>Amount</span>
              <span className="font-mono font-semibold" style={{ color: "#bef532" }}>
                {formatRWF(envelope.amount)} RWF
              </span>
            </div>
            <div className="flex justify-between font-body-sm text-body-sm">
              <span style={{ color: "#808080" }}>To</span>
              <span className="font-medium text-white">{envelope.recipient}</span>
            </div>
            <p className="font-label-sm text-label-sm mt-1" style={{ color: "#808080" }}>
              ⚠ Simulated demo payment only. No real money moves.
            </p>
          </div>
        </ConfirmDialog>
      </div>
    </AppShell>
  );
}
