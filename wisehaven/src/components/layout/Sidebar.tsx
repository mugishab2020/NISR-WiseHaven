"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard, Lock, Shield, Receipt, Bell, Settings, User, LogOut,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const NAV_ITEMS = [
  { label: "Overview",        href: "/dashboard",     icon: LayoutDashboard },
  { label: "Envelopes",       href: "/envelopes",     icon: Lock            },
  { label: "Emergency Vault", href: "/vault",         icon: Shield          },
  { label: "Activity",        href: "/activity",      icon: Receipt         },
  { label: "Notifications",   href: "/notifications", icon: Bell            },
  { label: "Settings",        href: "/settings",      icon: Settings        },
];

export default function Sidebar() {
  const pathname    = usePathname();
  const { state }   = useApp();
  const { signOut } = useClerk();
  const { user }    = useUser();

  const activeEnvelopes = state.envelopes.filter((e) => !e.is_emergency_vault).length;
  // Use backend unread count + live envelope alerts for the badge
  const liveAlerts = state.envelopes.filter(
    (e) => !e.is_emergency_vault && e.temporal_lock?.status === "RELEASED"
  ).length;
  const badgeCount = state.unreadCount + liveAlerts;

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="fixed left-0 h-full w-64 z-50 flex flex-col justify-between py-6"
      style={{ top: "0", background: "#101010", borderRight: "1px solid #242424" }}
    >
      <div className="flex flex-col gap-6">
        {/* Brand */}
        <div className="px-5 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center font-bold text-sm font-geist"
              style={{ background: "#bef532", color: "#000000", borderRadius: "8px 8px 8px 3px" }}>W</div>
            <span className="font-geist font-semibold text-[17px] tracking-tight text-white">WiseHaven</span>
          </div>
          <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] pl-11" style={{ color: "#ffb800", fontSize: "9px" }}>DEMO · No real money</p>
        </div>

        <div style={{ height: "1px", background: "#242424", margin: "0 20px" }} />

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 px-3" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const isNotif = item.label === "Notifications";
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group"
                style={active
                  ? { background: "rgba(190,245,50,0.08)", borderLeft: "2px solid #bef532", paddingLeft: "10px" }
                  : { color: "#808080" }}>
                <div className="flex items-center gap-3">
                  {/* Bell with dot overlay when there are unread notifications */}
                  <div className="relative">
                    <item.icon size={16} style={{ color: active ? "#bef532" : "#808080" }} />
                    {isNotif && badgeCount > 0 && !active && (
                      <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full"
                        style={{ background: "#bef532", boxShadow: "0 0 4px rgba(190,245,50,0.7)" }} />
                    )}
                  </div>
                  <span className="font-body-md text-body-md transition-colors group-hover:text-white"
                    style={{ color: active ? "#ffffff" : "#808080", fontWeight: active ? 500 : 400 }}>
                    {item.label}
                  </span>
                </div>
                {isNotif && badgeCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ background: "#bef532", color: "#000000", fontSize: "9px", minWidth: "16px", textAlign: "center" }}>
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 px-3">
        <div className="p-3 rounded-lg flex flex-col gap-2" style={{ background: "#171717", border: "1px solid #242424" }}>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Status</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#bef532" }} />
              <span className="font-label-sm text-label-sm font-medium" style={{ color: "#bef532" }}>Demo</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Envelopes</span>
            <span className="font-label-sm text-label-sm font-semibold text-white font-mono">{activeEnvelopes}</span>
          </div>
        </div>

        <div style={{ height: "1px", background: "#242424" }} />

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#202020", border: "1px solid #303030" }}>
              <User size={14} style={{ color: "#808080" }} />
            </div>
            <div className="flex flex-col">
              <span className="font-body-sm text-body-sm text-white font-medium leading-none">
                {user?.firstName ?? "User"}
              </span>
              <span className="font-label-sm text-label-sm mt-0.5" style={{ color: "#808080" }}>Demo account</span>
            </div>
          </div>
          <button onClick={() => signOut({ redirectUrl: "/" })}
            className="p-1.5 rounded-lg transition-colors hover:bg-[#202020]"
            title="Sign out" aria-label="Sign out" style={{ color: "#808080" }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
