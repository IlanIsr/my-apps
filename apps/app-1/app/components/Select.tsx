export type Option = { key: string; label: string };

type Props = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export function Select({ label, options, value, onChange }: Props) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-mono text-[10.5px] font-medium tracking-[0.12em] text-subtle-foreground uppercase">
        {label}
      </span>
      <select
        className="min-h-[44px] rounded-field border border-border bg-card px-3 text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
