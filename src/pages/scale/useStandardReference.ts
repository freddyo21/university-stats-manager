import { useAcademicStore } from "../../hooks/useAcademicStore";
import schoolStandardScales from "../../data/school-standard-scales.json" with { type: "json" };
import { useMemo } from "react";

export function useStandardReference() {
    const { state } = useAcademicStore();

    // Factory Pattern: presets produce institution-specific defaults.
    const STANDARD_REFERENCE = useMemo(() => {
        // 1. Xác định đúng mảng thang điểm gốc dựa trên presetId hiện tại
        const targetScale = state.presetId === "hust"
            ? schoolStandardScales.hust
            : schoolStandardScales.uit;

        // 2. Chỉ thực hiện map dữ liệu một lần duy nhất cho trường đang active
        return targetScale.map((r) => ({
            range: `${r.min.toFixed(1)} – ${r.max >= 10 ? "10.0" : r.max.toFixed(1)}`,
            letter: r.letter,
            gpa4: r.gpa4,
        }));
    }, [state.presetId]);

    return { STANDARD_REFERENCE };
}