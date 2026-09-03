import type { AgendaTexts } from "@/app/components/anniversary/CalendarAgenda";
import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";
import type { AnniversaryDetailTexts } from "@/app/components/anniversary/AnniversaryDetail";
import type { AnniversaryFormTexts } from "@/app/components/anniversary/AnniversaryForm";
import type { ConnectPromptTexts } from "@/app/components/anniversary/ConnectPrompt";
import type { NewAnniversaryHeaderTexts } from "@/app/components/anniversary/NewAnniversaryHeader";
import type { NavbarTexts } from "@/app/components/Navbar";
import type { ConverterTexts } from "@/app/home/HomePage";
import type { EventSummaryTexts } from "@/lib/event-summary";

/**
 * The message tree, shaped by the components that consume it. Each key's type is
 * exported by the component that owns it; every dictionary must
 * `satisfies Messages`.
 */
export type Messages = {
  navbar: NavbarTexts;
  converter: ConverterTexts;
  anniversaries: AnniversariesTexts;
  anniversaryForm: AnniversaryFormTexts;
  newAnniversaryHeader: NewAnniversaryHeaderTexts;
  anniversaryDetail: AnniversaryDetailTexts;
  connectPrompt: ConnectPromptTexts;
  agenda: AgendaTexts;
  eventSummary: EventSummaryTexts;
};
