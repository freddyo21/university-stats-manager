import { type LetterGradeRange } from "./types";

// Strategy Pattern: pluggable scale converters from Scale 10 baseline.
export type ScaleStrategy = {
  id: "scale10" | "scale4" | "scale100" | "letter";
  label: string;
  format: (score10: number, ranges: LetterGradeRange[]) => string;
};

function pickRange(score10: number, ranges: LetterGradeRange[]) {
  return ranges.find((r) => score10 >= r.min && score10 < r.max) ?? null;
}

export const SCALE_10: ScaleStrategy = {
  id: "scale10",
  label: "Scale 10",
  format: (s) => s.toFixed(2),
};

export const SCALE_4: ScaleStrategy = {
  id: "scale4",
  label: "Scale 4",
  format: (s, ranges) => {
    const r = pickRange(s, ranges);
    return r ? r.gpa4.toFixed(1) : "0.0";
  },
};

export const SCALE_100: ScaleStrategy = {
  id: "scale100",
  label: "Scale 100",
  format: (s) => String(Math.round(s * 10)),
};

export const LETTER: ScaleStrategy = {
  id: "letter",
  label: "Letter",
  format: (s, ranges) => pickRange(s, ranges)?.letter ?? "—",
};

export const ALL_STRATEGIES = [SCALE_10, SCALE_4, SCALE_100, LETTER];

export function convert(score10: number, ranges: LetterGradeRange[], id: ScaleStrategy["id"]) {
  return ALL_STRATEGIES.find((s) => s.id === id)!.format(score10, ranges);
}
