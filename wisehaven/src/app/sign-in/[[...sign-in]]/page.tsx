import { SignIn } from "@clerk/nextjs";
import { Lock, Zap, Shield, Home } from "lucide-react";

// ── Static envelope preview data (matches demo seed) ─────────────────────────
const ENVELOPES = [
  {
    icon: Home,
    name: "Monthly Rent",
    amount: "100,000",
    status: "Locked",
    statusColor: "#BEF532",
    statusBg: "rgba(190,245,50,0.12)",
    progress: 78,
    sub: "Matures: 25 Nov, 09:00",
    subIcon: Lock,
    subColor: "#BEF532",
  },
  {
    icon: Zap,
    name: "Utilities & Wi-Fi",
    amount: "15,000",
    status: "Unlocking Soon",
    statusColor: "#A3D800",
    statusBg: "rgba(163,216,0,0.10)",
    progress: 94,
    sub: "02d : 14h : 18m",
    subIcon: Lock,
    subColor: "#A3D800",
  },
  {
    icon: Shield,
    name: "Emergency Reserve",
    amount: "25,000",
    status: "Guardian Locked",
    statusColor: "#8D937B",
    statusBg: "rgba(141,147,123,0.12)",
    progress: 40,
    sub: "Dual-Key Authorization",
    subIcon: Shield,
    subColor: "#8D937B",
  },
];

// ── Clerk appearance overrides to match the design system ─────────────────────
const CLERK_APPEARANCE = {
  variables: {
    colorBackground:        "#131313",
    colorInputBackground:   "#1C1B1B",
    colorInputText:         "#E5E2E1",
    colorText:              "#E5E2E1",
    colorTextSecondary:     "#C8C6C5",
    colorPrimary:           "#BEF532",
    colorDanger:            "#FFB4AB",
    colorSuccess:           "#BEF532",
    borderRadius:           "8px",
    fontFamily:             "Inter, sans-serif",
    fontFamilyButtons:      "Inter, sans-serif",
    fontSize:               "14px",
  },
  elements: {
    // Card shell — transparent so our background shows through
    card:                   "bg-transparent shadow-none border-0 p-0",
    rootBox:                "w-full",
    // Header
    headerTitle:            "text-white font-geist font-semibold text-[22px] tracking-tight",
    headerSubtitle:         "text-[#C8C6C5] text-[13px]",
    // Social buttons
    socialButtonsBlockButton:
      "bg-[#1C1B1B] border border-[#353534] text-[#E5E2E1] hover:bg-[#2A2A2A] hover:border-[#BEF532] transition-all",
    socialButtonsBlockButtonText: "text-[#E5E2E1] font-medium text-[13px]",
    // Divider
    dividerLine:            "bg-[#353534]",
    dividerText:            "text-[#8D937B] text-[11px] uppercase tracking-wider",
    // Form fields
    formFieldLabel:         "text-[#C3C9AE] text-[11px] uppercase tracking-wider font-medium mb-1",
    formFieldInput:
      "bg-[#1C1B1B] border border-[#353534] text-[#E5E2E1] placeholder-[#8D937B] focus:border-[#BEF532] focus:ring-1 focus:ring-[#BEF532] focus:ring-opacity-40 rounded-lg transition-all",
    formFieldInputShowPasswordButton: "text-[#8D937B] hover:text-[#BEF532]",
    // Primary button
    formButtonPrimary:
      "bg-[#BEF532] text-[#000000] font-semibold hover:bg-[#A3D800] active:bg-[#A3D800] transition-colors rounded-lg",
    // Footer / links
    footerActionLink:       "text-[#BEF532] hover:text-[#A3D800] font-medium",
    footerActionText:       "text-[#8D937B]",
    footer:                 "hidden",           // hide "Secured by Clerk" footer
    // Error
    formFieldErrorText:     "text-[#FFB4AB] text-[11px]",
    // Internal card body padding reset
    cardBox:                "p-0",
    main:                   "gap-4",
  },
};

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0E0E0E" }}
    >
      {/* Ambient glow */}
      <div
        className="fixed -top-48 -left-48 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "rgba(190,245,50,0.04)", filter: "blur(120px)" }}
      />
      <div
        className="fixed -bottom-48 -right-48 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "rgba(190,245,50,0.03)", filter: "blur(100px)" }}
      />

      {/* Two-column card */}
      <div
        className="relative w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden"
        style={{
          background: "#131313",
          border: "1px solid #242424",
          borderRadius: "16px",
          minHeight: "640px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* ── LEFT: Brand panel ─────────────────────────────── */}
        <div
          className="hidden lg:flex lg:w-[55%] flex-col justify-between p-10 relative overflow-hidden"
          style={{ background: "#0E0E0E", borderRight: "1px solid #1a1a1a" }}
        >
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#BEF532 1px, transparent 1px), linear-gradient(90deg, #BEF532 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 flex flex-col gap-8 flex-1">
            {/* Brand identity */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-9 h-9 flex items-center justify-center font-bold text-sm"
                  style={{
                    background: "#BEF532",
                    color: "#000",
                    borderRadius: "8px 8px 8px 3px",
                    fontFamily: "Geist, sans-serif",
                  }}
                >
                  W
                </div>
                <div>
                  <span
                    className="font-semibold text-[17px] tracking-tight text-white flex items-center gap-2"
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    WiseHaven
                    <span
                      className="px-1.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider"
                      style={{ background: "#BEF532", color: "#000" }}
                    >
                      RW
                    </span>
                  </span>
                  <p
                    className="text-[9px] uppercase tracking-[0.2em] mt-0.5"
                    style={{ color: "#8D937B", fontFamily: "JetBrains Mono, monospace" }}
                  >
                    Digital Vault Protocol
                  </p>
                </div>
              </div>

              {/* KIGALI tag */}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium"
                  style={{
                    background: "rgba(190,245,50,0.08)",
                    color: "#BEF532",
                    fontFamily: "JetBrains Mono, monospace",
                    border: "1px solid rgba(190,245,50,0.15)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#BEF532" }}
                  />
                  Kigali Synced Protocol
                </span>
              </div>
            </div>

            {/* Hero copy */}
            <div className="flex flex-col gap-3">
              <h1
                className="text-[38px] font-semibold tracking-tight leading-[1.1] text-white"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Your money.
                <br />
                <span style={{ color: "#BEF532" }}>Your rules.</span>
              </h1>
              <p
                className="text-[14px] leading-relaxed max-w-sm"
                style={{ color: "#C8C6C5" }}
              >
                Build better money habits by giving every franc a purpose. Lock
                in your priorities. Unlock financial peace of mind.
              </p>
            </div>

            {/* Live envelope previews */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "#8D937B", fontFamily: "JetBrains Mono, monospace" }}
                >
                  Active Vault Envelopes
                </span>
                <span
                  className="flex items-center gap-1 text-[10px] font-medium"
                  style={{ color: "#BEF532", fontFamily: "JetBrains Mono, monospace" }}
                >
                  <Lock size={10} />
                  Enforced
                </span>
              </div>

              {ENVELOPES.map((env) => {
                const Icon = env.icon;
                const SubIcon = env.subIcon;
                return (
                  <div
                    key={env.name}
                    className="flex items-center justify-between p-3 rounded-xl transition-colors"
                    style={{
                      background: "#1C1B1B",
                      border: "1px solid #242424",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#2A2A2A" }}
                      >
                        <Icon size={15} style={{ color: env.statusColor }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-white">
                            {env.name}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase"
                            style={{
                              background: env.statusBg,
                              color: env.statusColor,
                            }}
                          >
                            {env.status}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-1 text-[11px] mt-0.5"
                          style={{ color: "#8D937B" }}
                        >
                          <SubIcon size={9} style={{ color: env.subColor }} />
                          {env.sub}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className="text-[13px] font-semibold text-white"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {env.amount}
                        <span
                          className="text-[9px] ml-0.5"
                          style={{ color: "#8D937B" }}
                        >
                          RWF
                        </span>
                      </span>
                      <div
                        className="w-20 h-[3px] rounded-full mt-1.5 overflow-hidden"
                        style={{ background: "#2A2A2A" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${env.progress}%`,
                            background: env.statusColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom trust indicators */}
          <div
            className="relative z-10 pt-6 flex items-center gap-6 border-t"
            style={{ borderColor: "#1a1a1a" }}
          >
            {[
              { label: "Demo Mode", sub: "Simulated RWF only" },
              { label: "PostgreSQL", sub: "Persisted data" },
              { label: "Clerk Auth", sub: "Secure sign-in" },
            ].map((t) => (
              <div key={t.label} className="flex flex-col gap-0.5">
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "#BEF532", fontFamily: "JetBrains Mono, monospace" }}
                >
                  {t.label}
                </span>
                <span className="text-[10px]" style={{ color: "#8D937B" }}>
                  {t.sub}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Clerk sign-in form ──────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12">
          {/* Mobile brand (hidden on desktop) */}
          <div className="flex lg:hidden flex-col items-center gap-2 mb-8">
            <div
              className="w-10 h-10 flex items-center justify-center font-bold text-sm"
              style={{
                background: "#BEF532",
                color: "#000",
                borderRadius: "8px 8px 8px 3px",
                fontFamily: "Geist, sans-serif",
              }}
            >
              W
            </div>
            <span
              className="font-semibold text-[17px] tracking-tight text-white"
              style={{ fontFamily: "Geist, sans-serif" }}
            >
              WiseHaven
            </span>
          </div>

          <div className="w-full max-w-sm">
            <SignIn appearance={CLERK_APPEARANCE} />
          </div>

          {/* Demo disclaimer */}
          <p
            className="mt-6 text-center text-[11px] leading-relaxed max-w-xs"
            style={{
              color: "#8D937B",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            ⚠ DEMO MODE — All balances are simulated.
            <br />
            No real money is stored, moved, or at risk.
          </p>
        </div>
      </div>
    </div>
  );
}
