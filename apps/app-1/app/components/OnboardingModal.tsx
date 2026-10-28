"use client";

/**
 * Shown once, on a signed-in user's first visit (`users.onboarding_shown`,
 * read by the root layout): a quick tour of the profile settings. Closing it
 * either way records it as seen ({@link onboardingShownAction}). Sits at the
 * root of its own client tree, so it reads its texts itself.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import { useTranslations } from "@/i18n";
import { onboardingShownAction } from "../profile/actions";
import { Button } from "./Button";

/** Text for {@link OnboardingModal}. */
export type OnboardingTexts = {
  title: string;
  intro: string;
  /** One line per profile setting: name + what it does. */
  items: readonly { title: string; text: string }[];
  openProfile: string;
  later: string;
};

export function OnboardingModal() {
  const t = useTranslations().onboarding;
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const close = () => {
    setOpen(false);
    void onboardingShownAction();
  };

  return (
    <SimpleModal
      isOpen={open}
      onClose={close}
      title={<span className="font-display text-xl">{t.title}</span>}
      description={t.intro}
      footer={
        <>
          <Button onClick={close} variant="outline">
            {t.later}
          </Button>
          <Button
            onClick={() => {
              close();
              router.push("/profile");
            }}
          >
            {t.openProfile}
          </Button>
        </>
      }
    >
      <ul className="flex flex-col gap-3 text-sm">
        {t.items.map((item) => (
          <li key={item.title}>
            <span className="font-medium">{item.title}</span>
            <span className="text-muted-foreground"> — {item.text}</span>
          </li>
        ))}
      </ul>
    </SimpleModal>
  );
}
