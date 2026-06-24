import type { TLetterGradeRange } from "./TLetterGradeRange";
import type { TSemester } from "./TSemester";
import type { TGradingScale, TPrecisionMode, TPresetId } from "./types";

export type TAppState = {
    presetId: TPresetId;
    semesters: TSemester[];
    letterGrades: TLetterGradeRange[];
    subjectPassThreshold: number;
    componentPassEnabled: boolean;
    componentPassThreshold: number;
    targetGPA: number;
    totalCourseCredits: number;
    scholarshipGPA: number;
    activeScale: TGradingScale | null;
    precisionMode: TPrecisionMode;
    language: "en" | "vi";
};