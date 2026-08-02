import { useId } from "react";

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7">
      <path d="M4.5 7.5 7 4h10l2.5 3.5v11A1.5 1.5 0 0 1 18 20H6a1.5 1.5 0 0 1-1.5-1.5v-11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4.5 13h4l1.5 2h4l1.5-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** An accessible empty-data placeholder with an optional call to action. */
export default function EmptyState({
  title = "Nothing to show yet",
  description = "New items will appear here when they are available.",
  icon,
  action,
  compact = false,
  className = "",
}) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`rounded-2xl border border-dashed border-luxury-border bg-luxury-card/50 text-center ${
        compact ? "px-5 py-8" : "px-6 py-12"
      } ${className}`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-400" aria-hidden="true">
        {icon || <InboxIcon />}
      </div>
      <h2 id={titleId} className="mt-4 text-base font-semibold text-luxury-text">
        {title}
      </h2>
      {description ? <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-luxury-muted">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </section>
  );
}
