export type NewAnniversaryHeaderTexts = {
  title: string;
  subtitle: string;
};

export function NewAnniversaryHeader({ t }: { t: NewAnniversaryHeaderTexts }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <p className="mt-1 text-sm opacity-70">{t.subtitle}</p>
    </div>
  );
}
