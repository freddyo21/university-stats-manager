import { useAcademicStore } from "@/hooks/useAcademicStore";
import { useState, useMemo, useCallback, useEffect } from "react";
import { calculateAcademicMetrics } from "./helper";
import type { TPrecisionMode } from "@/types/types";
import { roundToPrecision } from "@/utils/helpers";
import { Semester } from "@/entities/Semester";

const FORMAT_DASH = "—";
// const SCALE_4_FACTOR = 2.5; // Hệ số chuyển đổi từ GPA 10 sang GPA 4 (10 / 4 = 2.5)

export function useGoalsMetrics() {
    const { state, update } = useAcademicStore();
    const [selectedId, setSelectedId] = useState<string>("");

    // const {
    //     subjectPassThreshold,
    //     componentThresholdEnabled,
    //     componentPassThreshold,
    //     scoreInputMode,
    //     presetId
    // } = state;

    // 1. Đồng bộ hóa ID học kỳ được chọn (Né lỗi render-time state updates)
    useEffect(() => {
        if (state.semesters.length === 0) {
            setSelectedId("");
            return;
        }

        const exists = state.semesters.some((s) => s.id === selectedId);
        if (!exists) {
            setSelectedId(state.semesters[0]?.id ?? "");
        }
    }, [state.semesters, selectedId]);

    const selectedIndex = useMemo(
        () => state.semesters.findIndex((s) => s.id === selectedId),
        [state.semesters, selectedId]
    );

    // selectedSemester lúc này đảm bảo là Instance của Class Semester
    const selectedSemester = useMemo(() => {
        return state.semesters[selectedIndex];
    }, [state.semesters, selectedIndex]);

    // 2. Tính toán các chỉ số tịnh tiến (UpTo) với Dependency Array tối giản
    const metrics = useMemo(() => {
        if (selectedIndex < 0 || !selectedSemester) {
            return calculateAcademicMetrics(undefined, [], state);
        }
        const sliced = state.semesters.slice(0, selectedIndex + 1);
        return calculateAcademicMetrics(selectedSemester, sliced, state);
    }, [selectedIndex, selectedSemester, state]);

    const { semesterData, cumulativeUpTo, grossUpTo } = metrics;

    // 3. Đếm tổng số môn trong học kỳ hiện tại bằng Method nội tại của Class Subject
    const subjectCount = useMemo(() => {
        if (!selectedSemester) return 0;

        // return selectedSemester.subjects.filter((sub) => {
        //     // Gọi method nội tại của Class môn học để kiểm tra trạng thái qua môn
        //     return sub.isPassed({
        //         subjectPassThreshold,
        //         componentThresholdEnabled,
        //         componentPassThreshold,
        //         scoreInputMode,
        //         presetId
        //     });
        // }).length;
        return selectedSemester.subjects.reduce((count) => {
            return count + 1;
        }, 0);
    }, [
        selectedSemester,
        state.subjectPassThreshold,
        state.componentThresholdEnabled,
        state.componentPassThreshold,
        state.presetId
    ]);

    // 4. Tính toán hiển thị điểm số theo cấu hình Thang điểm (Active Scale)
    const displayGpaValues = useMemo(() => {
        const getDisplayGpa = (gpa4: number | null, gpa10: number | null, gpa100: number | null): number | null => {
            if (state.activeScale === "4") return gpa4;
            if (state.activeScale === "100") return gpa100;
            return gpa10;
        };

        // const displayTargetGPARaw = selectedSemester
        //     ? state.activeScale === "4"
        //         ? roundToPrecision(selectedSemester.targetGPA / SCALE_4_FACTOR, 2) // Giữ nguyên chia thô hệ số 2.5 nhưng bọc cứng làm tròn 2 chữ số
        //         : state.activeScale === "100"
        //             ? selectedSemester.targetGPA * 10
        //             : selectedSemester.targetGPA
        //     : 0;
        console.log("Selected Semester:", selectedSemester);
        const displayTargetGPARaw = selectedSemester?.targetGPA;

        return {
            currentGpa: getDisplayGpa(semesterData.gpa4, semesterData.gpa10, semesterData.gpa100),
            grossCpa: getDisplayGpa(grossUpTo.gpa4, grossUpTo.gpa10, grossUpTo.gpa100),
            currentCpa: getDisplayGpa(cumulativeUpTo.gpa4, cumulativeUpTo.gpa10, cumulativeUpTo.gpa100),
            displayTargetGPARaw,
        };
    }, [semesterData, grossUpTo, cumulativeUpTo, state.activeScale, selectedSemester]);

    // 5. Làm tròn các hệ điểm phục vụ logic so sánh hiển thị trên UI
    const roundedGpaValues = useMemo(() => {
        const roundedCurrentGPA = displayGpaValues.currentGpa !== null ? roundToPrecision(displayGpaValues.currentGpa, 2) : null;
        const roundedTargetGPA = roundToPrecision(displayGpaValues.displayTargetGPARaw, 2);
        const roundedScholarshipGPA = roundToPrecision(state.eligibleForScholarshipGPA, 2);

        return { roundedCurrentGPA, roundedTargetGPA, roundedScholarshipGPA };
    }, [displayGpaValues, state.eligibleForScholarshipGPA]);

    // 6. Các cờ trạng thái kiểm tra mục tiêu học tập
    const statusFlags = useMemo(
        () => ({
            goalAchieved: Boolean(
                selectedSemester &&
                roundedGpaValues.roundedCurrentGPA !== null &&
                roundedGpaValues.roundedCurrentGPA >= roundedGpaValues.roundedTargetGPA
            ),
            hasScholarship: Boolean(
                roundedGpaValues.roundedCurrentGPA !== null &&
                roundedGpaValues.roundedCurrentGPA >= roundedGpaValues.roundedScholarshipGPA
            ),
        }),
        [selectedSemester, roundedGpaValues]
    );

    // 7. CẬP NHẬT MỤC TIÊU: Đúc lại Instance Class sạch sẽ, triệt tiêu bug mất method OOP
    const setSemesterTarget = useCallback(
        (v: number) => {
            if (!selectedSemester) return;

            // Nếu đang ở thang 4, user gõ 3.2 thì phải nhân ngược với 2.5 để trả về số 8.0 lưu vào DB hệ 10
            // const targetInScale10 = state.activeScale === "4"
            //     ? v * SCALE_4_FACTOR
            //     : state.activeScale === "100"
            //         ? v / 10
            //         : v;

            update((s) => ({
                ...s,
                semesters: s.semesters.map((x) => {
                    if (x.id !== selectedSemester.id) return x;

                    return new Semester({
                        id: x.id,
                        // name: x.name,
                        semesterNumber: x.semesterNumber,
                        // targetGPA: Math.min(10, Math.max(0, roundToPrecision(targetInScale10, 2))), // Lưu số hệ 10 sạch đã làm tròn
                        targetGPA: v,
                        subjects: x.subjects,
                        semesterId: x.semesterId
                    });
                }),
            }));
        },
        [selectedSemester, state.activeScale, update] // Thêm state.activeScale vào dep để tính toán chính xác hướng quy đổi ngược
    );

    const setPrecisionMode = useCallback(
        (mode: TPrecisionMode) => {
            update((s) => ({ ...s, precisionMode: mode }));
        },
        [update]
    );

    const formatGpa = useCallback(
        (value: number | null) => (value === null ? FORMAT_DASH : roundToPrecision(value, 2).toString()),
        []
    );

    // 8. Trả về Object tổng hợp, chống tình trạng reference churn
    return useMemo(
        () => ({
            state,
            selectedId,
            setSelectedId,
            selectedSemester,
            selectedIndex,
            subjectCount,
            activeScale: state.activeScale,

            currentGpa: displayGpaValues.currentGpa,
            grossCpa: displayGpaValues.grossCpa,
            currentCpa: displayGpaValues.currentCpa,
            targetGpa: displayGpaValues.displayTargetGPARaw,
            scholarshipThreshold: roundedGpaValues.roundedScholarshipGPA,

            roundedCurrentGPA: roundedGpaValues.roundedCurrentGPA,
            roundedTargetGPA: roundedGpaValues.roundedTargetGPA,
            roundedScholarshipGPA: roundedGpaValues.roundedScholarshipGPA,

            goalAchieved: statusFlags.goalAchieved,
            hasScholarship: statusFlags.hasScholarship,
            precisionMode: state.precisionMode,

            metrics,
            formatGpa,

            setSemesterTarget,
            setPrecisionMode,
        }),
        [
            state,
            selectedId,
            selectedSemester,
            selectedIndex,
            subjectCount,
            displayGpaValues,
            roundedGpaValues,
            statusFlags,
            metrics,
            formatGpa,
            setSemesterTarget,
            setPrecisionMode,
        ]
    );
}