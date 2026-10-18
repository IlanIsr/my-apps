"use client";

/**
 * `/converter` route — the Hebrew Date Converter. Client-only; just feeds the
 * message dictionary to {@link HomePage}, which does all the work.
 */

import { useTranslations } from "@/i18n";
import { HomePage } from "../home/HomePage";

export default function ConverterPage() {
  const messages = useTranslations();
  return <HomePage t={messages.converter} />;
}
