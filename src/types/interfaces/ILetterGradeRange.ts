// export interface ILetterGradeRange {
//     letter: string;
//     min: number;
//     max: number;
//     gpa4: number;
// };
import type { LetterGradeRangeSchema } from "@/schemas/LetterGradeRangeSchema";
import { z } from "zod";

type TLetterGradeRange = z.infer<typeof LetterGradeRangeSchema>;

export interface ILetterGradeRange extends TLetterGradeRange {}