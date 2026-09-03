type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  "aria-label": string;
};

export function Switch({ checked, onChange, "aria-label": ariaLabel }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-foreground" : "bg-foreground/30"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
          checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
