import type { EnvelopeStatus } from "@/types";
import { Lock, Unlock, CheckCircle, Check } from "lucide-react";

interface EnvelopeStatusBadgeProps {
  status: EnvelopeStatus;
  className?: string;
}

const CONFIG: Record<
  EnvelopeStatus,
  { label: string; className: string; Icon: typeof Lock }
> = {
  locked: {
    label: "Locked",
    className:
      "bg-primary-container/10 text-primary-fixed border border-primary-fixed/20",
    Icon: Lock,
  },
  unlocking_soon: {
    label: "Unlocking Soon",
    className:
      "bg-primary-container text-on-primary font-bold animate-pulse",
    Icon: Unlock,
  },
  ready_to_pay: {
    label: "Ready to Pay",
    className: "bg-primary-container text-on-primary font-bold",
    Icon: CheckCircle,
  },
  paid: {
    label: "Paid",
    className: "bg-surface-container-high text-outline border border-surface-container-highest",
    Icon: Check,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-error-container/20 text-error border border-error/20",
    Icon: Lock,
  },
};

export default function EnvelopeStatusBadge({
  status,
  className,
}: EnvelopeStatusBadgeProps) {
  const { label, className: base, Icon } = CONFIG[status];

  return (
    <span
      role="status"
      aria-label={`Envelope status: ${label}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-medium ${base} ${className ?? ""}`}
    >
      <Icon size={10} />
      <span>{label}</span>
    </span>
  );
}
