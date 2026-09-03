import Link from "next/link";

import { AnniversaryForm } from "../../components/anniversary/AnniversaryForm";
import { NewAnniversaryHeader } from "../../components/anniversary/NewAnniversaryHeader";

export default function NewAnniversaryPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/anniversaries"
        className="text-sm opacity-70 hover:opacity-100"
      >
        ←
      </Link>
      <NewAnniversaryHeader />
      <AnniversaryForm />
    </div>
  );
}
