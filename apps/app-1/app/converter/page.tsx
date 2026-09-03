"use client";

import { useTranslations } from "@/i18n";
import { HomePage } from "../home/HomePage";

export default function ConverterPage() {
  const messages = useTranslations();
  return <HomePage t={messages.converter} />;
}
