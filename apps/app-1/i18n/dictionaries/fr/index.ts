import type { Messages } from "../../messages";
import { admin } from "./admin";
import { agenda } from "./agenda";
import { anniversaries } from "./anniversaries";
import { anniversaryDetail } from "./anniversary-detail";
import { anniversaryForm } from "./anniversary-form";
import { calendarUnavailable } from "./calendar-unavailable";
import { contact } from "./contact";
import { profile } from "./profile";
import { converter } from "./converter";
import { eventSummary } from "./event-summary";
import { footer } from "./footer";
import { landing } from "./landing";
import { navbar } from "./navbar";
import { onboarding } from "./onboarding";
import { newAnniversaryHeader } from "./new-anniversary-header";
import { shareLinkView } from "./share-link-view";

/**
 * The assembled French message tree. Each key comes from that feature's
 * dictionary file and must satisfy the component-owned `XxxTexts` type.
 */
export const fr = {
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
  contact,
  profile,
  onboarding,
} as const satisfies Messages;
