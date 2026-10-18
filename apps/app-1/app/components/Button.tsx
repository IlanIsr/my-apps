/**
 * app-1's button — a thin wrapper over `<button>` with three visual variants
 * drawn from the parchment/ink palette. (Not `@repo/ui/button`, which is the
 * untouched starter component.)
 */

type Variant = "primary" | "outline" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90",
  outline:
    "border border-border-strong bg-card text-foreground font-medium hover:bg-muted",
  ghost: "text-muted-foreground font-medium hover:text-foreground",
};

/**
 * @param variant - `"primary"` (default), `"outline"`, or `"ghost"`.
 * All other `<button>` props (including `className`, which is appended) pass through.
 */
export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-field px-4 py-2.5 text-sm transition-opacity disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    />
  );
}
