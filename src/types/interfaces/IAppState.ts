import type { ILetterGradeRange } from "./ILetterGradeRange";
import type { TGradingScale, TPrecisionMode, TPresetId, TRetakeStrategy, TScoreInputMode } from "../types";
import type { Semester } from "@/entities/Semester";

export interface IAppState {
    presetId: TPresetId;
    semesters: Semester[];
    letterGrades: ILetterGradeRange[];
    subjectPassThreshold: number;
    componentThresholdEnabled: boolean;
    componentPassThreshold: number;
    targetGPA: number;
    totalCourseCredits: number;
    eligibleForScholarshipGPA: number;
    activeScale: TGradingScale | null;
    retakeStrategy: TRetakeStrategy;
    precisionMode: TPrecisionMode;
    scoreInputMode: TScoreInputMode;
    language: "en" | "vi";
};