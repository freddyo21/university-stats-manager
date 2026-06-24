import type { TSubjectGradeComponent } from "./TSubjectGradeComponent";
import type { TSubjectWeights } from "./TSubjectWeights";

export type TSubject = {
    id: string;
    code: string;
    name: string;
    credits: number;
    isExempt: boolean;
    weights: TSubjectWeights;
    scores: TSubjectGradeComponent;
};