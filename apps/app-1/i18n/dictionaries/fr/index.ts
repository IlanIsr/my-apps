import type { Messages } from "../../messages";
import { admin } from "./admin";
import { agenda } from "./agenda";
import { anniversaries } from "./anniversaries";
import { anniversaryDetail } from "./anniversary-detail";
import { anniversaryForm } from "./anniversary-form";
import { calendarUnavailable } from "./calendar-unavailable";
import { converter } from "./converter";
import { eventSummary } from "./event-summary";
import { navbar } from "./navbar";
import { newAnniversaryHeader } from "./new-anniversary-header";

/**
 * The assembled French message tree. Each key comes from that feature's
 * dictionary file and must satisfy the component-owned `XxxTexts` type.
 */
export const fr = {
  navbar,
  converter,
  anniversaries,
  anniversaryForm,
  newAnniversaryHeader,
  anniversaryDetail,
  calendarUnavailable,
  agenda,
  admin,
  eventSummary,
} as const satisfies Messages;
