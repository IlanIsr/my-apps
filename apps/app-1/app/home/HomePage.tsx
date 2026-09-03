"use client";

import { useState } from "react";

import { Switch } from "../components/Switch";
import { GregorianDateForm } from "./GregorianDateForm";
import { HebrewDateForm } from "./HebrewDateForm";

export function HomePage() {
  const [hebrewInput, setHebrewInput] = useState(true);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">
          Do you know the date in Hebrew or Gregorian?
        </h1>
        <div className="flex items-center gap-3 text-sm">
          <span className={hebrewInput ? "opacity-50" : "font-medium"}>
            Gregorian
          </span>
          <Switch
            checked={hebrewInput}
            onChange={setHebrewInput}
            aria-label="Toggle input calendar"
          />
          <span className={hebrewInput ? "font-medium" : "opacity-50"}>
            Hebrew
          </span>
        </div>
      </div>

      {hebrewInput ? <HebrewDateForm /> : <GregorianDateForm />}
    </div>
  );
}
