import type { ISubject } from "./ISubject";

export interface ISemester {
    id: string;
    name: string;
    semesterNumber: number;
    targetGPA: number;
    subjects: ISubject[];
};