"use client";

/**
 * On-screen AZERTY keyboard, each key coloured with the best mark its letter
 * got so far. The physical keyboard works too (see `Game`).
 */

import type { Mark } from "@/lib/game";

import { MARK_CLASS } from "@/lib/marks";
import { Button } from "./Button";

const ROWS = ["AZERTYUIOP", "QSDFGHJKLM", "WXCVBN"];

export function Keyboard({
  marks,
  onLetter,
  onBack,
  onEnter,
  disabled,
}: {
  marks: Map<string, Mark>;
  onLetter: (letter: string) => void;
  onBack: () => void;
  onEnter: () => void;
  disabled: boolean;
}) {
  const key =
    "h-12 min-w-0 flex-1 rounded-md px-0 font-display text-base font-bold";
  return (
    <div className="flex w-full flex-col gap-1.5" aria-label="Clavier">
      {ROWS.map((row, r) => (
        <div key={row} className="flex gap-1">
          {r === 2 && (
            <Button
              variant="ghost"
              className={`${key} flex-[1.6] bg-key text-xs text-foreground`}
              onClick={onEnter}
              disabled={disabled}
            >
              Valider
            </Button>
          )}
          {[...row].map((letter) => {
            const mark = marks.get(letter);
            return (
              <Button
                variant="ghost"
                key={letter}
                className={`${key} ${
                  mark === undefined
                    ? "bg-key text-foreground"
                    : MARK_CLASS[mark]
                }`}
                onClick={() => onLetter(letter)}
                disabled={disabled}
              >
                {letter}
              </Button>
            );
          })}
          {r === 2 && (
            <Button
              variant="ghost"
              className={`${key} flex-[1.6] bg-key text-foreground`}
              aria-label="Effacer"
              onClick={onBack}
              disabled={disabled}
            >
              ⌫
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
