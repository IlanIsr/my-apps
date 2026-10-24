/**
 * Client-safe types + pure helpers for the question bank and exams. No DB, no
 * server-only imports — both the server (`lib/store.ts`) and the client views
 * use this.
 *
 * A **question** is always the same shape: an optional case text (`cas`) and
 * one or more prompts (`prompts`) — a single prompt, a group of sub-questions,
 * or a case followed by its questions are all the same type. The answer is
 * optional and covers the whole question. Corrections are manual: after an
 * exam the user rates each question correct / partial / incorrect.
 */

export const SOURCE_KEYS = [
  "michnaBroura",
  "biourHalaha",
  "kolYaakov",
  "yeriotChelomo",
] as const;

export type SourceKey = (typeof SOURCE_KEYS)[number];

/** One free-text reference per source; `""` = none. */
export type Sources = Record<SourceKey, string>;

export type Question = {
  id: string;
  cas: string | null;
  prompts: string[];
  answer: string | null;
  siman: string;
  seif: string;
  sources: Sources;
  isSpecial: boolean;
  createdAt: string;
  updatedAt: string;
};

/** What the question form sends. */
export type QuestionInput = Pick<
  Question,
  "cas" | "prompts" | "answer" | "siman" | "seif" | "sources" | "isSpecial"
>;

export const RESULT_STATUSES = ["correct", "partial", "incorrect"] as const;

export type ResultStatus = (typeof RESULT_STATUSES)[number];

export type Exam = {
  id: string;
  /** The exam this one was generated from ("redo my mistakes"). */
  sourceExamId: string | null;
  /** Snapshot of the questions at generation time, in exam order. */
  questions: Question[];
  /** Manual correction, by question id. */
  results: Partial<Record<string, ResultStatus>>;
  currentIndex: number;
  status: "active" | "completed";
  startedAt: string;
  completedAt: string | null;
  reviewedAt: string | null;
};

export const LIMITS = {
  text: 5000,
  short: 200,
  prompts: 30,
  examQuestions: 200,
};

export function emptySources(): Sources {
  return {
    michnaBroura: "",
    biourHalaha: "",
    kolYaakov: "",
    yeriotChelomo: "",
  };
}

/** The filled-in sources, in display order. */
export function sourceValues(sources: Sources): string[] {
  return SOURCE_KEYS.map((key) => sources[key]).filter((v) => v.trim() !== "");
}

/** `Siman 12 · Seif 3` style reference, or `""`. */
export function reference(
  question: Pick<Question, "siman" | "seif">,
  t: { siman: string; seif: string },
): string {
  return [
    question.siman && `${t.siman} ${question.siman}`,
    question.seif && `${t.seif} ${question.seif}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

/** Free-text search over everything a question contains. */
export function matchesSearch(question: Question, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  return [
    question.cas ?? "",
    ...question.prompts,
    question.answer ?? "",
    question.siman,
    question.seif,
    ...sourceValues(question.sources),
  ]
    .join("\n")
    .toLocaleLowerCase()
    .includes(q);
}

// ---------------------------------------------------------------------------
// History

function examTime(exam: Exam): number {
  return new Date(
    exam.reviewedAt ?? exam.completedAt ?? exam.startedAt,
  ).getTime();
}

/** Every question id that appeared in some exam. */
export function seenIds(exams: readonly Exam[]): Set<string> {
  return new Set(exams.flatMap((e) => e.questions.map((q) => q.id)));
}

/** The most recent manual result of each question. */
export function latestResults(
  exams: readonly Exam[],
): Map<string, ResultStatus> {
  const latest = new Map<string, ResultStatus>();
  for (const exam of [...exams].sort((a, b) => examTime(a) - examTime(b))) {
    for (const [id, status] of Object.entries(exam.results)) {
      if (status) latest.set(id, status);
    }
  }
  return latest;
}

export type ResultCounts = Record<ResultStatus | "unrated", number>;

export function examCounts(exam: Exam): ResultCounts {
  const counts: ResultCounts = {
    correct: 0,
    partial: 0,
    incorrect: 0,
    unrated: 0,
  };
  for (const q of exam.questions) counts[exam.results[q.id] ?? "unrated"] += 1;
  return counts;
}

/** Questions rated partial or incorrect in this exam. */
export function failedIds(exam: Exam): string[] {
  return exam.questions
    .filter((q) => {
      const r = exam.results[q.id];
      return r === "partial" || r === "incorrect";
    })
    .map((q) => q.id);
}

// ---------------------------------------------------------------------------
// Generation

export type SpecialFilter = "all" | "only" | "without";
export type HistoryFilter = "all" | "unseen" | "incorrect" | "partial";

export type ExamFilters = {
  special: SpecialFilter;
  history: HistoryFilter;
  /** Matches siman, seif or any source. */
  reference: string;
};

export const DEFAULT_FILTERS: ExamFilters = {
  special: "all",
  history: "all",
  reference: "",
};

export function filterQuestions(
  bank: readonly Question[],
  exams: readonly Exam[],
  filters: ExamFilters,
): Question[] {
  const seen = seenIds(exams);
  const latest = latestResults(exams);
  const ref = normalize(filters.reference);

  return bank.filter((q) => {
    if (filters.special === "only" && !q.isSpecial) return false;
    if (filters.special === "without" && q.isSpecial) return false;
    if (
      ref &&
      ![q.siman, q.seif, ...sourceValues(q.sources)].some((v) =>
        normalize(v).includes(ref),
      )
    ) {
      return false;
    }
    switch (filters.history) {
      case "unseen":
        return !seen.has(q.id);
      case "incorrect":
      case "partial":
        return latest.get(q.id) === filters.history;
      case "all":
        return true;
    }
  });
}

/** `count` random items (Fisher–Yates on a copy). */
export function pickRandom<T>(items: readonly T[], count: number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result.slice(0, count);
}

// ---------------------------------------------------------------------------
// Statistics

export type DifficultQuestion = {
  question: Question;
  correct: number;
  partial: number;
  incorrect: number;
};

export type Statistics = {
  questions: number;
  special: number;
  withAnswer: number;
  exams: number;
  completedExams: number;
  seen: number;
  /** % of the bank that appeared in at least one exam. */
  coverage: number;
  /** % of rated questions whose latest result is correct. */
  mastery: number;
  latest: ResultCounts;
  difficult: DifficultQuestion[];
};

function percent(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

export function statistics(
  bank: readonly Question[],
  exams: readonly Exam[],
): Statistics {
  const seen = seenIds(exams);
  const latest = latestResults(exams);
  const latestCounts: ResultCounts = {
    correct: 0,
    partial: 0,
    incorrect: 0,
    unrated: 0,
  };
  for (const q of bank) latestCounts[latest.get(q.id) ?? "unrated"] += 1;

  const history = new Map<string, Record<ResultStatus, number>>();
  for (const exam of exams) {
    for (const [id, status] of Object.entries(exam.results)) {
      if (!status) continue;
      const counts = history.get(id) ?? {
        correct: 0,
        partial: 0,
        incorrect: 0,
      };
      counts[status] += 1;
      history.set(id, counts);
    }
  }

  const difficult = bank
    .flatMap((question) => {
      const c = history.get(question.id);
      return c && (c.incorrect > 0 || c.partial > 0)
        ? [{ question, ...c }]
        : [];
    })
    .sort((a, b) => b.incorrect - a.incorrect || b.partial - a.partial);

  const seenCount = bank.filter((q) => seen.has(q.id)).length;
  const rated =
    latestCounts.correct + latestCounts.partial + latestCounts.incorrect;

  return {
    questions: bank.length,
    special: bank.filter((q) => q.isSpecial).length,
    withAnswer: bank.filter((q) => q.answer).length,
    exams: exams.length,
    completedExams: exams.filter((e) => e.status === "completed").length,
    seen: seenCount,
    coverage: percent(seenCount, bank.length),
    mastery: percent(latestCounts.correct, rated),
    latest: latestCounts,
    difficult,
  };
}
