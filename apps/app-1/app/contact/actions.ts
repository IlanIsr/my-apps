"use server";

/**
 * `/contact` — emails the app owner a comment / bug report / suggestion from
 * the signed-in user, via Resend's REST API (no SDK). The sender is always the
 * signed-in account (used as `reply_to`), never a typed address. Needs
 * `RESEND_API_KEY`; the recipient is `CONTACT_TO_EMAIL` (default
 * {@link CONTACT_EMAIL}). Sent from `contact@anniversaries.dev` (the domain is
 * verified in the Resend account owned by anniversaries.calendar@gmail.com);
 * `CONTACT_FROM` overrides it.
 */

import { getCurrentUserEmail } from "@repo/auth/user";

import {
  CONTACT_EMAIL,
  CONTACT_KINDS,
  MESSAGE_MAX,
  type ContactKind,
} from "@/lib/contact";

export type ContactResult =
  | { ok: true }
  | {
      ok: false;
      error: "not-signed-in" | "invalid" | "not-configured" | "failed";
    };

export async function sendContactAction(input: {
  kind: ContactKind;
  message: string;
}): Promise<ContactResult> {
  const email = await getCurrentUserEmail();
  if (!email) return { ok: false, error: "not-signed-in" };

  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (
    !CONTACT_KINDS.includes(input.kind) ||
    !message ||
    message.length > MESSAGE_MAX
  ) {
    return { ok: false, error: "invalid" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set");
    return { ok: false, error: "not-configured" };
  }

  const firstLine = message.split("\n")[0]!.slice(0, 60);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.CONTACT_FROM ?? "Anniversaries <contact@anniversaries.dev>",
      to: [process.env.CONTACT_TO_EMAIL ?? CONTACT_EMAIL],
      reply_to: email,
      subject: `[Anniversaries · ${input.kind}] ${firstLine}`,
      text: `From: ${email}\nType: ${input.kind}\n\n${message}`,
    }),
  });
  if (!response.ok) {
    console.error(
      `[contact] Resend failed: HTTP ${response.status} ${await response.text()}`,
    );
    return { ok: false, error: "failed" };
  }
  return { ok: true };
}
