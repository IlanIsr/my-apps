/**
 * The old scheme stored a JSON blob in each calendar event's description to
 * mark it as ours. Kept only for the one-time migration to Firestore
 * (`scripts/migrate-to-firestore.ts`); not exported from the package.
 */

const TAG_TYPE = "anniversaire";
const TAG_ORIGIN = "hebreu";

export function decodeLegacyDescription(
  description: string | null | undefined,
): { name: string; hebDateLabel: string } | null {
  if (!description) return null;
  try {
    const d = JSON.parse(description) as Record<string, unknown>;
    if (
      d.type === TAG_TYPE &&
      d.origine === TAG_ORIGIN &&
      typeof d.nom === "string" &&
      typeof d.hebrew_date === "string"
    ) {
      return { name: d.nom, hebDateLabel: d.hebrew_date };
    }
  } catch {
    // not JSON / not ours
  }
  return null;
}
