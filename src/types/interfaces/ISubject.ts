import type { ISubjectGradeComponent } from "./ISubjectGradeComponent";
import type { ISubjectWeights } from "./ISubjectWeights";

export interface ISubject {
    id: string;
    code: string;
    name: string;
    credits: number;
    isExempt: boolean;
    weights: ISubjectWeights;
    scores: ISubjectGradeComponent;
};