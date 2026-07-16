import type { TGradingScale } from "@/types/types";
import { useCallback } from "react";
import { useAcademicStore } from "./useAcademicStore";
import { Semester } from "@/entities/Semester";


export const useActiveScale = () => {
    const { update } = useAcademicStore();

    const setActiveScale = useCallback(
        (scale: TGradingScale) => {
            update((s) => {
                const previousScale = s.activeScale || "10";
                const scaleNumber = Number(scale);
                
                const scholarshipThreshold = Number((scaleNumber * 0.8).toFixed(1));

                const globalTarget = s.targetGPA ?? 0;
                const rawGlobalConverted = (globalTarget / Number(previousScale)) * scaleNumber;
                const newGlobalTargetGPA = scale === "100"
                    ? Math.round(rawGlobalConverted)
                    : Math.round(rawGlobalConverted * 100) / 100;

                return ({
                    ...s,
                    activeScale: scale,
                    eligibleForScholarshipGPA: scholarshipThreshold,
                    targetGPA: newGlobalTargetGPA, // Mặc định đặt mục tiêu GPA bằng benchmark học bổng, người dùng có thể chỉnh sửa sau
                    semesters: s.semesters.map((semester) => {
                        const currentTarget = semester.targetGPA ?? 0;
                        const rawConverted = (currentTarget / Number(previousScale)) * scaleNumber;

                        const newTargetGPA = scale === "100"
                            ? Math.round(rawConverted)
                            : Math.round(rawConverted * 100) / 100;
                        
                        return new Semester({
                            ...semester.toJSON?.() || semester,
                            targetGPA: newTargetGPA // Giữ nguyên targetGPA trong Instance Class Semester, không quy đổi ngược
                        })
                    })
                })
            });
        },
        [update]
    );

    return { setActiveScale };
}