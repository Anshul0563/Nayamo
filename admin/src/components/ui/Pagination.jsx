const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getPageItems = (currentPage, totalPages, siblingCount) => {
  const pages = new Set([1, totalPages]);
  const start = Math.max(2, currentPage - siblingCount);
  const end = Math.min(totalPages - 1, currentPage + siblingCount);

  for (let page = start; page <= end; page += 1) pages.add(page);

  return [...pages]
    .sort((a, b) => a - b)
    .reduce((items, page) => {
      const previous = items[items.length - 1];
      if (typeof previous === "number" && page - previous > 1) items.push("ellipsis");
      items.push(page);
      return items;
    }, []);
};

function PageButton({ children, current, disabled, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={current ? "page" : undefined}
      aria-label={label}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400/60 disabled:pointer-events-none disabled:opacity-45 ${
        current
          ? "bg-gold-500 text-luxury-black"
          : "text-luxury-muted hover:bg-white/5 hover:text-luxury-text"
      }`}
    >
      {children}
    </button>
  );
}

/** Compact, keyboard-accessible pagination for paginated admin tables. */
export default function Pagination({
  page = 1,
  totalPages = 1,
  totalItems,
  itemsPerPage,
  siblingCount = 1,
  showSummary = false,
  disabled = false,
  onPageChange,
  ariaLabel = "Pagination",
  className = "",
}) {
  const pageCount = Math.max(1, Math.floor(Number(totalPages) || 1));
  const currentPage = clamp(Math.floor(Number(page) || 1), 1, pageCount);
  const safeSiblingCount = Math.max(0, Math.floor(Number(siblingCount) || 0));
  const canChangePage = !disabled && typeof onPageChange === "function";

  if (pageCount <= 1 && !showSummary) return null;

  const summary = (() => {
    const total = Number(totalItems);
    const perPage = Number(itemsPerPage);
    if (Number.isFinite(total) && Number.isFinite(perPage) && total >= 0 && perPage > 0) {
      const firstItem = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
      const lastItem = Math.min(currentPage * perPage, total);
      return `Showing ${firstItem}–${lastItem} of ${total}`;
    }
    return `Page ${currentPage} of ${pageCount}`;
  })();

  const goToPage = (nextPage) => {
    const target = clamp(nextPage, 1, pageCount);
    if (canChangePage && target !== currentPage) onPageChange(target);
  };

  return (
    <nav
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
      aria-label={ariaLabel}
    >
      {showSummary ? <p className="text-sm text-luxury-muted">{summary}</p> : <span />}

      {pageCount > 1 ? (
        <div className="flex items-center gap-1" aria-label="Page controls">
          <PageButton
            disabled={!canChangePage || currentPage === 1}
            label="Go to previous page"
            onClick={() => goToPage(currentPage - 1)}
          >
            <span aria-hidden="true">←</span>
          </PageButton>

          {getPageItems(currentPage, pageCount, safeSiblingCount).map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="inline-flex h-9 min-w-7 items-center justify-center text-luxury-dim" aria-hidden="true">
                …
              </span>
            ) : (
              <PageButton
                key={item}
                current={item === currentPage}
                disabled={!canChangePage}
                label={item === currentPage ? `Page ${item}, current page` : `Go to page ${item}`}
                onClick={() => goToPage(item)}
              >
                {item}
              </PageButton>
            ),
          )}

          <PageButton
            disabled={!canChangePage || currentPage === pageCount}
            label="Go to next page"
            onClick={() => goToPage(currentPage + 1)}
          >
            <span aria-hidden="true">→</span>
          </PageButton>
        </div>
      ) : null}
    </nav>
  );
}
