/**
 * Assembles the app-wide {@link Messages} type from every component's own
 * `XxxTexts`. Add a UI string by extending the owning component's type, then
 * adding it to that feature's file in every `dictionaries/<locale>/`.
 */

import type { CardListsTexts } from "@/app/components/CardLists";
import type { CardModalTexts } from "@/app/components/CardModal";
import type { CollectionTexts } from "@/app/components/CollectionTab";
import type { ModalTexts } from "@/app/components/Modal";
import type { PagesTexts } from "@/app/components/PagesTab";
import type { AppTexts } from "@/app/components/PaniniApp";
import type { RewardModalTexts } from "@/app/components/RewardModal";
import type { RewardsTexts } from "@/app/components/RewardsTab";
import type { SettingsTexts } from "@/app/components/SettingsModal";
import type { SetupTexts } from "@/app/components/SetupView";
import type { StatsTexts } from "@/app/components/StatsStrip";

/**
 * The message tree, shaped by the components that consume it. Every
 * dictionary must `satisfies Messages`.
 */
export type Messages = {
  app: AppTexts;
  modal: ModalTexts;
  setup: SetupTexts;
  stats: StatsTexts;
  collection: CollectionTexts;
  cardLists: CardListsTexts;
  pages: PagesTexts;
  rewards: RewardsTexts;
  cardModal: CardModalTexts;
  rewardModal: RewardModalTexts;
  settings: SettingsTexts;
};
