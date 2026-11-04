import type { Messages } from "../../messages";
import {
  appShell,
  docSettings,
  errors,
  exportTexts,
  fileDrop,
  labels,
} from "./common";
import { documents, newDocument } from "./documents";
import { glossary, settings } from "./glossary";
import { flags, pageCard, workbench } from "./workbench";

/** The assembled message tree for this locale. */
export const fr = {
  appShell,
  errors,
  labels,
  docSettings,
  fileDrop,
  export: exportTexts,
  documents,
  newDocument,
  workbench,
  pageCard,
  flags,
  glossary,
  settings,
} as const satisfies Messages;
