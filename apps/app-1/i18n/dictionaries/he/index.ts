import type { Messages } from "../../messages";
import { admin } from "./admin";
import { agenda } from "./agenda";
import { anniversaries } from "./anniversaries";
import { anniversaryDetail } from "./anniversary-detail";
import { anniversaryForm } from "./anniversary-form";
import { calendarUnavailable } from "./calendar-unavailable";
import { converter } from "./converter";
import { eventSummary } from "./event-summary";
import { footer } from "./footer";
import { landing } from "./landing";
import { navbar } from "./navbar";
import { newAnniversaryHeader } from "./new-anniversary-header";
import { shareLinkView } from "./share-link-view";

/**
 * The assembled Hebrew message tree. Each key comes from that feature's
 * dictionary file and must satisfy the component-owned `XxxTexts` type.
 */
export const he = {
  navbar,
  footer,
  landing,
  converter,
  anniversaries,
  anniversaryForm,
  newAnniversaryHeader,
  anniversaryDetail,
  calendarUnavailable,
  agenda,
  admin,
  eventSummary,
  shareLinkView,
} as const satisfies Messages;
