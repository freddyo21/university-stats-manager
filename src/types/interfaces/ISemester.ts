import type { ISubject } from "./ISubject";

export interface ISemester {
    id: string;
    name: string;
    semesterNumber: number;
    semesterId?: string; // optional field for extension data
    targetGPA: number;
    subjects: ISubject[];
};