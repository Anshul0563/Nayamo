const TONE_STYLES = {
  info: "border-sky-400/25 bg-sky-400/10 text-sky-100",
  success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-100",
  error: "border-rose-400/25 bg-rose-400/10 text-rose-100",
};

const ICON_STYLES = {
  info: "text-sky-300",
  success: "text-emerald-300",
  warning: "text-amber-300",
  error: "text-rose-300",
};

function AlertIcon({ tone }) {
  if (tone === "success") {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
        <path d="m5 10 3.1 3.1L15.5 5.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.2v4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="13.7" r="1" fill="currentColor" />
    </svg>
  );
}

/** A polite status message or assertive error message with an optional action. */
export default function InlineAlert({
  tone = "info",
  title,
  message,
  children,
  action,
  onDismiss,
  dismissLabel = "Dismiss notification",
  className = "",
}) {
  const resolvedTone = TONE_STYLES[tone] ? tone : "info";
  const content = children ?? message;
  const isAssertive = resolvedTone === "error" || resolvedTone === "warning";

  return (
    <div
      role={isAssertive ? "alert" : "status"}
      aria-live={isAssertive ? "assertive" : "polite"}
      aria-atomic="true"
      className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${TONE_STYLES[resolvedTone]} ${className}`}
    >
      <span className={`mt-0.5 shrink-0 ${ICON_STYLES[resolvedTone]}`}>
        <AlertIcon tone={resolvedTone} />
      </span>

      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {content ? <div className={title ? "mt-1 leading-5 opacity-90" : "leading-5"}>{content}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-current/75 transition-colors hover:bg-black/10 hover:text-current focus:outline-none focus:ring-2 focus:ring-current/50"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
            <path d="m6 6 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
