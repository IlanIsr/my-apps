import { BackLink } from "../../components/BackLink";

export type NewAnniversaryHeaderTexts = {
  title: string;
  subtitle: string;
};

export function NewAnniversaryHeader({ t }: { t: NewAnniversaryHeaderTexts }) {
  return (
    <div className="flex flex-col gap-2">
      <BackLink href="/anniversaries" />
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {t.title}
      </h1>
      <p className="text-sm text-muted-foreground">{t.subtitle}</p>
    </div>
  );
}
