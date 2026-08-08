import { Star } from "lucide-react";

const ROWS = [5, 4, 3, 2, 1];

/**
 * Renders five Star -> Progress -> Count rows for the rating distribution.
 * Percentages and counts are derived dynamically from the provided stats.
 *
 * @param {object} counts - { 5: n, 4: n, 3: n, 2: n, 1: n }
 * @param {number} total  - Total number of reviews
 */
export default function RatingBreakdown({ counts = {}, total = 0 }) {
  return (
    <ul className="space-y-3">
      {ROWS.map((value) => {
        const count = Number(counts?.[value] || 0);
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <li key={value} className="flex items-center gap-3">
            <span className="flex w-20 shrink-0 items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 ${
                    i < value
                      ? "fill-[#D4A853] text-[#D4A853]"
                      : "fill-transparent text-zinc-700"
                  }`}
                />
              ))}
            </span>

            <span
              className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${value} star reviews`}
            >
              <span
                className="block h-full rounded-full bg-gradient-to-r from-[#D4A853] to-[#C9963B] transition-all duration-700 ease-out"
                style={{ width: `${percent}%` }}
              />
            </span>

            <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums text-zinc-400">
              {count}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
