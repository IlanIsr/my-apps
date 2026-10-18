import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";

/** French UI strings — shape: {@link AnniversariesTexts}. */
export const anniversaries = {
  listPage: {
    title: "Anniversaires hébraïques",
    subtitle: (count: number, admin: boolean) =>
      admin
        ? `${count} personne${count === 1 ? "" : "s"}`
        : `${count} dans ma liste`,
  },
  add: "Ajouter un anniversaire",
  shareList: "Partager ma liste",
  shareModal: {
    title: "Partager ma liste",
    intro:
      "Ajoutez une personne à chaque anniversaire sélectionné. Elle est invitée à l’agenda partagé de chacun.",
    shareWith: "Partager avec",
    placeholder: "quelquun@example.com",
    notify: "Lui envoyer une invitation agenda",
    selectAll: "Tout sélectionner",
    clearAll: "Effacer",
    share: "Partager",
    sharing: "Partage…",
    cancel: "Annuler",
    emailInvalid: "Saisissez une adresse email valide.",
    nothingSelected: "Sélectionnez au moins un anniversaire.",
    rateLimited: "Google Agenda nous a limités en cours de route.",
    result: (added: number, already: number, failed: number) =>
      [
        added > 0 && `Ajouté à ${added}`,
        already > 0 && `${already} déjà partagé${already === 1 ? "" : "s"}`,
        failed > 0 && `${failed} échec${failed === 1 ? "" : "s"}`,
      ]
        .filter(Boolean)
        .join(" · ") || "Rien à faire.",
    error: (message: string) => `Une erreur est survenue : ${message}`,
  },
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
