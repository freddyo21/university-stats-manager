import { useAcademicStore } from "@/hooks/useAcademicStore";
import { useState, useMemo, useCallback, useEffect } from "react";
import { calculateAcademicMetrics } from "./helper";
import { roundGpa, subjectPassed } from "@/lib/academic/calc";
import type { TGradingScale, TPrecisionMode } from "@/types/types";

const SCALE_4_FACTOR = 2.5;
const FORMAT_DASH = "—";

export function useGoalsMetrics() {
    const { state, update } = useAcademicStore();

    const [selectedId, setSelectedId] = useState<string>("");

    // 1. Sync semester ID with useEffect (avoid render-time state updates)
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

    const selectedSemester = state.semesters[selectedIndex];

    // 2. Memoize metrics calculation with optimized dependencies
    const metrics = useMemo(() => {
        if (selectedIndex < 0) {
            return calculateAcademicMetrics(undefined, [], state, state.precisionMode);
        }
        const sliced = state.semesters.slice(0, selectedIndex + 1);
        return calculateAcademicMetrics(selectedSemester, sliced, state, state.precisionMode);
    }, [
        selectedIndex,
        selectedSemester,
        state.precisionMode,
        state.subjectPassThreshold,
        state.componentPassEnabled,
        state.componentPassThreshold,
        state.letterGrades,
        state.semesters,
    ]);

    const { semesterData, gross10UpTo, gross4UpTo, cumulative10UpTo, cumulative4UpTo } = metrics;

    // 3. Memoize active count calculation
    const activeCount = useMemo(
        () =>
            selectedSemester
                ? selectedSemester.subjects.filter(
                    (s) =>
                        subjectPassed(
                            s,
                            state.subjectPassThreshold,
                            state.componentPassEnabled,
                            state.componentPassThreshold,
                            state.precisionMode
                        ) !== null
                ).length
                : 0,
        [
            selectedSemester,
            state.subjectPassThreshold,
            state.componentPassEnabled,
            state.componentPassThreshold,
            state.precisionMode
        ]
    );

    // 4. Memoize display GPA calculations
    const displayGpaValues = useMemo(() => {
        const getDisplayGpa = (gpa4: number | null, gpa10: number | null): number | null => {
            if (state.activeScale === "4") {
                return gpa4;
            } else if (state.activeScale === "100" && gpa10 !== null) {
                return roundGpa(gpa10 * 10, state.precisionMode);
            } else {
                return gpa10;
            }
        };

        const displayTargetGPARaw = selectedSemester
            ? state.activeScale === "4"
                ? selectedSemester.targetGPA / SCALE_4_FACTOR
                : state.activeScale === "100"
                    ? selectedSemester.targetGPA * 10
                    : selectedSemester.targetGPA
            : 0;

        return {
            currentGpa: getDisplayGpa(semesterData.gpa4, semesterData.gpa10),
            grossCpa: getDisplayGpa(gross4UpTo.gpa4, gross10UpTo.gpa10),
            currentCpa: getDisplayGpa(cumulative4UpTo.gpa4, cumulative10UpTo.gpa10),
            displayTargetGPARaw,
        };
    }, [
        semesterData,
        gross10UpTo,
        gross4UpTo,
        cumulative10UpTo,
        cumulative4UpTo,
        state.activeScale,
        state.precisionMode,
        selectedSemester
    ]);

    // 5. Memoize rounded GPA values
    const roundedGpaValues = useMemo(() => {
        const roundedCurrentGPA = displayGpaValues.currentGpa !== null ? roundGpa(displayGpaValues.currentGpa, 2) : null;
        const roundedTargetGPA = roundGpa(displayGpaValues.displayTargetGPARaw, state.precisionMode);
        const roundedScholarshipGPA = roundGpa(state.eligibleForScholarshipGPA, state.precisionMode);

        return { roundedCurrentGPA, roundedTargetGPA, roundedScholarshipGPA };
    }, [displayGpaValues, state.precisionMode, state.eligibleForScholarshipGPA]);

    // 6. Memoize status flags
    const statusFlags = useMemo(
        () => ({
            goalAchieved: Boolean(
                selectedSemester
                && roundedGpaValues.roundedCurrentGPA !== null
                && roundedGpaValues.roundedCurrentGPA >= roundedGpaValues.roundedTargetGPA
            ),
            hasScholarship: roundedGpaValues.roundedCurrentGPA !== null
                && roundedGpaValues.roundedCurrentGPA >= roundedGpaValues.roundedScholarshipGPA,
        }),
        [selectedSemester, roundedGpaValues]
    );

    // 7. Memoize action callbacks
    const setSemesterTarget = useCallback(
        (v: number) => {
            if (!selectedSemester) return;
            update((s) => ({
                ...s,
                semesters: s.semesters.map((x) =>
                    x.id === selectedSemester.id ? { ...x, targetGPA: Math.min(10, Math.max(0, v)) } : x
                ),
            }));
        },
        [selectedSemester, update]
    );

    const setActiveScale = useCallback(
        (scale: TGradingScale) => {
            update((s) => ({
                ...s,
                activeScale: scale,
                eligibleForScholarshipGPA: Number(scale) * 0.8,
            }));
        },
        [update]
    );

    const setPrecisionMode = useCallback(
        (mode: TPrecisionMode) => {
            update((s) => ({ ...s, precisionMode: mode }));
        },
        [update]
    );

    // 8. Memoize formatter function
    const formatGpa = useCallback(
        (value: number | null) => (value === null ? FORMAT_DASH : value.toFixed(2)),
        []
    );

    // 9. Memoize return object to prevent reference churn in consumers
    return useMemo(
        () => ({
            // States & Metadata
            state,
            selectedId,
            setSelectedId,
            selectedSemester,
            selectedIndex,
            activeCount,
            activeScale: state.activeScale,

            // Calculated Display Values
            currentGpa: displayGpaValues.currentGpa,
            grossCpa: displayGpaValues.grossCpa,
            currentCpa: displayGpaValues.currentCpa,
            targetGpa: displayGpaValues.displayTargetGPARaw,
            scholarshipThreshold: roundedGpaValues.roundedScholarshipGPA,

            // Rounded Values
            roundedCurrentGPA: roundedGpaValues.roundedCurrentGPA,
            roundedTargetGPA: roundedGpaValues.roundedTargetGPA,
            roundedScholarshipGPA: roundedGpaValues.roundedScholarshipGPA,

            // Status Flags
            goalAchieved: statusFlags.goalAchieved,
            hasScholarship: statusFlags.hasScholarship,
            precisionMode: state.precisionMode,

            // Metrics
            metrics,

            // Formatters
            formatGpa,

            // Actions
            setSemesterTarget,
            setActiveScale,
            setPrecisionMode,
        }),
        [
            state,
            selectedId,
            selectedSemester,
            selectedIndex,
            activeCount,
            displayGpaValues,
            roundedGpaValues,
            statusFlags,
            metrics,
            formatGpa,
            setSemesterTarget,
            setActiveScale,
            setPrecisionMode,
        ]
    );
}