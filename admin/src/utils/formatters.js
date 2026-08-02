const DEFAULT_LOCALE = "en-IN";
const EMPTY_VALUE = "—";

const toValidDate = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Formats a numeric value as a currency amount. Invalid values intentionally
 * render as an em dash so tables do not imply a zero-value transaction.
 */
export const formatCurrency = (value, options = {}) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return options.fallback || EMPTY_VALUE;

  const {
    locale = DEFAULT_LOCALE,
    currency = "INR",
    fallback: _fallback,
    ...numberOptions
  } = options;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      ...numberOptions,
    }).format(amount);
  } catch {
    return options.fallback || EMPTY_VALUE;
  }
};

export const formatNumber = (value, options = {}) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return options.fallback || EMPTY_VALUE;

  const { locale = DEFAULT_LOCALE, fallback: _fallback, ...numberOptions } = options;

  try {
    return new Intl.NumberFormat(locale, numberOptions).format(number);
  } catch {
    return options.fallback || EMPTY_VALUE;
  }
};

export const formatPercent = (value, options = {}) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return options.fallback || EMPTY_VALUE;

  const { locale = DEFAULT_LOCALE, fallback: _fallback, ...numberOptions } = options;

  try {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 1,
      ...numberOptions,
    }).format(number > 1 ? number / 100 : number);
  } catch {
    return options.fallback || EMPTY_VALUE;
  }
};

export const formatDate = (value, options = {}) => {
  const date = toValidDate(value);
  if (!date) return options.fallback || EMPTY_VALUE;

  const { locale = DEFAULT_LOCALE, fallback: _fallback, ...dateOptions } = options;
  const hasStyle = dateOptions.dateStyle || dateOptions.timeStyle;

  try {
    return new Intl.DateTimeFormat(
      locale,
      hasStyle
        ? dateOptions
        : { day: "numeric", month: "short", year: "numeric", ...dateOptions },
    ).format(date);
  } catch {
    return options.fallback || EMPTY_VALUE;
  }
};

export const formatDateTime = (value, options = {}) => {
  const date = toValidDate(value);
  if (!date) return options.fallback || EMPTY_VALUE;

  const { locale = DEFAULT_LOCALE, fallback: _fallback, ...dateOptions } = options;
  const hasStyle = dateOptions.dateStyle || dateOptions.timeStyle;

  try {
    return new Intl.DateTimeFormat(
      locale,
      hasStyle
        ? dateOptions
        : {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            ...dateOptions,
          },
    ).format(date);
  } catch {
    return options.fallback || EMPTY_VALUE;
  }
};

const ACRONYMS = new Set(["cod", "gst", "otp", "rto", "upi", "sku", "api"]);

/** Turns `out_for_delivery` or `readyToShip` into a human-readable label. */
export const formatStatusLabel = (value, fallback = EMPTY_VALUE) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return fallback;
  }

  return String(value)
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .map((word) => {
      const normalized = word.toLowerCase();
      if (ACRONYMS.has(normalized)) return normalized.toUpperCase();
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .join(" ");
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatStatusLabel,
};
