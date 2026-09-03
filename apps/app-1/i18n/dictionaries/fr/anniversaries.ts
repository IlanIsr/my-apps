import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";

export const anniversaries = {
  listPage: {
    title: "Anniversaires hébraïques",
    subtitle:
      "Anniversaires et yahrzeits du calendrier hébraïque, dans votre Google Calendar",
  },
  add: "Ajouter un anniversaire",
  search: "Rechercher…",
  empty: {
    hint: "Ajoutez quelqu’un : ses prochaines années d’événements sont créées dans Google Calendar.",
    noResults: "Aucun résultat.",
  },
  card: {
    nextEvent: "Prochain",
    events: (n: number) => `${n} événement${n === 1 ? "" : "s"}`,
    persons: (n: number) => `${n} personne${n === 1 ? "" : "s"}`,
  },
} as const satisfies AnniversariesTexts;
