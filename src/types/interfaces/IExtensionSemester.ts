import type { ISubject } from "./ISubject";

export interface IExtensionSemester {
    semester: number;
    semesterId: string;
    subjects: Omit<ISubject, "id">[];
}