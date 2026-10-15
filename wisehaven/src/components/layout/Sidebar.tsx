"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lock,
  Shield,
  Receipt,
  Bell,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, path: "overview" },
  {
    label: "Envelopes",
    href: "/envelopes",
    icon: Lock,
    path: "envelopes",
  },
  {
    label: "Emergency Vault",
    href: "/vault",
    icon: Shield,
    path: "vault",
  },
  {
    label: "Activity",
    href: "/activity",
    icon: Receipt,
    path: "activity",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    path: "notifications",
    badge: 2,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    path: "settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { account } = useApp();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const activeEnvelopes = account.envelopes.filter(
    (e) => e.status !== "paid" && e.status !== "cancelled"
  ).length;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between py-space-md border-r border-surface-container">
      {/* Brand */}
      <div className="flex flex-col gap-space-md">
        <div className="px-space-md flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
              <span className="text-on-primary font-bold text-sm font-geist">W</span>
            </div>
            <span className="font-geist font-semibold tracking-tight text-headline-sm text-primary">
              WiseHaven
            </span>
          </div>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
            Give Every Franc a Purpose
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-space-sm">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`
                  flex items-center justify-between px-space-sm py-2 rounded transition-colors
                  ${
                    active
                      ? "bg-surface-container-high text-primary-fixed border-l-2 border-primary-fixed font-medium"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }
                `}
              >
                <div className="flex items-center gap-space-sm">
                  <item.icon size={18} />
                  <span className="font-body-md text-body-md">{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: status + user */}
      <div className="flex flex-col gap-space-md px-space-sm">
        {/* Status panel */}
        <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Kigali Clock
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
              CAT (UTC+2)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Network
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse" />
              <span className="font-label-sm text-label-sm text-primary-fixed">
                Protected
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Active Locks
            </span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">
              {activeEnvelopes} Envelopes
            </span>
          </div>
        </div>

        {/* User row */}
        <div className="pt-space-sm flex items-center justify-between px-space-xs">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
              <User size={16} className="text-on-surface-variant" />
            </div>
            <div className="flex flex-col">
              <span className="font-body-sm text-body-sm text-on-surface font-medium leading-none">
                Godson N.
              </span>
              <span className="font-label-sm text-label-sm text-outline mt-0.5">
                +250 78 812 3456
              </span>
            </div>
          </div>
          <button
            className="text-outline hover:text-on-surface p-1 rounded hover:bg-surface-container-high transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
