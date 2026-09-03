import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";

export const anniversaries = {
  listPage: {
    title: "Anniversaires hébraïques",
    subtitle:
      "Anniversaires et yahrzeits du calendrier hébraïque, partagés en famille",
  },
  add: "Ajouter un anniversaire",
  search: "Rechercher…",
  joined: "dans ma liste",
  empty: {
    hint: "Ajoutez quelqu’un — le calendrier familial reçoit les événements des prochaines années et vous y êtes invité.",
    noResults: "Aucun résultat.",
  },
  card: {
    nextEvent: "Prochain",
    events: (n: number) => `${n} événement${n === 1 ? "" : "s"}`,
    members: (n: number) => `${n} personne${n === 1 ? "" : "s"}`,
  },
} as const satisfies AnniversariesTexts;
