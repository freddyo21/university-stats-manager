import type { ISubjectGradeComponent } from "./ISubjectGradeComponent";
import type { ISubjectWeights } from "./ISubjectWeights";
import type { TStudyType } from "../types";

export interface ISubject {
    id: string;
    code: string;
    name: string;
    credits: number;
    studyType: TStudyType;
    weights: ISubjectWeights;
    scores: ISubjectGradeComponent;
    gpa10: number | null;
};