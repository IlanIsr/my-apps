export type Option = { key: string; label: string };

type Props = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr" | "rtl";
};

export function Select({ label, options, value, onChange, dir = "ltr" }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm" dir={dir}>
      <span className="font-medium">{label}</span>
      <select
        className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground outline-none focus:border-foreground/50"
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
