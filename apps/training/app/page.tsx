import { redirect } from "next/navigation";

/** The home page is exam generation. */
export default function Page() {
  redirect("/exams/new");
}
