import { z } from "zod";

export const LetterGradeRangeSchema = z.object({
    letter: z.string(),
    min: z.number().min(0).max(10),
    max: z.number().min(0).max(10).default(10),
    gpa4: z.number().min(0).max(4)
})
    .strict()
    .refine((data) => data.min < data.max, {
        message: "min must be less than max",
    });