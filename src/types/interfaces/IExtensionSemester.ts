import type { ISubject } from "./ISubject";

export interface IExtensionSemester {
    semester: number;
    subjects: Omit<ISubject, "id">[];
}