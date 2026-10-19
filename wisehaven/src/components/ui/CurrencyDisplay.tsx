"use client";

import { useApp } from "@/context/AppContext";
import { formatRWF } from "@/lib/currency";

interface CurrencyDisplayProps {
  amount: number;
  size?: "xl" | "lg" | "md" | "sm";
  showUnit?: boolean;
  className?: string;
  unitClassName?: string;
}

const TEXT_SIZE: Record<string, string> = {
  xl: "text-[40px] leading-[48px] tracking-[-0.02em] font-semibold",
  lg: "text-[30px] leading-[38px] tracking-[-0.015em] font-semibold",
  md: "text-[22px] leading-[28px] tracking-[-0.01em] font-medium",
  sm: "text-[18px] leading-[24px] font-medium",
};

const UNIT_SIZE: Record<string, string> = {
  xl: "text-[14px] leading-[20px] tracking-[0.02em]",
  lg: "text-[12px] leading-[16px] tracking-[0.04em]",
  md: "text-[10px] leading-[14px] tracking-[0.05em]",
  sm: "text-[10px] leading-[14px] tracking-[0.05em]",
};

/**
 * Displays a RWF amount respecting global privacy mode.
 * Enforces JetBrains Mono with tnum + slashed-zero OpenType features.
 */
export default function CurrencyDisplay({
  amount,
  size = "md",
  showUnit = true,
  className,
  unitClassName,
}: CurrencyDisplayProps) {
  const { privacyMode } = useApp();

  const displayValue = privacyMode ? "••••••" : formatRWF(amount);

  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        className={`font-mono tabular-nums font-bold text-primary-fixed ${TEXT_SIZE[size]} ${className ?? ""}`}
        style={{ fontFeatureSettings: '"tnum" 1, "zero" 1, "ss01" 1' }}
        aria-label={privacyMode ? "Hidden amount" : `${formatRWF(amount)} Rwandan francs`}
      >
        {displayValue}
      </span>
      {showUnit && (
        <span
          className={`font-mono text-outline font-medium ${UNIT_SIZE[size]} ${unitClassName ?? ""}`}
          style={{ fontFeatureSettings: '"tnum" 1, "zero" 1' }}
        >
          RWF
        </span>
      )}
    </span>
  );
}
