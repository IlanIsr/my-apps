import { Ornament } from "../Ornament";

export type CalendarUnavailableTexts = {
  title: string;
  message: string;
};

export function CalendarUnavailable({ t }: { t: CalendarUnavailableTexts }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-card px-6 py-11 text-center">
      <Ornament className="mb-1" />
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {t.title}
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        {t.message}
      </p>
      <span className="mt-1 font-mono text-[11.5px] text-subtle-foreground">
        CAL_NOT_CONFIGURED
      </span>
    </div>
  );
}
