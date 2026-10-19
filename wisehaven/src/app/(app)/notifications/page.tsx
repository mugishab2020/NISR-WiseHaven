"use client";

import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { formatCountdown, formatDate } from "@/lib/dates";
import { formatRWF } from "@/lib/currency";
import Link from "next/link";
import { Bell, Lock, Unlock, Shield, ArrowRight, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
  const { account } = useApp();

  const unlockingSoon = account.envelopes.filter((e) => e.status === "unlocking_soon");
  const readyToPay    = account.envelopes.filter((e) => e.status === "ready_to_pay");

  const notifications = [
    ...readyToPay.map((e) => ({
      id:    e.id,
      type:  "ready" as const,
      title: `${e.name} is ready to pay`,
      body:  `${formatRWF(e.amount)} RWF matured. Confirm your simulated payment.`,
      href:  `/envelopes/${e.id}`,
      icon:  CheckCircle,
      color: "#bef532",
      bg:    "rgba(190,245,50,0.06)",
      border:"rgba(190,245,50,0.25)",
    })),
    ...unlockingSoon.map((e) => ({
      id:    e.id,
      type:  "unlocking" as const,
      title: `${e.name} unlocking soon`,
      body:  `Matures in ${formatCountdown(e.maturityDate)} — ${formatDate(e.maturityDate)}`,
      href:  `/envelopes/${e.id}`,
      icon:  Unlock,
      color: "#ffb800",
      bg:    "rgba(255,184,0,0.04)",
      border:"rgba(255,184,0,0.20)",
    })),
    {
      id:    "vault_progress",
      type:  "info" as const,
      title: "Emergency Vault Update",
      body:  `Your vault is ${account.vaultBalance > 0 ? Math.round((account.vaultBalance / account.vaultSettings.targetAmount) * 100) : 0}% funded. Keep growing your safety net.`,
      href:  "/vault",
      icon:  Shield,
      color: "#808080",
      bg:    "#171717",
      border:"#242424",
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6 max-w-2xl">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={13} style={{ color: "#808080" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#808080" }}>
              {notifications.length} Alert{notifications.length !== 1 ? "s" : ""}
            </span>
          </div>
          <h1 className="font-geist font-semibold text-[28px] text-white tracking-tight leading-none">
            Notifications
          </h1>
        </div>

        {/* ── Notification list ────────────────────────────── */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Bell size={32} style={{ color: "#808080" }} />
            <p className="font-body-md text-body-md" style={{ color: "#b5b5b5" }}>
              All clear — no notifications right now.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                className="flex items-center justify-between gap-4 p-4 rounded-xl group transition-all"
                style={{ background: n.bg, border: `1px solid ${n.border}` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = n.color; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = n.border; }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${n.color}18`, color: n.color }}
                  >
                    <n.icon size={18} />
                  </div>
                  <div>
                    <p className="font-body-md text-body-md font-semibold" style={{ color: n.type === "info" ? "#ffffff" : n.color }}>
                      {n.title}
                    </p>
                    <p className="font-body-sm text-body-sm mt-0.5" style={{ color: "#b5b5b5" }}>{n.body}</p>
                  </div>
                </div>
                <ArrowRight
                  size={15}
                  className="shrink-0 group-hover:translate-x-0.5 transition-transform"
                  style={{ color: "#808080" }}
                />
              </Link>
            ))}
          </div>
        )}

        {/* ── Locked envelopes reminder ────────────────────── */}
        {account.envelopes.filter((e) => e.status === "locked").length > 0 && (
          <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "#171717", border: "1px solid #242424" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(190,245,50,0.08)" }}>
                <Lock size={15} style={{ color: "#bef532" }} />
              </div>
              <div>
                <p className="font-body-md text-body-md font-medium text-white">
                  {account.envelopes.filter((e) => e.status === "locked").length} envelope{account.envelopes.filter((e) => e.status === "locked").length !== 1 ? "s" : ""} actively locked
                </p>
                <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
                  Funds secured against impulse spending
                </p>
              </div>
            </div>
            <Link
              href="/envelopes"
              className="flex items-center gap-1 font-label-md text-label-md transition-colors"
              style={{ color: "#bef532" }}
            >
              View <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
