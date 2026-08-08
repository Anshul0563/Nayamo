import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const OPTIONS = [
  { value: "highest", label: "Highest Rating" },
  { value: "lowest", label: "Lowest Rating" },
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest" },
];

/**
 * Keyboard-accessible, functional dropdown for sorting reviews.
 * @param {string} value  - current sort value
 * @param {function} onChange - called with new sort value
 */
export default function ReviewSort({ value = "highest", onChange }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);

  const current = OPTIONS.find((o) => o.value === value) || OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event) => {
    if (
      !open &&
      (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % OPTIONS.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + OPTIONS.length) % OPTIONS.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChange(OPTIONS[activeIndex].value);
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const selectOption = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort reviews"
        className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-zinc-200 backdrop-blur-xl transition-all duration-300 hover:border-[#D4A853]/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]/50"
      >
        <SlidersHorizontal className="h-4 w-4 text-[#D4A853]" />
        <span className="hidden text-zinc-400 sm:inline">Sort:</span>
        <span className="text-white">{current.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#D4A853] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sort options"
          className="absolute left-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#18181C] p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          {OPTIONS.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
            >
              <button
                type="button"
                onClick={() => selectOption(option)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  option.value === value
                    ? "bg-[#D4A853]/15 text-[#D4A853]"
                    : activeIndex === index && open
                      ? "bg-white/[0.05] text-white"
                      : "text-zinc-300 hover:bg-[#D4A5A5]/10 hover:text-[#ECC5C5]"
                }`}
              >
                {option.label}
                {option.value === value && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4A853]" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
