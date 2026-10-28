import type { FriendsTexts } from "@/app/components/FriendsTab";
import type { ShareJoinTexts } from "@/app/share/[token]/ShareJoinView";

import { s } from "./plural";

export const friends = {
  myShareTitle: "Mon partage",
  myShareIntro:
    "Partage ton classeur avec des amis : ils verront les cartes que vous avez et celles que vous cherchez — jamais qui a quoi.",
  displayName: "Nom affiché",
  displayNameHint: "Ce que tes amis verront, par exemple « Famille Cohen ».",
  startSharing: "Partager mon classeur",
  rename: "Renommer",
  save: "Enregistrer",
  cancel: "Annuler",
  link: "Lien à envoyer",
  copyLink: "Copier le lien",
  copied: "Copié !",
  renewLink: "Nouveau lien",
  renewHint:
    "Un nouveau lien désactive l'ancien ; ceux qui l'ont déjà ouvert gardent l'accès.",
  stopSharing: "Arrêter de partager",
  stopConfirm:
    "Le lien ne marchera plus et tous tes amis perdront l'accès à ton classeur.",
  viewersTitle: (n: number) => `Ont accès (${n})`,
  noViewers: "Personne pour l'instant — envoie le lien.",
  removeViewer: "Retirer",
  sharedTitle: "Partagés avec moi",
  sharedEmpty:
    "Personne ne t'a encore partagé son classeur. Demande à tes amis le lien de leur onglet « Amis ».",
  summary: (has: number, wants: number) =>
    `${has} carte${s(has)} · en cherche${wants > 1 ? "nt" : ""} ${wants}`,
  match: (theyGive: number, iGive: number) =>
    `Échange possible : ${theyGive} qui te manque${theyGive > 1 ? "nt" : ""} · ${iGive} que tu peux donner`,
  has: (n: number) => `Ont (${n})`,
  wants: (n: number) => `Cherchent (${n})`,
  hasHint: "En surbrillance : celles qui te manquent.",
  wantsHint: "En surbrillance : celles que tu as.",
  nothing: "Rien.",
  search: "Numéro ou page…",
  page: (n: number) => `p. ${n}`,
  copyList: "Copier la liste",
  copyText: (name: string, has: string, wants: string) =>
    `${name}\nOnt : ${has || "—"}\nCherchent : ${wants || "—"}`,
  leave: "Retirer de ma liste",
  leaveConfirm: (name: string) => `Oui, retirer ${name}`,
} as const satisfies FriendsTexts;

export const shareJoin = {
  title: (name: string) => `${name} partage son classeur avec toi`,
  intro:
    "Tu verras les cartes qu'ils ont et celles qu'ils cherchent, pour proposer des échanges.",
  shareBack: (name: string) => `Partager aussi mon classeur avec ${name}`,
  shareBackName: "Mon nom affiché",
  join: "Ajouter à mes amis",
  joined: (name: string) => `${name} est déjà dans tes amis.`,
  own: "C'est ton propre lien de partage.",
  invalid:
    "Ce lien ne marche plus : il a été remplacé ou le partage a été arrêté. Demande un nouveau lien.",
  open: "Ouvrir mon classeur",
} as const satisfies ShareJoinTexts;
