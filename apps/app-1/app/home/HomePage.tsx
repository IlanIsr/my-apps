"use client";

import { useState } from "react";

import { useI18n } from "@/i18n/context";
import { Switch } from "../components/Switch";
import { GregorianDateForm } from "./GregorianDateForm";
import { HebrewDateForm } from "./HebrewDateForm";

export function HomePage() {
  const { t } = useI18n();
  const [hebrewInput, setHebrewInput] = useState(true);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">{t.home.question}</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className={hebrewInput ? "opacity-50" : "font-medium"}>
            {t.home.gregorian}
          </span>
          <Switch
            checked={hebrewInput}
            onChange={setHebrewInput}
            aria-label={t.home.toggleCalendar}
          />
          <span className={hebrewInput ? "font-medium" : "opacity-50"}>
            {t.home.hebrew}
          </span>
        </div>
      </div>

      {hebrewInput ? <HebrewDateForm /> : <GregorianDateForm />}
    </div>
  );
}
