import { redirect } from "next/navigation";

/** The home page is the receipt list. */
export default function Page() {
  redirect("/receipts");
}
