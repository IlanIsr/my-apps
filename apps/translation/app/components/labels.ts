/** Names of the fixed values (languages, document types, statuses…). */

import type { PageStatus } from "@/lib/checks";
import type {
  BlockType,
  Doctype,
  PageOrigin,
  Quality,
  TargetLang,
} from "@/lib/model";

export type LabelsTexts = {
  target: Record<TargetLang, string>;
  doctype: Record<Doctype, string>;
  quality: Record<Quality, string>;
  origin: Record<PageOrigin, string>;
  status: Record<PageStatus, string>;
  block: Record<BlockType, string>;
};
