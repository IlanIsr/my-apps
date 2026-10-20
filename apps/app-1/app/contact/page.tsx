"use client";

/**
 * `/contact` — send the app owner a comment, bug report or suggestion
 * ({@link ContactForm}). Signed-in only, like every gated route.
 */

import { useTranslations } from "@/i18n";
import { ContactForm } from "./ContactForm";

export default function ContactPage() {
  return <ContactForm t={useTranslations().contact} />;
}
