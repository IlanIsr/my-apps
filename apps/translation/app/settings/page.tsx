import { SettingsView } from "@/app/components/SettingsView";
import { requireOwner } from "@/lib/owner";
import { getSettings } from "@/lib/store";

/** `/settings` — certification + defaults. */
export default async function Page() {
  const ownerId = await requireOwner();
  return <SettingsView initial={await getSettings(ownerId)} />;
}
