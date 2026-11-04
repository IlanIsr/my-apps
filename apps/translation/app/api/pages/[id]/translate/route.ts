/** POST — translate one page from its stored transcription. Body: `{ noteLang }`. */

import { translatePage } from "@/lib/ai-steps";
import { run } from "@/lib/result";
import { json, readJson } from "@/lib/route";
import * as v from "@/lib/validate";

export const maxDuration = 300;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await readJson(request);
  return json(
    await run((ownerId) =>
      translatePage({
        ownerId,
        pageId: v.id(id),
        noteLang: v.noteLang((body as { noteLang?: unknown } | null)?.noteLang),
      }),
    ),
  );
}
