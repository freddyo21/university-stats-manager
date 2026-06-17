import { type AppState, DEFAULT_LETTER_GRADES, type LetterGradeRange, type PresetId } from "../../types/types";

// Factory Pattern: presets produce institution-specific defaults.
type Preset = {
  id: PresetId;
  label: string;
  description: string;
  apply: (s: AppState) => AppState;
};

const UIT_LETTERS: LetterGradeRange[] = [
  { letter: "A+", min: 9.0, max: 10.0, gpa4: 4.0 },
  { letter: "A", min: 8.0, max: 9.0, gpa4: 3.5 },
  { letter: "B+", min: 7.0, max: 8.0, gpa4: 3.0 },
  { letter: "B", min: 6.0, max: 7.0, gpa4: 2.5 },
  { letter: "C", min: 5.0, max: 6.0, gpa4: 2.0 },
  { letter: "D+", min: 4.0, max: 5.0, gpa4: 1.5 },
  { letter: "D", min: 3.0, max: 4.0, gpa4: 1.0 },
  { letter: "F", min: 0, max: 3.0, gpa4: 0 },
];

const HUST_LETTERS: LetterGradeRange[] = [
  { letter: "A+", min: 9.5, max: 10.0, gpa4: 4.0 },
  { letter: "A", min: 8.5, max: 9.5, gpa4: 4.0 },
  { letter: "B+", min: 8.0, max: 8.5, gpa4: 3.5 },
  { letter: "B", min: 7.0, max: 8.0, gpa4: 3.0 },
  { letter: "C+", min: 6.5, max: 7.0, gpa4: 2.5 },
  { letter: "C", min: 5.5, max: 6.5, gpa4: 2.0 },
  { letter: "D+", min: 5.0, max: 5.5, gpa4: 1.5 },
  { letter: "D", min: 4.0, max: 5.0, gpa4: 1.0 },
  { letter: "F", min: 0, max: 4.0, gpa4: 0 },
];

export const PRESETS: Record<PresetId, Preset> = {
  UIT: {
    id: "UIT",
    label: "UIT (HCMC)",
    description: "Scale 10, passing 5.0. Failing threshold off by default.",
    apply: (s) => ({
      ...s,
      presetId: "UIT",
      letterGrades: UIT_LETTERS,
      subjectPassThreshold: 5.0,
      componentPassEnabled: false,
      componentPassThreshold: 3.0,
      scholarshipGPA: 8.0,
    }),
  },
  HUST: {
    id: "HUST",
    label: "HUST (Hanoi)",
    description: "Scale 10, passing 4.0. Failing threshold at 3.0.",
    apply: (s) => ({
      ...s,
      presetId: "HUST",
      letterGrades: HUST_LETTERS,
      subjectPassThreshold: 4.0,
      componentPassEnabled: true,
      componentPassThreshold: 3.0,
      scholarshipGPA: 3.2,
    }),
  },
  Custom: {
    id: "Custom",
    label: "Custom",
    description: "Free-form configuration.",
    apply: (s) => ({ ...s, presetId: "Custom" }),
  },
};

export function listPresets() {
  return Object.values(PRESETS);
}

export function applyPreset(state: AppState, id: PresetId): AppState {
  console.log(PRESETS[id]);
  return PRESETS[id].apply(state);
}

export const STANDARD_REFERENCE = UIT_LETTERS.map((r) => ({
  range: `${r.min.toFixed(1)} – ${r.max >= 10 ? "10.0" : r.max.toFixed(1)}`,
  letter: r.letter,
  gpa4: r.gpa4,
}));

export { DEFAULT_LETTER_GRADES };
