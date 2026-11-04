/**
 * Assembles the app-wide {@link Messages} type from every component's own
 * `XxxTexts`. Add a UI string by extending the owning component's type, then
 * adding it to that feature's file in every `dictionaries/<locale>/`.
 */

import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { DocSettingsTexts } from "@/app/components/DocSettingsFields";
import type { DocumentsTexts } from "@/app/components/DocumentsView";
import type { FileDropTexts } from "@/app/components/FileDrop";
import type { FlagTexts } from "@/app/components/FlagList";
import type { GlossaryTexts } from "@/app/components/GlossaryView";
import type { LabelsTexts } from "@/app/components/labels";
import type { NewDocumentTexts } from "@/app/components/NewDocumentView";
import type { PageCardTexts } from "@/app/components/PageCard";
import type { SettingsTexts } from "@/app/components/SettingsView";
import type { WorkbenchTexts } from "@/app/components/WorkbenchView";
import type { ExportTexts } from "@/lib/export-docx";

/** The message tree. Every dictionary must `satisfies Messages`. */
export type Messages = {
  appShell: AppShellTexts;
  errors: ErrorTexts;
  labels: LabelsTexts;
  docSettings: DocSettingsTexts;
  fileDrop: FileDropTexts;
  export: ExportTexts;
  documents: DocumentsTexts;
  newDocument: NewDocumentTexts;
  workbench: WorkbenchTexts;
  pageCard: PageCardTexts;
  flags: FlagTexts;
  glossary: GlossaryTexts;
  settings: SettingsTexts;
};
