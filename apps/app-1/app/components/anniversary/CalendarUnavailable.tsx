export type CalendarUnavailableTexts = {
  title: string;
  message: string;
};

export function CalendarUnavailable({ t }: { t: CalendarUnavailableTexts }) {
  return (
    <div className="flex max-w-md flex-col items-start gap-3 py-8">
      <h1 className="text-xl font-bold">{t.title}</h1>
      <p className="text-sm opacity-70">{t.message}</p>
    </div>
  );
}
