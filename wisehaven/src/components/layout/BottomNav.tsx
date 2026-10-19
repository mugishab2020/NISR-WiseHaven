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
  { label: "Overview",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Envelopes", href: "/envelopes",  icon: Lock             },
  { label: "Vault",     href: "/vault",      icon: Shield           },
  { label: "Activity",  href: "/activity",   icon: Receipt          },
  { label: "Settings",  href: "/settings",   icon: Settings         },
];

export default function BottomNav() {
  const pathname = usePathname();

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
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[56px] transition-colors"
            >
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
