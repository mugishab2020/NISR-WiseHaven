import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center text-center justify-center py-14 px-8 gap-5 rounded-xl"
      style={{ background: "transparent", border: "1px dashed #303030" }}
    >
      {/* Icon container */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "#171717", border: "1px solid #242424" }}
      >
        <Icon size={24} style={{ color: "#808080" }} />
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-1.5 max-w-xs">
        <h3 className="font-geist font-semibold text-[18px] text-white">
          {title}
        </h3>
        <p className="font-body-sm text-body-sm leading-relaxed" style={{ color: "#b5b5b5" }}>
          {description}
        </p>
      </div>

      {/* Action */}
      {actionLabel && (
        actionHref ? (
          <Link
            href={actionHref}
            className="mt-1 px-5 py-2.5 rounded-lg font-body-sm text-body-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#bef532", color: "#000000" }}
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="mt-1 px-5 py-2.5 rounded-lg font-body-sm text-body-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#bef532", color: "#000000" }}
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
