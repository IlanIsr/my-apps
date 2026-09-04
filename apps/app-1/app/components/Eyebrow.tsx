type Tone = "birthday" | "yahrzeit" | "muted";

const TONE: Record<Tone, string> = {
  birthday: "text-birthday",
  yahrzeit: "text-yahrzeit",
  muted: "text-subtle-foreground",
};

/**
 * A mono, uppercase, letter-spaced label. With `tone` "birthday"/"yahrzeit" it
 * carries the accent colour and a leading marker — a round dot for a birthday,
 * a rotated square (diamond) for a yahrzeit.
 */
export function Eyebrow({
  children,
  tone = "muted",
  marker = false,
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  marker?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[10.5px] font-medium tracking-[0.12em] uppercase ${TONE[tone]} ${className}`}
    >
      {marker && tone !== "muted" && (
        <span
          aria-hidden
          className={`inline-block h-[7px] w-[7px] shrink-0 ${
            tone === "birthday"
              ? "rounded-full bg-birthday"
              : "rotate-45 bg-yahrzeit"
          }`}
        />
      )}
      {children}
    </span>
  );
}
