import type { TLetterGradeRange } from "@/types/TLetterGradeRange";

// Strategy Pattern: pluggable scale converters from Scale 10 baseline.
export type TScaleStrategy = {
  id: "scale10" | "scale4" | "scale100" | "letter";
  label: string;
  format: (score10: number, ranges: TLetterGradeRange[]) => string;
};

function pickRange(score10: number, ranges: TLetterGradeRange[]) {
  return ranges.find((r) => score10 >= r.min && score10 < r.max) ?? null;
}

export const SCALE_10: TScaleStrategy = {
  id: "scale10",
  label: "Scale 10",
  format: (s) => s.toFixed(1),
};

export const SCALE_4: TScaleStrategy = {
  id: "scale4",
  label: "Scale 4",
  format: (s, ranges) => {
    const r = pickRange(s, ranges);
    return r ? r.gpa4.toFixed(1) : "0.0";
  },
};

export const SCALE_100: TScaleStrategy = {
  id: "scale100",
  label: "Scale 100",
  format: (s) => String(Math.round(s * 10)),
};

export const LETTER: TScaleStrategy = {
  id: "letter",
  label: "Letter",
  format: (s, ranges) => pickRange(s, ranges)?.letter ?? "—",
};

export const ALL_STRATEGIES = [SCALE_10, SCALE_4, SCALE_100, LETTER];

export function convert(score10: number, ranges: TLetterGradeRange[], id: TScaleStrategy["id"]) {
  return ALL_STRATEGIES.find((s) => s.id === id)!.format(score10, ranges);
}
