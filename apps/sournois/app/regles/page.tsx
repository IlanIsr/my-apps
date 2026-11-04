/** `/regles` — how the game works, and the word lists' credits. */

import { MARK_CLASS } from "@/lib/marks";

function Example({ word, marks }: { word: string; marks: (0 | 1 | 2)[] }) {
  return (
    <div
      className="flex gap-1"
      style={{ "--n": 10 } as React.CSSProperties}
      aria-hidden
    >
      {[...word].map((letter, i) => (
        <div
          key={i}
          className={`tile size-9 text-base ${MARK_CLASS[marks[i]!]}`}
        >
          {letter}
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <article className="flex flex-col gap-5">
      <h1 className="text-3xl">Règles</h1>

      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-lg">Un adversaire sans mot secret</h2>
        <p>
          Au départ, tous les mots courants de la longueur choisie sont
          possibles. À chaque essai, Sournois range ces mots selon les couleurs
          qu&apos;ils donneraient, et garde{" "}
          <strong>le groupe le plus nombreux</strong>. Il ne s&apos;engage donc
          jamais : il faut le coincer jusqu&apos;à ce qu&apos;il ne reste
          qu&apos;un mot, puis proposer ce mot.
        </p>
        <p className="text-sm text-muted">
          À égalité, il choisit le groupe aux couleurs les moins révélatrices :
          le moins de vertes, puis le moins de jaunes. Il ne tire jamais au
          hasard : la même suite d&apos;essais donne toujours les mêmes
          réponses.
        </p>
      </section>

      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-lg">Les couleurs</h2>
        <Example word="PRUNE" marks={[2, 0, 1, 0, 2]} />
        <ul className="flex flex-col gap-1 text-sm">
          <li>
            <strong className="text-hit">Vert</strong> : bonne lettre, bonne
            place (ici P et E).
          </li>
          <li>
            <strong className="text-near">Jaune</strong> : la lettre est dans le
            mot, ailleurs (U).
          </li>
          <li>
            <strong className="text-miss">Gris</strong> : la lettre n&apos;y est
            pas — ou plus : une lettre n&apos;est jamais colorée plus de fois
            qu&apos;elle n&apos;apparaît.
          </li>
        </ul>
        <p className="text-sm text-muted">
          Les accents ne comptent pas (É = E, Ç = C, Œ = OE). Les mots composés
          sont exclus. Les pluriels et formes conjuguées sont acceptés comme
          essais, mais les mots à trouver sont des formes de base (singulier,
          masculin, infinitif).
        </p>
      </section>

      <section className="card flex flex-col gap-2 p-5">
        <h2 className="text-lg">Score et modes</h2>
        <p>
          Le score est le nombre d&apos;essais valides, dernier compris — plus
          il est bas, mieux c&apos;est. Pas de limite d&apos;essais, pas de
          défaite. Un mot inconnu ou refusé ne compte pas.
        </p>
        <ul className="flex list-disc flex-col gap-1 ps-5 text-sm">
          <li>
            <strong>Mode difficile</strong> : chaque essai doit pouvoir être la
            réponse, compte tenu de toutes les couleurs déjà reçues.
          </li>
          <li>
            <strong>Ouverture du jour</strong> : le premier mot est imposé, le
            même pour tous ce jour-là. Comme Sournois ne tire rien au hasard,
            tout le monde part de la même position.
          </li>
        </ul>
        <p className="text-sm text-muted">
          Les scores se comparent par longueur et par mode.
        </p>
      </section>

      <section className="flex flex-col gap-1 text-sm text-muted">
        <h2 className="text-base text-foreground">Crédits</h2>
        <p>
          Listes de mots dérivées de{" "}
          <a href="http://www.lexique.org" className="text-accent underline">
            Lexique 3.83
          </a>{" "}
          (Boris New, Christophe Pallier et al.), sous licence{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr"
            className="text-accent underline"
          >
            CC BY-SA 4.0
          </a>
          . Les listes du jeu (normalisées, triées par longueur) sont diffusées
          sous la même licence :{" "}
          <a href="/dict/LICENCE.txt" className="text-accent underline">
            détails
          </a>
          .
        </p>
      </section>
    </article>
  );
}
