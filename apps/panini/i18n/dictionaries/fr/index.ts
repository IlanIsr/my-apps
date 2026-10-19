import type { Messages } from "../../messages";
import { app, modal } from "./app";
import { cardLists, pages } from "./card-lists";
import { collection, stats } from "./collection";
import { cardModal, settings } from "./modals";
import { rewardModal, rewards } from "./rewards";
import { setup } from "./setup";

/**
 * The assembled French message tree. Each key comes from that feature's
 * dictionary file and must satisfy the component-owned `XxxTexts` type.
 */
export const fr = {
  app,
  modal,
  setup,
  stats,
  collection,
  cardLists,
  pages,
  rewards,
  cardModal,
  rewardModal,
  settings,
} as const satisfies Messages;
