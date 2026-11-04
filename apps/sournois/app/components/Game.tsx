"use client";

/**
 * The game page: settings (length, hard mode, daily opening), then the board
 * and keyboard. The game in progress is saved after every guess and resumed
 * on the next visit; a win is recorded in the scores.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import {
  dailyOpening,
  DICT_VERSION,
  isWin,
  LENGTHS,
  letterMarks,
  normalize,
  refusal,
  replay,
  respond,
  type Dictionary,
  type Refusal,
  type Turn,
} from "@/lib/game";
import {
  loadGame,
  loadSettings,
  recordWin,
  saveGame,
  saveSettings,
  today,
  type SavedGame,
  type ScoreLine,
  type Settings,
} from "@/lib/storage";

import { Board } from "./Board";
import { Button } from "./Button";
import { Keyboard } from "./Keyboard";
import { Switch } from "./Switch";

const dictionaries = new Map<number, Promise<Dictionary>>();

/** The word lists of one length, fetched once. */
function loadDictionary(length: number): Promise<Dictionary> {
  if (!dictionaries.has(length)) {
    dictionaries.set(
      length,
      fetch(`/dict/${DICT_VERSION}/${length}.json`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<{ answers: string[]; extra: string[] }>;
        })
        .then(({ answers, extra }) => ({
          length,
          answers,
          accepted: new Set([...answers, ...extra]),
        }))
        .catch((error: unknown) => {
          dictionaries.delete(length);
          throw error;
        }),
    );
  }
  return dictionaries.get(length)!;
}

const ordinal = (i: number) => (i === 0 ? "1re" : `${i + 1}e`);

function refusalText(r: Refusal, guess: string, length: number): string {
  switch (r.reason) {
    case "length":
      return `Il faut ${length} lettres.`;
    case "unknown":
      return `« ${guess} » n'est pas dans le dictionnaire.`;
    case "opening":
      return `Ouverture du jour : commencez par ${r.word}.`;
    case "hard": {
      const { turn, position, kind } = r.detail;
      const letter = turn.guess[position];
      if (kind === "green")
        return `Mode difficile : la ${ordinal(position)} lettre doit être ${letter}.`;
      if (kind === "yellow")
        return `Mode difficile : ${letter} n'est pas en ${ordinal(position)} position.`;
      return `Mode difficile : incompatible avec ${turn.guess}.`;
    }
  }
}

type Playing = {
  game: SavedGame;
  dict: Dictionary;
  turns: Turn[];
  candidates: string[];
  opening: string | null;
  /** Set once won. */
  result: ScoreLine | null;
};

const DEFAULT: Settings = { length: 5, hard: false, daily: false };

export function Game() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [refusals, setRefusals] = useState(0);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [copied, setCopied] = useState(false);

  const start = useCallback(async (game: SavedGame) => {
    setLoading(true);
    setError(null);
    try {
      const dict = await loadDictionary(game.length);
      const { turns, candidates } = replay(dict, game.guesses);
      const won = turns.length > 0 && isWin(turns.at(-1)!.marks);
      const opening = game.day ? dailyOpening(dict.answers, game.day) : null;
      setPlaying({ game, dict, turns, candidates, opening, result: null });
      setInput(won || turns.length > 0 ? "" : (opening ?? ""));
      setMessage(null);
      if (won) saveGame(null);
      else saveGame(game);
    } catch {
      setError("Impossible de charger le dictionnaire. Vérifiez la connexion.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Resume the saved game, else show the settings.
  useEffect(() => {
    const saved = loadGame();
    const stored = loadSettings();
    Promise.resolve().then(() => {
      if (stored) setSettings(stored);
      if (saved) void start(saved);
      else setLoading(false);
    });
  }, [start]);

  function newGame() {
    saveSettings(settings);
    void start({
      ...settings,
      version: DICT_VERSION,
      day: settings.daily ? today() : null,
      guesses: [],
    });
  }

  function quit() {
    saveGame(null);
    setPlaying(null);
    setConfirmQuit(false);
    setInput("");
    setMessage(null);
  }

  const done = !!playing?.result;
  const length = playing?.game.length ?? settings.length;

  const submit = useCallback(() => {
    if (!playing || playing.result) return;
    const guess = normalize(input);
    const refused = refusal(guess, playing.dict, playing.turns, {
      hard: playing.game.hard,
      opening: playing.opening,
    });
    if (refused) {
      setMessage(refusalText(refused, guess, playing.dict.length));
      setRefusals((n) => n + 1);
      return;
    }
    const answer = respond(playing.candidates, guess);
    const game = { ...playing.game, guesses: [...playing.game.guesses, guess] };
    const turns = [...playing.turns, { guess, marks: answer.marks }];
    const won = isWin(answer.marks);
    saveGame(won ? null : game);
    setPlaying({
      ...playing,
      game,
      turns,
      candidates: answer.candidates,
      result: won ? recordWin(game) : null,
    });
    setInput("");
    setMessage(null);
  }, [input, playing]);

  const type = useCallback(
    (letter: string) => setInput((s) => (s.length < length ? s + letter : s)),
    [length],
  );
  const back = useCallback(() => setInput((s) => s.slice(0, -1)), []);

  // The physical keyboard (accented letters are normalized: é → E).
  useEffect(() => {
    if (!playing || done) return;
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") return submit();
      if (e.key === "Backspace") return back();
      const letter = normalize(e.key);
      if (/^[A-Z]{1,2}$/.test(letter) && e.key.length === 1) {
        for (const l of letter) type(l);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, done, submit, back, type]);

  const marks = useMemo(() => letterMarks(playing?.turns ?? []), [playing]);

  async function share() {
    if (!playing) return;
    const { game, turns } = playing;
    const squares = turns
      .map((t) => t.marks.map((m) => ["⬛", "🟨", "🟩"][m]).join(""))
      .join("\n");
    const title = [
      "Sournois",
      `${game.length} lettres`,
      game.hard && "difficile",
      game.day && `ouverture du ${game.day}`,
      `${turns.length} coups`,
    ]
      .filter(Boolean)
      .join(" · ");
    try {
      await navigator.clipboard.writeText(`${title}\n${squares}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Copie impossible dans ce navigateur.");
    }
  }

  if (loading) return <p className="text-muted">Chargement…</p>;

  if (!playing) {
    return (
      <div className="flex flex-col gap-5">
        <header>
          <h1 className="text-3xl">Sournois</h1>
          <p className="mt-1 text-muted">
            Il n&apos;y a pas de mot secret : à chaque essai, l&apos;adversaire
            garde le plus de mots possibles. Coincez-le en un minimum de coups.{" "}
            <Link href="/regles" className="text-accent">
              Règles
            </Link>
          </p>
        </header>
        <section className="card flex flex-col gap-5 p-5">
          <div>
            <div className="eyebrow mb-2">Longueur des mots</div>
            <div className="flex flex-wrap gap-2">
              {LENGTHS.map((n) => (
                <Button
                  key={n}
                  variant={settings.length === n ? "primary" : "outline"}
                  className="size-11 min-w-0 font-display text-base font-bold"
                  onClick={() => setSettings({ ...settings, length: n })}
                  aria-pressed={settings.length === n}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Switch
              checked={settings.hard}
              onChange={(hard) => setSettings({ ...settings, hard })}
            >
              <span>
                Mode difficile
                <span className="block text-xs font-normal text-muted">
                  Chaque essai doit respecter toutes les couleurs déjà reçues.
                </span>
              </span>
            </Switch>
            <Switch
              checked={settings.daily}
              onChange={(daily) => setSettings({ ...settings, daily })}
            >
              <span>
                Ouverture du jour
                <span className="block text-xs font-normal text-muted">
                  Le premier mot est imposé, le même pour tout le monde
                  aujourd&apos;hui : les scores se comparent.
                </span>
              </span>
            </Switch>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button variant="primary" onClick={newGame} className="self-start">
            Commencer
          </Button>
        </section>
      </div>
    );
  }

  const { game, turns, candidates, result } = playing;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted">
          <span className="font-semibold text-foreground">
            {game.length} lettres
          </span>
          {game.hard && " · difficile"}
          {game.day && " · ouverture du jour"}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => (turns.length ? setConfirmQuit(true) : quit())}
        >
          Nouvelle partie
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="card px-4 py-2.5">
          <div className="eyebrow">Coups</div>
          <div className="num font-display text-2xl font-bold">
            {turns.length}
          </div>
        </div>
        <div className="card px-4 py-2.5">
          <div className="eyebrow">Mots encore possibles</div>
          <div className="num font-display text-2xl font-bold">
            {candidates.length.toLocaleString("fr-FR")}
          </div>
        </div>
      </div>

      <Board
        length={game.length}
        turns={turns}
        input={input}
        refusals={refusals}
        done={done}
      />

      <p
        role="status"
        className={`min-h-6 text-center text-sm ${message ? "text-danger" : "text-muted"}`}
      >
        {message ??
          (!done && playing.opening && turns.length === 0
            ? `Ouverture du jour : ${playing.opening}`
            : !done && candidates.length === 1
              ? "Il est coincé : plus qu'un mot possible."
              : "")}
      </p>

      {result ? (
        <section className="card flex flex-col gap-3 p-5 text-center">
          <h2 className="text-2xl">
            Coincé en {turns.length} coup{turns.length > 1 ? "s" : ""} !
          </h2>
          <p className="text-sm text-muted">
            Record pour ce mode : {result.best} · moyenne{" "}
            {(result.total / result.played).toLocaleString("fr-FR", {
              maximumFractionDigits: 1,
            })}{" "}
            sur {result.played} partie{result.played > 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={quit}>
              Nouvelle partie
            </Button>
            <Button onClick={share}>{copied ? "Copié ✓" : "Partager"}</Button>
          </div>
        </section>
      ) : (
        <Keyboard
          marks={marks}
          onLetter={type}
          onBack={back}
          onEnter={submit}
          disabled={false}
        />
      )}

      <SimpleModal
        isOpen={confirmQuit}
        onClose={() => setConfirmQuit(false)}
        title="Abandonner cette partie ?"
        description="Elle ne comptera pas dans les scores."
        footer={
          <>
            <Button onClick={() => setConfirmQuit(false)}>Continuer</Button>
            <Button variant="danger" onClick={quit}>
              Abandonner
            </Button>
          </>
        }
      />
    </div>
  );
}
