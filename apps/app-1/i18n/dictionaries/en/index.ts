import type { Messages } from "../../messages";
import { admin } from "./admin";
import { agenda } from "./agenda";
import { anniversaries } from "./anniversaries";
import { anniversaryDetail } from "./anniversary-detail";
import { anniversaryForm } from "./anniversary-form";
import { calendarUnavailable } from "./calendar-unavailable";
import { converter } from "./converter";
import { eventSummary } from "./event-summary";
import { landing } from "./landing";
import { navbar } from "./navbar";
import { newAnniversaryHeader } from "./new-anniversary-header";

export const en = {
  navbar,
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
} as const satisfies Messages;
