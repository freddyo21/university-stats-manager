export type ScoreKey = "process" | "midterm" | "practice" | "final";

export type Component = {
  process: number | null;
  midterm: number | null;
  practice: number | null;
  final: number | null;
};

export type Weights = {
  process: number;
  midterm: number;
  practice: number;
  final: number;
};

export type Subject = {
  id: string;
  code: string;
  name: string;
  credits: number;
  weights: Weights;
  scores: Component;
};

export type Semester = {
  id: string;
  name: string;
  targetGPA: number;
  subjects: Subject[];
};

export type LetterGradeRange = {
  letter: string;
  min: number;
  max: number;
  gpa4: number;
};

export type PresetId = "UIT" | "HUST" | "Custom";

export type AppState = {
  presetId: PresetId;
  semesters: Semester[];
  letterGrades: LetterGradeRange[];
  subjectPassThreshold: number;
  componentPassEnabled: boolean;
  componentPassThreshold: number;
  targetGPA: number;
  totalCourseCredits: number;
  scholarshipGPA: number;
  language: "en" | "vi";
};

export const DEFAULT_LETTER_GRADES: LetterGradeRange[] = [
  { letter: "A+", min: 9.0, max: 10.01, gpa4: 4.0 },
  { letter: "A", min: 8.5, max: 9.0, gpa4: 4.0 },
  { letter: "B+", min: 8.0, max: 8.5, gpa4: 3.5 },
  { letter: "B", min: 7.0, max: 8.0, gpa4: 3.0 },
  { letter: "C+", min: 6.5, max: 7.0, gpa4: 2.5 },
  { letter: "C", min: 5.5, max: 6.5, gpa4: 2.0 },
  { letter: "D+", min: 5.0, max: 5.5, gpa4: 1.5 },
  { letter: "D", min: 4.0, max: 5.0, gpa4: 1.0 },
  { letter: "F", min: 0, max: 4.0, gpa4: 0 },
];

export const DEFAULT_STATE: AppState = {
  presetId: "UIT",
  semesters: [],
  letterGrades: DEFAULT_LETTER_GRADES,
  subjectPassThreshold: 5.0,
  componentPassEnabled: false,
  componentPassThreshold: 3.0,
  targetGPA: 8.0,
  totalCourseCredits: 140,
  scholarshipGPA: 8.0,
  language: "en",
};
