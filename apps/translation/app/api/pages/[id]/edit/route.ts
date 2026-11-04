/**
 * POST — Claude applies one reviewer edit to the translation and returns the
 * new text (not stored: the client saves it with the flag's resolution).
 */

import { editPage } from "@/lib/ai-steps";
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
      editPage({ ownerId, pageId: v.id(id), edit: v.editRequest(body) }),
    ),
  );
}
