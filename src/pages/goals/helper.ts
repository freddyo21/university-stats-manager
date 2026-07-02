import { calculateSemesterMetrics, cumulativeGPA10, cumulativeGPA4, grossGPA10, grossGPA4 } from "@/lib/academic/calc";
import type { IAppState } from "@/types/interfaces/IAppState";
import type { ISemester } from "@/types/interfaces/ISemester";
import type { TPrecisionMode } from "@/types/types";

export function calculateAcademicMetrics(
    currentSemester: ISemester | undefined,
    slicedSemesters: ISemester[],
    state: IAppState,
    precisionMode?: TPrecisionMode
) {
    const default10 = { gpa10: 0, gpa4: null, credits: 0, passedCredits: 0, exemptCredits: 0 };
    const default4 = { gpa10: null, gpa4: 0, credits: 0, passedCredits: 0, exemptCredits: 0 };

    // 1. Tính toán cho riêng học kỳ được chọn hiện tại
    const semesterData = currentSemester
        ? calculateSemesterMetrics(
            currentSemester,
            state.letterGrades,
            state.subjectPassThreshold,
            state.componentPassEnabled,
            state.componentPassThreshold,
            precisionMode
        ) : state.activeScale === "4" ? default4 : default10;

    // 2. Nếu không có học kỳ nào được chọn hợp lệ, trả về tập data rỗng
    if (slicedSemesters.length === 0) {
        return {
            semesterData,
            gross10UpTo: default10,
            gross4UpTo: default4,
            cumulative10UpTo: default10,
            cumulative4UpTo: default4
        };
    }

    // 3. Tính toán cộng dồn tịnh tiến (UpTo) dựa trên mảng học kỳ đã cắt lát
    return {
        semesterData,
        gross10UpTo: grossGPA10(slicedSemesters, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold, precisionMode),
        gross4UpTo: grossGPA4(slicedSemesters, state.letterGrades, precisionMode),
        cumulative10UpTo: cumulativeGPA10(slicedSemesters, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold, precisionMode),
        cumulative4UpTo: cumulativeGPA4(slicedSemesters, state.letterGrades, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold, precisionMode)
    };
}