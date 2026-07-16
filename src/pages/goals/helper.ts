import { Semester } from "@/entities/Semester";
import { calculateGlobalCumulative, calculateGlobalGross } from "@/lib/academic/calc";
import type { IAppState } from "@/types/interfaces/IAppState";

/**
 * 🎯 Tính toán các chỉ số học tập tịnh tiến (UpTo) phục vụ cho tính năng thiết lập Mục tiêu (Goals).
 * Hàm này tận dụng các hàm tổng quản toàn khóa để bốc trọn bộ GPA hệ 10 và hệ 4 cùng lúc, tối ưu hiệu năng O(N).
 */
export function calculateAcademicMetrics(
    currentSemester: Semester | undefined,
    slicedSemesters: Semester[],
    state: IAppState
) {
    const defaultMetrics = { gpa10: 0, gpa4: null, gpa100: null, credits: 0, passedCredits: 0, exemptCredits: 0 };

    // 1. Tính toán GPA cục bộ cho riêng học kỳ được chọn hiện tại bằng Method nội tại của Class
    const semesterData = currentSemester
        ? currentSemester.calculateSemesterMetrics({
            letterGrades: state.letterGrades,
            subjectPassThreshold: state.subjectPassThreshold,
            componentThresholdEnabled: state.componentThresholdEnabled,
            componentPassThreshold: state.componentPassThreshold,
            scoreInputMode: state.scoreInputMode,
            presetId: state.presetId
        })
        : defaultMetrics;

    // 2. Nếu không có học kỳ nào trong danh sách cắt lát (Sliced), trả về tập dữ liệu rỗng ngay lập tức
    if (slicedSemesters.length === 0) {
        return {
            semesterData,
            grossUpTo: defaultMetrics,
            cumulativeUpTo: defaultMetrics
        };
    }

    // 3. Gọi 2 hàm tổng quản mới để thu hoạch trọn gói các hệ điểm tịnh tiến (UpTo N)
    const globalGross = calculateGlobalGross({
        semesterInstances: slicedSemesters,
        letterGrades: state.letterGrades,
        presetId: state.presetId,
        retakeStrategy: state.retakeStrategy
    });

    const globalCumulative = calculateGlobalCumulative({
        semesterInstances: slicedSemesters,
        letterGrades: state.letterGrades,
        subjectPassThreshold: state.subjectPassThreshold,
        componentThresholdEnabled: state.componentThresholdEnabled,
        componentPassThreshold: state.componentPassThreshold,
        scoreInputMode: state.scoreInputMode,
        presetId: state.presetId
    });

    // 4. Trả ra cấu trúc dữ liệu mới, tinh gọn và đầy đủ hệ điểm cho UI bốc xài
    return {
        semesterData,
        grossUpTo: {
            gpa10: globalGross.gpa10,
            gpa4: globalGross.gpa4,
            gpa100: globalGross.gpa100,
            credits: globalGross.credits
        },
        cumulativeUpTo: {
            gpa10: globalCumulative.cpa10, // Lưu ý: Lấy cpa10 từ hàm tích lũy toàn khóa
            gpa4: globalCumulative.cpa4,
            gpa100: globalCumulative.cpa100,
            credits: globalCumulative.credits,
            passedCredits: globalCumulative.passedCredits,
            exemptCredits: globalCumulative.exemptCredits
        }
    };
}