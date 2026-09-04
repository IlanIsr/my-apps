"use client";

import { useState } from "react";

import { Segmented } from "../components/Segmented";
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

export function HomePage({ t }: { t: ConverterTexts }) {
  const [hebrewInput, setHebrewInput] = useState(true);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t.question}
        </h1>
        <Segmented
          aria-label={t.toggleCalendar}
          value={hebrewInput ? "hebrew" : "gregorian"}
          onChange={(v) => setHebrewInput(v === "hebrew")}
          options={[
            { value: "gregorian", label: t.gregorian },
            { value: "hebrew", label: t.hebrew },
          ]}
        />
      </div>

      {hebrewInput ? (
        <HebrewDateForm t={t.hebrewForm} />
      ) : (
        <GregorianDateForm t={t.gregorianForm} />
      )}
    </div>
  );
}
