"use client";

import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import BottomNav from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Desktop top header — hidden on mobile */}
      <div className="hidden lg:block">
        <TopHeader />
      </div>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container flex items-center justify-between px-gutter-mobile pt-safe">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary-container flex items-center justify-center">
            <span className="text-on-primary font-bold text-xs font-geist">W</span>
          </div>
          <span className="font-geist font-semibold text-headline-sm text-primary tracking-tight">
            WiseHaven
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-primary-container/20 text-primary-fixed font-label-sm text-label-sm font-semibold">
            RW
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest hidden sm:inline">
            Kigali
          </span>
        </div>
      </header>

      {/* Main content area */}
      <main
        className={`
          min-h-screen
          lg:pl-64 lg:pt-16
          pt-14 pb-20 lg:pb-0
        `}
      >
        <div className="w-full px-gutter-mobile lg:px-gutter py-space-md lg:py-space-lg max-w-[1440px]">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <BottomNav />
    </div>
  );
}
