import { BackLink } from "../../components/BackLink";

export type NewAnniversaryHeaderTexts = {
  title: string;
  subtitle: string;
};

export function NewAnniversaryHeader({ t }: { t: NewAnniversaryHeaderTexts }) {
  return (
    <div>
      <div className="flex gap-4">
        <BackLink href="/anniversaries" />
        <h1 className="text-2xl font-bold">{t.title}</h1>
      </div>
      <p className="mt-1 text-sm opacity-70">{t.subtitle}</p>
    </div>
  );
}
