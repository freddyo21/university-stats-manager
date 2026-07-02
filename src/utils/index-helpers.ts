import type { ISubject } from "@/types/interfaces/ISubject";
import { uuidv7 } from "@/utils/uuid";

export function newSubject(): ISubject {
    return {
        id: uuidv7(),
        code: "",
        name: "",
        credits: 3,
        weights: { process: 10, midterm: 20, practice: 20, final: 50 },
        scores: { process: null, midterm: null, practice: null, final: null },
        isExempt: false,
    };
}