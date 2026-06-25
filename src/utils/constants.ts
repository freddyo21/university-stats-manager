import type { IAppState } from "@/types/interfaces/IAppState";
import type { ILetterGradeRange } from "@/types/interfaces/ILetterGradeRange";

export const LANG_KEY = "academic-hub-lang";

export const DEFAULT_LETTER_GRADES: ILetterGradeRange[] = [
    { letter: "A+", min: 9.0, max: 10.0, gpa4: 4.0 },
    { letter: "A", min: 8.5, max: 9.0, gpa4: 4.0 },
    { letter: "B+", min: 8.0, max: 8.5, gpa4: 3.5 },
    { letter: "B", min: 7.0, max: 8.0, gpa4: 3.0 },
    { letter: "C+", min: 6.5, max: 7.0, gpa4: 2.5 },
    { letter: "C", min: 5.5, max: 6.5, gpa4: 2.0 },
    { letter: "D+", min: 5.0, max: 5.5, gpa4: 1.5 },
    { letter: "D", min: 4.0, max: 5.0, gpa4: 1.0 },
    { letter: "F", min: 0, max: 4.0, gpa4: 0 },
];

export const DEFAULT_STATE: IAppState = {
    presetId: "UIT",
    semesters: [],
    letterGrades: DEFAULT_LETTER_GRADES,
    subjectPassThreshold: 5.0,
    componentPassEnabled: false,
    componentPassThreshold: 3.0,
    targetGPA: 8.0,
    totalCourseCredits: 120,
    scholarshipGPA: 8.0,
    activeScale: null,
    precisionMode: 2,
    language: "en",
};