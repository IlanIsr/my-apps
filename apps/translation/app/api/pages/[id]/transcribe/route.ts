/**
 * POST — transcribe one page. Body: multipart form with the page image(s)
 * (`image`, 1 or 3 JPEG/PNG: whole page, then upper / lower halves),
 * `noteLang`. The images are only forwarded to Claude, never stored.
 */

import { transcribePage } from "@/lib/ai-steps";
import type { ImageInput } from "@/lib/claude";
import { LIMITS } from "@/lib/model";
import { run } from "@/lib/result";
import { json } from "@/lib/route";
import * as v from "@/lib/validate";

export const maxDuration = 300;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return json(
    await run(async (ownerId) => {
      let form: FormData;
      try {
        form = await request.formData();
      } catch {
        throw new v.InvalidInputError("form");
      }
      const files = form.getAll("image").filter((f) => f instanceof File);
      if (files.length !== 1 && files.length !== 3) {
        throw new v.InvalidInputError("images");
      }
      const total = files.reduce((sum, f) => sum + f.size, 0);
      if (total > LIMITS.uploadBytes) throw new v.InvalidInputError("images");
      const images: ImageInput[] = await Promise.all(
        files.map(async (f) => {
          if (f.type !== "image/jpeg" && f.type !== "image/png") {
            throw new v.InvalidInputError("imageType");
          }
          return {
            data: Buffer.from(await f.arrayBuffer()),
            mediaType: f.type,
          };
        }),
      );
      return transcribePage({
        ownerId,
        pageId: v.id(id),
        images,
        bands: files.length === 3,
        noteLang: v.noteLang(form.get("noteLang")),
      });
    }),
  );
}
