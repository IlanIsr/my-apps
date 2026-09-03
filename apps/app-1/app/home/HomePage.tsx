"use client";

import { useState } from "react";

import { useTranslations } from "@/i18n";
import { Switch } from "../components/Switch";
import {
  GregorianDateForm,
  type GregorianDateFormTexts,
} from "./GregorianDateForm";
import { HebrewDateForm, type HebrewDateFormTexts } from "./HebrewDateForm";

export type ConverterTexts = {
  question: string;
  gregorian: string;
  hebrew: string;
  toggleCalendar: string;
  hebrewForm: HebrewDateFormTexts;
  gregorianForm: GregorianDateFormTexts;
};

export function HomePage() {
  const t = useTranslations().converter;
  const [hebrewInput, setHebrewInput] = useState(true);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">{t.question}</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className={hebrewInput ? "opacity-50" : "font-medium"}>
            {t.gregorian}
          </span>
          <Switch
            checked={hebrewInput}
            onChange={setHebrewInput}
            aria-label={t.toggleCalendar}
          />
          <span className={hebrewInput ? "font-medium" : "opacity-50"}>
            {t.hebrew}
          </span>
        </div>
      </div>

      {hebrewInput ? (
        <HebrewDateForm t={t.hebrewForm} />
      ) : (
        <GregorianDateForm t={t.gregorianForm} />
      )}
    </div>
  );
}
