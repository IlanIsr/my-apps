/**
 * The one decoration in the system: a hairline with a small rotated square at
 * its centre. Use at most once per view. `full` stretches the rules to fill the
 * row; otherwise they stay short.
 */
export function Ornament({
  full = false,
  className = "",
}: {
  full?: boolean;
  className?: string;
}) {
  const rule = full ? "flex-1" : "w-9";
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center gap-2.5 ${className}`}
    >
      <span className={`h-px bg-ornament ${rule}`} />
      <span className="h-1.5 w-1.5 rotate-45 bg-ornament" />
      <span className={`h-px bg-ornament ${rule}`} />
    </div>
  );
}
