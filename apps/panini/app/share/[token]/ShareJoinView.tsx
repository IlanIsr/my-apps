"use client";

/** Client side of the share-link page (its own i18n boundary). */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { joinShareAction } from "@/app/actions";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { onFormSubmit } from "@/app/components/Modal";
import { TextInput } from "@/app/components/TextInput";
import { useTranslations } from "@/i18n";
import type { SharePreview } from "@/lib/album-logic";

export type ShareJoinTexts = {
  title: (name: string) => string;
  intro: string;
  shareBack: (name: string) => string;
  shareBackName: string;
  join: string;
  joined: (name: string) => string;
  own: string;
  invalid: string;
  open: string;
};

export function ShareJoinView({
  token,
  preview,
}: {
  token: string;
  preview: SharePreview | null;
}) {
  const all = useTranslations();
  const t = all.shareJoin;
  const router = useRouter();
  const canShareBack = Boolean(preview?.viewerHasAlbum && !preview.sharedBack);
  const [shareBack, setShareBack] = useState(canShareBack);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const done = !preview || preview.isOwn || (preview.joined && !canShareBack);
  const message = !preview
    ? t.invalid
    : preview.isOwn
      ? t.own
      : t.joined(preview.displayName);

  return (
    <div className="mx-auto max-w-md px-4 pt-10 pb-16">
      <div className="card p-5">
        {done ? (
          <>
            <p className="mb-4 text-sm">{message}</p>
            <Link href="/?tab=friends" className="font-semibold text-accent">
              {t.open}
            </Link>
          </>
        ) : (
          <form
            onSubmit={onFormSubmit(async (form) => {
              setPending(true);
              const result = await joinShareAction(
                token,
                shareBack
                  ? {
                      name: String(
                        form.get("backName") ?? preview.viewerShareName ?? "",
                      ),
                    }
                  : null,
              );
              setPending(false);
              if (!result.ok) {
                setError(all.app.errors[result.error]);
                return;
              }
              router.push("/?tab=friends");
            })}
          >
            <h1 className="mb-2 text-[22px]">{t.title(preview.displayName)}</h1>
            <p className="mb-4 text-sm text-muted">{t.intro}</p>
            {canShareBack && (
              <div className="mb-4 flex flex-col gap-2">
                <Checkbox
                  checked={shareBack}
                  onChange={setShareBack}
                  className="flex items-center gap-2 text-sm"
                >
                  {t.shareBack(preview.displayName)}
                </Checkbox>
                {shareBack && !preview.viewerShareName && (
                  <>
                    <label
                      htmlFor="back-name"
                      className="text-[12.5px] font-semibold text-muted"
                    >
                      {t.shareBackName}
                    </label>
                    <TextInput id="back-name" name="backName" required />
                  </>
                )}
              </div>
            )}
            {error && <p className="mb-3 text-sm text-danger">{error}</p>}
            <Button type="submit" variant="primary" disabled={pending}>
              {t.join}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
