import type { ILetterGradeRange } from "./ILetterGradeRange";
import type { ISemester } from "./ISemester";
import type { TGradingScale, TPrecisionMode, TPresetId } from "../types";

export interface IAppState {
    presetId: TPresetId;
    semesters: ISemester[];
    letterGrades: ILetterGradeRange[];
    subjectPassThreshold: number;
    componentPassEnabled: boolean;
    componentPassThreshold: number;
    targetGPA: number;
    totalCourseCredits: number;
    eligibleForScholarshipGPA: number;
    activeScale: TGradingScale | null;
    precisionMode: TPrecisionMode;
    language: "en" | "vi";
};