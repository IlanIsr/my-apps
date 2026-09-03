import type { Messages } from "../../messages";
import { agenda } from "./agenda";
import { anniversaries } from "./anniversaries";
import { anniversaryDetail } from "./anniversary-detail";
import { anniversaryForm } from "./anniversary-form";
import { connectPrompt } from "./connect-prompt";
import { converter } from "./converter";
import { eventSummary } from "./event-summary";
import { navbar } from "./navbar";
import { newAnniversaryHeader } from "./new-anniversary-header";

export const fr = {
  navbar,
  converter,
  anniversaries,
  anniversaryForm,
  newAnniversaryHeader,
  anniversaryDetail,
  connectPrompt,
  agenda,
  eventSummary,
} as const satisfies Messages;
