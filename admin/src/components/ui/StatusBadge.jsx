import { formatStatusLabel } from "../../utils/formatters";

const STATUS_TONES = {
  active: "success",
  approved: "success",
  completed: "success",
  delivered: "success",
  paid: "success",
  refunded: "success",
  shipped: "success",
  in_transit: "info",
  out_for_delivery: "info",
  processing: "info",
  confirmed: "info",
  ready_to_ship: "info",
  pending: "warning",
  pickup_requested: "warning",
  review: "warning",
  unpaid: "warning",
  cancelled: "danger",
  failed: "danger",
  inactive: "danger",
  rejected: "danger",
  returned: "danger",
  rto: "danger",
};

const TONE_STYLES = {
  success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  info: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  danger: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  neutral: "border-white/10 bg-white/5 text-luxury-muted",
};

const DOT_STYLES = {
  success: "bg-emerald-400",
  info: "bg-sky-400",
  warning: "bg-amber-400",
  danger: "bg-rose-400",
  neutral: "bg-zinc-400",
};

const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();

export const getStatusTone = (status) => STATUS_TONES[normalizeStatus(status)] || "neutral";

/** A compact textual status indicator that is safe to reuse across admin entities. */
export default function StatusBadge({
  status,
  label,
  tone,
  showDot = true,
  size = "sm",
  className = "",
}) {
  const resolvedTone = TONE_STYLES[tone] ? tone : getStatusTone(status);
  const resolvedLabel = label || formatStatusLabel(status);
  const sizeClass = size === "md" ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border font-medium ${sizeClass} ${TONE_STYLES[resolvedTone]} ${className}`}
    >
      {showDot ? <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[resolvedTone]}`} /> : null}
      {resolvedLabel}
    </span>
  );
}
