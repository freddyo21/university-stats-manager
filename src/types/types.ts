export type ScoreKey = "process" | "midterm" | "practice" | "final";
export type TPresetId = "uit" | "custom";
export type TGradingScale = "10" | "4" | "100";
export type TSemesterGPA = { value: number; scale: TGradingScale };
export type TPrecisionMode = 1 | 2;
export type TScoreInputMode = "full" | "gpaOnly";
export type TStudyType = "normal" | "retake" | "improvement" | "exempt";
export type TRetakeStrategy = "highest" | "latest";

export type BoundaryTone = "muted" | "success" | "info" | "accent" | "warning" | "error";
export type ScoreTone = BoundaryTone | "primary" | "destructive";