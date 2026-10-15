"use client";

import { useApp } from "@/context/AppContext";
import { formatRWF } from "@/lib/currency";

interface CurrencyDisplayProps {
  amount: number;
  /** Size variant */
  size?: "xl" | "lg" | "md" | "sm";
  /** Show RWF unit suffix */
  showUnit?: boolean;
  /** Colour override */
  className?: string;
  unitClassName?: string;
}

/**
 * Displays a RWF amount respecting the global privacy mode.
 * Uses JetBrains Mono with tabular figures.
 */
export default function CurrencyDisplay({
  amount,
  size = "md",
  showUnit = true,
  className,
  unitClassName,
}: CurrencyDisplayProps) {
  const { privacyMode } = useApp();

  const textSizeMap = {
    xl: "font-headline-xl text-headline-xl",
    lg: "font-headline-lg text-headline-lg",
    md: "font-headline-md text-headline-md",
    sm: "font-headline-sm text-headline-sm",
  };

  const unitSizeMap = {
    xl: "font-label-lg text-label-lg",
    lg: "font-label-md text-label-md",
    md: "font-label-sm text-label-sm",
    sm: "font-label-sm text-label-sm",
  };

  const displayValue = privacyMode ? "••••••" : formatRWF(amount);

  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        className={`font-mono tabular-nums font-bold text-primary ${textSizeMap[size]} ${className ?? ""}`}
        aria-label={privacyMode ? "Hidden amount" : `${formatRWF(amount)} Rwandan francs`}
      >
        {displayValue}
      </span>
      {showUnit && (
        <span
          className={`font-mono text-primary-fixed ${unitSizeMap[size]} ${unitClassName ?? ""}`}
        >
          RWF
        </span>
      )}
    </span>
  );
}
