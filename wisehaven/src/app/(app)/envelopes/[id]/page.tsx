"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatRWF } from "@/lib/currency";
import { disbursementApi, ApiError } from "@/lib/api";
import {
  ChevronLeft, Lock, CheckCircle, AlertCircle, Loader2,
  Home, ShoppingBasket, Zap, School, Truck, Heart, Briefcase,
} from "lucide-react";

const ICON_MAP: Record<string, typeof Lock> = {
  Rent: Home, Food: ShoppingBasket, Utilities: Zap,
  Education: School, Transport: Truck, Healthcare: Heart,
  Custom: Briefcase, Emergency: Lock,
};

const CARD: React.CSSProperties = {
  background: "#171717",
  border: "1px solid #242424",
  borderRadius: "12px",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCountdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Matured";
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d remaining`;
  const hrs = Math.floor(diff / 3600000);
  return `${hrs}h remaining`;
}

export default function EnvelopeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  const { state, privacyMode, refresh } = useApp();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disbursed, setDisbursed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const envelope = state.envelopes.find((e) => e.id === params.id);
  const relatedTx = state.transactions.filter((tx) => tx.envelope_id === params.id);

  if (!envelope) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle size={40} style={{ color: "#808080" }} />
          <h2 className="font-geist font-semibold text-[18px] text-white">Envelope not found</h2>
          <button onClick={() => router.push("/envelopes")}
            className="px-4 py-2.5 rounded-lg font-body-md text-body-md transition-colors"
            style={{ background: "#202020", color: "#b5b5b5", border: "1px solid #303030" }}>
            Back to Envelopes
          </button>
        </div>
      </AppShell>
    );
  }

  const Icon = ICON_MAP[envelope.category] ?? Lock;
  const lock = envelope.temporal_lock;
  const allowance = envelope.allowance_schedule;
  const isLocked   = lock?.status === "LOCKED";
  const isReleased = lock?.status === "RELEASED";
  const balance    = Number(envelope.balance);
  const lockedBalance = Number(envelope.locked_balance ?? 0);

  const accent     = isReleased ? "#bef532" : isLocked ? "#bef532" : "#808080";
  const heroBorder = isReleased ? "rgba(190,245,50,0.25)" : "#242424";

  async function handleConfirmPayment() {
    setIsSubmitting(true);
    setError(null);
    try {
      await disbursementApi.disburse(() => getToken(), {
        envelope_id: envelope!.id,
        amount: balance,
        description: `Simulated payment from ${envelope!.name}`,
      });
      setDisbursed(true);
      setShowConfirm(false);
      await refresh();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Payment failed. Please try again.";
      setError(msg);
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (disbursed) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#bef532" }}>
            <CheckCircle size={28} style={{ color: "#000000" }} />
          </div>
          <div className="text-center">
            <h2 className="font-geist font-semibold text-[20px] text-white">Simulated Payment Done!</h2>
            <p className="font-body-md text-body-md mt-1" style={{ color: "#b5b5b5" }}>
              Demo payment of {formatRWF(balance)} RWF recorded.
            </p>
            <p className="font-body-sm text-body-sm mt-1" style={{ color: "#808080" }}>
              ⚠ This is a simulated demo payment. No real money was transferred.
            </p>
          </div>
          <button onClick={() => router.push("/envelopes")}
            className="px-5 py-3 rounded-lg font-body-md text-body-md font-semibold"
            style={{ background: "#bef532", color: "#000000" }}>
            Back to Envelopes
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto pb-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 font-body-sm text-body-sm mb-5 transition-colors"
          style={{ color: "#808080" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#808080"; }}>
          <ChevronLeft size={16} /> Back to Envelopes
        </button>

        {/* Hero card */}
        <div className="relative p-5 rounded-xl overflow-hidden mb-4"
          style={{ background: "#171717", border: `1px solid ${heroBorder}` }}>
          {isReleased && <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "#bef532" }} />}
          <div className="absolute -right-5 -bottom-5 pointer-events-none" style={{ color: "#242424" }}>
            <Icon size={96} />
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: isReleased ? "rgba(190,245,50,0.12)" : "#202020", color: accent }}>
                  <Icon size={22} />
                </div>
                <div>
                  <h1 className="font-geist font-semibold text-[20px] text-white">{envelope.name}</h1>
                  <p className="font-label-sm text-label-sm mt-0.5" style={{ color: "#808080" }}>{envelope.category}</p>
                </div>
              </div>
              {lock ? (
                <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold"
                  style={isLocked ? { background: "rgba(190,245,50,0.08)", color: "#bef532" } : { background: "#bef532", color: "#000" }}>
                  {isLocked ? "Locked" : "Ready to Pay"}
                </span>
              ) : allowance ? (
                <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold" style={{ background: "rgba(190,245,50,0.08)", color: "#bef532" }}>
                  {allowance.is_active ? `${allowance.frequency === "DAILY" ? "Daily" : "Weekly"} allowance` : "Allowance complete"}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm" style={{ background: "#202020", color: "#808080" }}>No lock</span>
              )}
            </div>

            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Available to spend</span>
              <div className="mt-1"><CurrencyDisplay amount={balance} size="lg" /></div>
              {lockedBalance > 0 && (
                <p className="font-body-sm text-body-sm mt-2" style={{ color: "#808080" }}>
                  {formatRWF(lockedBalance)} RWF remains locked for future releases
                </p>
              )}
            </div>

            {allowance?.is_active && (
              <div className="rounded-lg p-3" style={{ background: "rgba(190,245,50,0.05)", border: "1px solid rgba(190,245,50,0.15)" }}>
                <p className="font-body-sm text-body-sm" style={{ color: "#bef532" }}>
                  {formatRWF(Number(allowance.release_amount))} RWF releases {allowance.frequency.toLowerCase()}.
                </p>
                <p className="font-body-sm text-body-sm mt-1" style={{ color: "#808080" }}>
                  Next release {new Date(allowance.next_release_at).toLocaleString()}.
                </p>
              </div>
            )}

            {lock && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>Lock Status</span>
                  <span className="font-mono font-bold text-[13px]" style={{ color: accent }}>
                    {isLocked ? formatCountdown(lock.maturity_timestamp) : "Matured — Ready"}
                  </span>
                </div>
                <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: "#242424" }}>
                  <div className="h-full rounded-full" style={{ width: isReleased ? "100%" : "50%", background: accent }} />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                  <span>Created {formatDate(envelope.created_at)}</span>
                  <span className="text-white">Matures {formatDate(lock.maturity_timestamp)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-4 rounded-xl flex flex-col gap-3 mb-4" style={CARD}>
          <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Envelope Details</span>
          {[
            { label: "Category",     value: envelope.category },
            { label: "Created",      value: formatDate(envelope.created_at) },
            ...(lock ? [{ label: "Maturity Date", value: formatDate(lock.maturity_timestamp) }] : []),
            ...(envelope.description ? [{ label: "Notes", value: envelope.description }] : []),
            { label: "Status", value: envelope.is_active ? "Active" : "Inactive" },
          ].map(({ label, value }, i, arr) => (
            <div key={label} className="py-2.5 flex items-start justify-between gap-3"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid #1a1a1a" : "none" }}>
              <span className="font-label-sm text-label-sm" style={{ color: "#808080" }}>{label}</span>
              <span className="font-body-sm text-body-sm font-medium text-white text-right">{value}</span>
            </div>
          ))}
        </div>

        {/* Related transactions */}
        {relatedTx.length > 0 && (
          <div className="p-4 rounded-xl flex flex-col gap-3 mb-4" style={CARD}>
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Activity</span>
            {relatedTx.map((tx, i) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 py-2"
                style={{ borderBottom: i < relatedTx.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                <div>
                  <p className="font-body-sm text-body-sm font-medium text-white">{tx.description}</p>
                  <p className="font-label-sm text-label-sm" style={{ color: "#808080" }}>
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-mono text-[12px] font-semibold whitespace-nowrap"
                  style={{ color: ["CREDIT","FIRST_SWEEP","MANUAL_DEPOSIT"].includes(tx.transaction_type) ? "#bef532" : "#b5b5b5" }}>
                  {["CREDIT","FIRST_SWEEP","MANUAL_DEPOSIT"].includes(tx.transaction_type) ? "+" : "−"}
                  {privacyMode ? "••••••" : formatRWF(Number(tx.amount))} RWF
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg flex items-center gap-2"
            style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.20)" }}>
            <AlertCircle size={15} style={{ color: "#ff6b6b" }} />
            <p className="font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {!isLocked && balance > 0 && (
            <button onClick={() => setShowConfirm(true)} disabled={isSubmitting}
              className="w-full py-3.5 rounded-lg font-body-md text-body-md font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: "#bef532", color: "#000000" }}>
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              Confirm Simulated Payment
            </button>
          )}

          {isLocked && (
            <div className="w-full py-3 rounded-lg font-body-md text-body-md flex items-center justify-center gap-2"
              style={{ background: "#171717", color: "#808080", border: "1px solid #242424" }}>
              <Lock size={16} />
              Locked until {formatDate(lock!.maturity_timestamp)}
            </div>
          )}

          {!lock && !allowance && balance > 0 && (
            <div className="w-full py-3 rounded-lg font-body-md text-body-md flex items-center justify-center gap-2"
              style={{ background: "rgba(190,245,50,0.06)", color: "#bef532", border: "1px solid rgba(190,245,50,0.2)" }}>
              <CheckCircle size={16} />
              No lock — funds are accessible
            </div>
          )}

          {allowance && balance <= 0 && lockedBalance > 0 && (
            <div className="w-full py-3 rounded-lg font-body-md text-body-md flex items-center justify-center gap-2"
              style={{ background: "#171717", color: "#808080", border: "1px solid #242424" }}>
              <Lock size={16} /> Waiting for the next allowance release
            </div>
          )}

          <button onClick={() => router.push("/envelopes")}
            className="w-full py-2.5 rounded-lg font-body-md text-body-md font-medium transition-colors"
            style={{ background: "#171717", color: "#b5b5b5", border: "1px solid #242424" }}>
            Back to Envelopes
          </button>
        </div>

        <ConfirmDialog
          isOpen={showConfirm}
          title="Confirm Simulated Payment"
          description={`This will simulate a demo payment of ${formatRWF(balance)} RWF from the ${envelope.name} envelope. No real money moves.`}
          confirmLabel="Confirm Demo Payment"
          cancelLabel="Cancel"
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </AppShell>
  );
}
