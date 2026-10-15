"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lock,
  Shield,
  Receipt,
  Settings,
} from "lucide-react";

const MOBILE_NAV = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Envelopes", href: "/envelopes", icon: Lock },
  { label: "Vault", href: "/vault", icon: Shield },
  { label: "Activity", href: "/activity", icon: Receipt },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-surface-container pb-safe lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]
                ${active ? "text-primary-fixed" : "text-on-surface-variant"}
              `}
            >
              <item.icon size={20} />
              <span className="font-label-sm text-[10px] leading-none">{item.label}</span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-primary-fixed" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
