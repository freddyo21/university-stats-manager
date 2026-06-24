import type { TSubject } from "./TSubject";

export type TSemester = {
    id: string;
    name: string;
    targetGPA: number;
    subjects: TSubject[];
};