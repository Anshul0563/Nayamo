import { useId } from "react";

/** A consistent, semantic heading block for admin screens. */
export default function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  children,
  className = "",
  titleId,
}) {
  const generatedId = useId();
  const headingId = titleId || `page-header-${generatedId}`;
  const rightContent = actions ?? children;

  return (
    <header
      className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}
      aria-labelledby={title ? headingId : undefined}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h1 id={headingId} className="text-2xl font-semibold tracking-tight text-luxury-text md:text-3xl">
            {title}
          </h1>
        ) : null}
        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-luxury-muted">{description}</p>
        ) : null}
      </div>

      {rightContent ? (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">{rightContent}</div>
      ) : null}
    </header>
  );
}
