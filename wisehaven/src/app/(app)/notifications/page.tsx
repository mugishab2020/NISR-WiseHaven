"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { formatRWF } from "@/lib/currency";
import { notificationApi, ApiError } from "@/lib/api";
import {
  Bell, Lock, Unlock, Shield, ArrowRight, CheckCircle,
  ArrowDownRight, Wallet, Check, Loader2,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────

function formatCountdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Matured";
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d`;
  const hrs = Math.floor(diff / 3600000);
  return `${hrs}h`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

const TYPE_META: Record<string, {
  icon: typeof Bell;
  color: string;
  bg: string;
  border: string;
  href: (meta: Record<string, unknown> | null) => string;
}> = {
  DEPOSIT_RECEIVED: {
    icon: ArrowDownRight, color: "#bef532",
    bg: "rgba(190,245,50,0.06)", border: "rgba(190,245,50,0.20)",
    href: () => "/activity",
  },
  ENVELOPE_MATURED: {
    icon: CheckCircle, color: "#bef532",
    bg: "rgba(190,245,50,0.06)", border: "rgba(190,245,50,0.25)",
    href: (meta) => meta?.envelope_id ? `/envelopes/${meta.envelope_id}` : "/envelopes",
  },
  ENVELOPE_UNLOCKING_SOON: {
    icon: Unlock, color: "#ffb800",
    bg: "rgba(255,184,0,0.04)", border: "rgba(255,184,0,0.20)",
    href: (meta) => meta?.envelope_id ? `/envelopes/${meta.envelope_id}` : "/envelopes",
  },
  DISBURSEMENT_COMPLETED: {
    icon: Wallet, color: "#bef532",
    bg: "rgba(190,245,50,0.06)", border: "rgba(190,245,50,0.20)",
    href: () => "/activity",
  },
  EMERGENCY_WITHDRAWAL_APPROVED: {
    icon: Shield, color: "#808080",
    bg: "#171717", border: "#242424",
    href: () => "/vault",
  },
};

const DEFAULT_META = {
  icon: Bell, color: "#808080",
  bg: "#171717", border: "#242424",
  href: () => "/notifications" as string,
};

// ── Derived envelope alerts (from live lock state) ────────

function useEnvelopeAlerts() {
  const { state, privacyMode } = useApp();
  const { envelopes } = state;
  const nonVault = envelopes.filter((e) => !e.is_emergency_vault);

  const released = nonVault.filter((e) => e.temporal_lock?.status === "RELEASED");
  const unlockingSoon = nonVault.filter((e) => {
    if (!e.temporal_lock || e.temporal_lock.status !== "LOCKED") return false;
    const diff = new Date(e.temporal_lock.maturity_timestamp).getTime() - Date.now();
    return diff > 0 && diff < 48 * 3600 * 1000;
  });

  const alerts = [
    ...released.map((e) => ({
      id: `live-ready-${e.id}`,
      type: "ENVELOPE_MATURED" as const,
      title: `${e.name} is ready to pay`,
      message: `${privacyMode ? "••••••" : formatRWF(Number(e.balance))} demo RWF matured — confirm payment.`,
      href: `/envelopes/${e.id}`,
    })),
    ...unlockingSoon.map((e) => ({
      id: `live-soon-${e.id}`,
      type: "ENVELOPE_UNLOCKING_SOON" as const,
      title: `${e.name} unlocking soon`,
      message: `Matures in ${formatCountdown(e.temporal_lock!.maturity_timestamp)}`,
      href: `/envelopes/${e.id}`,
    })),
  ];

  return alerts;
}

// ── Page ──────────────────────────────────────────────────

export default function NotificationsPage() {
  const { state, refreshNotifications } = useApp();
  const { getToken } = useAuth();
  const { notifications, unreadCount } = state;

  const envelopeAlerts = useEnvelopeAlerts();
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const handleMarkOne = useCallback(async (id: string) => {
    setMarkingId(id);
    try {
      await notificationApi.markRead(() => getToken(), id);
      await refreshNotifications();
    } catch (e) {
      if (!(e instanceof ApiError)) console.error(e);
    } finally {
      setMarkingId(null);
    }
  }, [getToken, refreshNotifications]);

  const handleMarkAll = useCallback(async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead(() => getToken());
      await refreshNotifications();
    } catch (e) {
      if (!(e instanceof ApiError)) console.error(e);
    } finally {
      setMarkingAll(false);
    }
  }, [getToken, refreshNotifications]);

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6 max-w-2xl">

        {/* Header */}
        <div className="pt-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Bell size={13} style={{ color: "#808080" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#808080" }}>
              Alerts
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-geist font-semibold text-[28px] text-white tracking-tight leading-none">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={markingAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-medium transition-colors"
                style={{ background: "#202020", color: "#b5b5b5", border: "1px solid #303030" }}
              >
                {markingAll ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Check size={12} />
                )}
                Mark all read
              </button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Live envelope alerts (derived from lock state) */}
        {envelopeAlerts.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider px-1" style={{ color: "#808080" }}>
              Live Alerts
            </span>
            {envelopeAlerts.map((alert) => {
              const meta = TYPE_META[alert.type] ?? DEFAULT_META;
              const Icon = meta.icon;
              return (
                <a
                  key={alert.id}
                  href={alert.href}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl group transition-all"
                  style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${meta.color}18`, color: meta.color }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-body-md text-body-md font-semibold" style={{ color: meta.color }}>{alert.title}</p>
                      <p className="font-body-sm text-body-sm mt-0.5" style={{ color: "#b5b5b5" }}>{alert.message}</p>
                    </div>
                  </div>
                  <ArrowRight size={15} className="shrink-0 group-hover:translate-x-0.5 transition-transform" style={{ color: "#808080" }} />
                </a>
              );
            })}
          </div>
        )}

        {/* Persisted backend notifications */}
        {notifications.length === 0 && envelopeAlerts.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Bell size={32} style={{ color: "#808080" }} />
            <p className="font-body-md text-body-md" style={{ color: "#b5b5b5" }}>
              All clear — no notifications right now.
            </p>
          </div>
        ) : notifications.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider px-1" style={{ color: "#808080" }}>
              History
            </span>
            {notifications.map((n) => {
              const meta = TYPE_META[n.notification_type] ?? DEFAULT_META;
              const Icon = meta.icon;
              const href = meta.href(n.metadata);
              const isUnread = !n.is_read;
              return (
                <div
                  key={n.id}
                  className="flex items-start justify-between gap-3 p-4 rounded-xl transition-all"
                  style={{
                    background: isUnread ? meta.bg : "#111111",
                    border: `1px solid ${isUnread ? meta.border : "#1e1e1e"}`,
                    opacity: n.is_read ? 0.75 : 1,
                  }}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Unread dot */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${meta.color}18`, color: meta.color }}>
                        <Icon size={17} />
                      </div>
                      {isUnread && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#111111]"
                          style={{ background: "#bef532" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-body-md font-semibold text-white truncate">{n.title}</p>
                      <p className="font-body-sm text-body-sm mt-0.5" style={{ color: "#b5b5b5" }}>{n.message}</p>
                      <p className="font-label-sm text-label-sm mt-1 font-mono" style={{ color: "#808080" }}>
                        {timeAgo(n.sent_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkOne(n.id)}
                        disabled={markingId === n.id}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "#808080", background: "#202020" }}
                        title="Mark as read"
                        aria-label="Mark notification as read"
                      >
                        {markingId === n.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Check size={12} />
                        }
                      </button>
                    )}
                    <a href={href}
                      className="p-1.5 rounded-lg transition-colors group/arrow"
                      style={{ color: "#808080", background: "#202020" }}
                      aria-label="View details">
                      <ArrowRight size={12} className="group-hover/arrow:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Locked envelopes summary */}
        {state.envelopes.filter((e) => !e.is_emergency_vault && e.temporal_lock?.status === "LOCKED").length > 0 && (
          <div className="p-4 rounded-xl flex items-center justify-between"
            style={{ background: "#171717", border: "1px solid #242424" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(190,245,50,0.08)" }}>
                <Lock size={15} style={{ color: "#bef532" }} />
              </div>
              <div>
                <p className="font-body-md text-body-md font-medium text-white">
                  {state.envelopes.filter((e) => !e.is_emergency_vault && e.temporal_lock?.status === "LOCKED").length} envelope
                  {state.envelopes.filter((e) => !e.is_emergency_vault && e.temporal_lock?.status === "LOCKED").length !== 1 ? "s" : ""} actively locked
                </p>
                <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
                  Demo funds secured against impulse spending
                </p>
              </div>
            </div>
            <a href="/envelopes" className="flex items-center gap-1 font-label-md text-label-md transition-colors"
              style={{ color: "#bef532" }}>
              View <ArrowRight size={13} />
            </a>
          </div>
        )}
      </div>
    </AppShell>
  );
}
