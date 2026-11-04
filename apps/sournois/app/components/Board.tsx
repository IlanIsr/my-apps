"use client";

/**
 * The grid: one row per counted guess, then the row being typed. Rows are
 * as wide as the word (`--n`), so 4 to 10 letters all fit a phone.
 */

import { useEffect, useRef } from "react";

import type { Turn } from "@/lib/game";
import { MARK_CLASS, MARK_LABEL } from "@/lib/marks";

function Row({
  length,
  children,
}: {
  length: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 3.25rem))` }}
    >
      {children}
    </div>
  );
}

export function Board({
  length,
  turns,
  input,
  /** Changes on every refusal, to replay the wobble. */
  refusals,
  done,
}: {
  length: number;
  turns: Turn[];
  input: string;
  refusals: number;
  done: boolean;
}) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [turns.length]);

  return (
    <div
      className="flex flex-col items-center gap-1.5"
      style={{ "--n": length } as React.CSSProperties}
    >
      {turns.map((turn, r) => (
        <Row key={r} length={length}>
          {turn.marks.map((mark, i) => (
            <div
              key={i}
              className={`tile reveal ${MARK_CLASS[mark]}`}
              style={
                r === turns.length - 1
                  ? { animationDelay: `${i * 60}ms` }
                  : { animation: "none" }
              }
              aria-label={`${turn.guess[i]} ${MARK_LABEL[mark]}`}
            >
              {turn.guess[i]}
            </div>
          ))}
        </Row>
      ))}
      {!done && (
        <div key={refusals} className={refusals ? "wobble" : ""}>
          <Row length={length}>
            {Array.from({ length }, (_, i) => (
              <div
                key={i}
                className={`tile border-2 bg-surface ${
                  input[i] ? "border-line-strong" : "border-line"
                }`}
              >
                {input[i] ?? ""}
              </div>
            ))}
          </Row>
        </div>
      )}
      <div ref={end} />
    </div>
  );
}
