"use client";

/**
 * Scores kept in this browser: one table per mode (rows = word lengths), then
 * the daily openings already played.
 */

import { useEffect, useState } from "react";

import { LENGTHS } from "@/lib/game";
import { loadDaily, loadScores, modeKey, type ScoreLine } from "@/lib/storage";

const MODES = [
  { hard: false, daily: false, label: "Partie libre" },
  { hard: true, daily: false, label: "Partie libre · difficile" },
  { hard: false, daily: true, label: "Ouverture du jour" },
  { hard: true, daily: true, label: "Ouverture du jour · difficile" },
];

const average = (line: ScoreLine) =>
  (line.total / line.played).toLocaleString("fr-FR", {
    maximumFractionDigits: 1,
  });

export function ScoresView() {
  const [scores, setScores] = useState<Record<string, ScoreLine> | null>(null);
  const [daily, setDaily] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.resolve().then(() => {
      setScores(loadScores());
      setDaily(loadDaily());
    });
  }, []);

  if (!scores) return <p className="text-muted">Chargement…</p>;

  const days = Object.entries(daily)
    .map(([key, n]) => {
      const [day, length, mode] = key.split("|");
      return { day: day!, length: length!, hard: mode === "difficile", n };
    })
    .sort((a, b) => b.day.localeCompare(a.day) || +a.length - +b.length)
    .slice(0, 30);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl">Scores</h1>
        <p className="mt-1 text-sm text-muted">
          Nombre de coups pour coincer l&apos;adversaire — plus c&apos;est bas,
          mieux c&apos;est. Gardés dans ce navigateur.
        </p>
      </header>

      {MODES.map((mode) => {
        const rows = LENGTHS.map((length) => ({
          length,
          line: scores[modeKey({ length, ...mode })],
        })).filter((r) => r.line);
        if (rows.length === 0) return null;
        return (
          <section key={mode.label} className="card overflow-hidden">
            <h2 className="border-b border-line px-4 py-2.5 text-base">
              {mode.label}
            </h2>
            <table className="num w-full text-sm">
              <thead className="text-start text-xs text-muted">
                <tr>
                  <th className="px-4 py-2 text-start font-medium">Lettres</th>
                  <th className="px-4 py-2 text-end font-medium">Record</th>
                  <th className="px-4 py-2 text-end font-medium">Moyenne</th>
                  <th className="px-4 py-2 text-end font-medium">Parties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ length, line }) => (
                  <tr key={length}>
                    <td className="px-4 py-2 font-semibold">{length}</td>
                    <td className="px-4 py-2 text-end">{line!.best}</td>
                    <td className="px-4 py-2 text-end">{average(line!)}</td>
                    <td className="px-4 py-2 text-end">{line!.played}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}

      {days.length > 0 && (
        <section className="card overflow-hidden">
          <h2 className="border-b border-line px-4 py-2.5 text-base">
            Ouvertures du jour jouées
          </h2>
          <ul className="divide-y divide-line text-sm">
            {days.map((d) => (
              <li
                key={`${d.day}-${d.length}-${d.hard}`}
                className="flex justify-between gap-3 px-4 py-2"
              >
                <span>
                  {new Date(`${d.day}T12:00:00`).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  <span className="text-muted">
                    · {d.length} lettres{d.hard && " · difficile"}
                  </span>
                </span>
                <span className="num font-semibold">{d.n} coups</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {Object.keys(scores).length === 0 && (
        <p className="text-muted">Pas encore de partie gagnée.</p>
      )}
    </div>
  );
}
