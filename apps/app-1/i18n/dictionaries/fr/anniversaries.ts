import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";

export const anniversaries = {
  listPage: {
    title: "Anniversaires hébraïques",
    subtitle: (count: number, admin: boolean) =>
      admin
        ? `${count} personne${count === 1 ? "" : "s"}`
        : `${count} dans ma liste`,
  },
  add: "Ajouter un anniversaire",
  search: "Rechercher par nom ou date hébraïque",
  joined: "Dans ma liste",
  eyebrow: { birthday: "Anniversaire", yahrzeit: "Yahrzeit" },
  empty: {
    title: "Aucun anniversaire pour l’instant",
    body: "Ajoutez un anniversaire ou un yahrzeit : il apparaîtra ici avec sa date hébraïque et les prochaines années.",
    cta: "Ajouter le premier",
    noResults: "Aucun résultat.",
  },
  card: {
    nextEvent: "Prochain",
    events: (n: number) => `${n} événement${n === 1 ? "" : "s"}`,
    members: (n: number) => `${n} membre${n === 1 ? "" : "s"}`,
    age: (n: number) => `${n} ans`,
    since: (n: number) => `${n}ᵉ année`,
  },
} as const satisfies AnniversariesTexts;
