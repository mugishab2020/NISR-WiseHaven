"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lock,
  Bell,
  Receipt,
  Settings,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const MOBILE_NAV = [
  { label: "Overview",       href: "/dashboard",     icon: LayoutDashboard, isNotif: false },
  { label: "Envelopes",      href: "/envelopes",     icon: Lock,            isNotif: false },
  { label: "Notifications",  href: "/notifications", icon: Bell,            isNotif: true  },
  { label: "Activity",       href: "/activity",      icon: Receipt,         isNotif: false },
  { label: "Settings",       href: "/settings",      icon: Settings,        isNotif: false },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { state } = useApp();

  const liveAlerts = state.envelopes.filter(
    (e) => !e.is_emergency_vault && e.temporal_lock?.status === "RELEASED"
  ).length;
  const badgeCount = state.unreadCount + liveAlerts;

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe lg:hidden"
      aria-label="Mobile navigation"
      style={{
        background: "rgba(10,10,10,0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid #242424",
      }}
    >
      <div className="flex items-center justify-around h-16">
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[56px] transition-colors"
            >
              {/* Notification badge dot */}
              {item.isNotif && badgeCount > 0 && (
                <span
                  className="absolute top-1 right-2.5 flex items-center justify-center rounded-full font-semibold"
                  style={{
                    background: "#bef532",
                    color: "#000000",
                    fontSize: "8px",
                    minWidth: "14px",
                    height: "14px",
                    padding: "0 3px",
                    boxShadow: "0 0 6px rgba(190,245,50,0.6)",
                    lineHeight: "14px",
                  }}
                >
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              )}

              <item.icon
                size={20}
                style={{ color: active ? "#bef532" : "#808080" }}
              />
              <span
                className="text-[10px] leading-none tracking-wide font-medium"
                style={{
                  color: active ? "#bef532" : "#808080",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {item.label}
              </span>
              {active && (
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: "#bef532", boxShadow: "0 0 4px rgba(190,245,50,0.8)" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
