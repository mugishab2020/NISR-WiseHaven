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
    <div className="flex flex-col items-center text-center justify-center py-16 px-8 gap-4">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
        <Icon size={28} />
      </div>
      <div className="flex flex-col gap-1 max-w-xs">
        <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
          {title}
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && (
        actionHref ? (
          <Link
            href={actionHref}
            className="mt-2 px-4 py-2.5 rounded bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:opacity-90 transition-opacity"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="mt-2 px-4 py-2.5 rounded bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:opacity-90 transition-opacity"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
