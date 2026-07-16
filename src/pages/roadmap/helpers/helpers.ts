import type { TGradingScale } from "@/types/types";

export type Advisory = {
    label: { en: string; vi: string };
    tone: "success" | "primary" | "warning" | "destructive";
    advice: { en: string; vi: string };
};

export function classify(gpa: number | null, scale: TGradingScale | null): Advisory {
    if (gpa === null)
        return {
            label: { en: "—", vi: "—" },
            tone: "primary",
            advice: { en: "Enter grades to see your classification.", vi: "Nhập điểm để xem xếp loại." },
        };

    if (scale === null)
        return {
            label: { en: "—", vi: "—" },
            tone: "primary",
            advice: { en: "Select a grading scale to see your classification.", vi: "Chọn hệ điểm để xem xếp loại." },
        };

    const scaleNumber = Number(scale);

    let thresholds = {
        excellent: scaleNumber * 0.9,   // Hệ 10: 9.0  | Hệ 4: 3.6  | Hệ 100: 90
        veryGood: scaleNumber * 0.8,    // Hệ 10: 8.0  | Hệ 4: 3.2  | Hệ 100: 80
        good: scaleNumber * 0.7,        // Hệ 10: 7.0  | Hệ 4: 2.8  | Hệ 100: 70
        fair: scaleNumber * 0.6,        // Hệ 10: 6.0  | Hệ 4: 2.4  | Hệ 100: 60
        alert: scaleNumber * 0.5,       // Hệ 10: 5.0  | Hệ 4: 2.0  | Hệ 100: 50
    };

    if (scale === "4") {
        thresholds.good = 2.5;
        thresholds.fair = 2.0;
        thresholds.alert = 1.5; // Ngưỡng cảnh báo học vụ nhẹ
    }

    // Ngưỡng Xuất sắc (Excellent) -> Đạt học bổng
    if (gpa >= thresholds.excellent)
        return {
            label: { en: "Excellent — Scholarship", vi: "Xuất sắc — Học bổng" },
            tone: "success",
            advice: { en: "Flawless academic record! Keep leading the cohort.", vi: "Thành tích tuyệt đối! Hãy tiếp tục duy trì vị thế dẫn đầu." },
        };

    // Ngưỡng Giỏi (Very Good) -> Cơ hội học bổng cao
    if (gpa >= thresholds.veryGood)
        return {
            label: { en: "Very Good — Scholarship", vi: "Giỏi — Học bổng" },
            tone: "success",
            advice: { en: "Outstanding performance. Maintain momentum to keep scholarships.", vi: "Thành tích xuất sắc. Giữ vững phong độ để bảo vệ học bổng." },
        };

    // Ngưỡng Khá (Good) -> Tạm ổn, tiệm cận học bổng
    if (gpa >= thresholds.good)
        return {
            label: { en: "Good / Fair — Acceptable", vi: "Khá / Trung bình — Tạm được" },
            tone: "warning",
            advice: { en: "Solid baseline. Push a few subjects to unlock scholarship range.", vi: "Nền tảng ổn. Nên cố gắng học cải thiện thêm vài môn điểm thấp để lên ngưỡng học bổng." },
        };

    // Ngưỡng Trung bình (Fair) -> Cảnh báo học tập nhẹ, nên học cải thiện
    if (gpa >= thresholds.fair)
        return {
            label: { en: "Fair — Need Improvement", vi: "Trung bình — Nên học cải thiện" },
            tone: "warning",
            advice: { en: "Review your low-credit subjects. Target minor grade improvements to secure a Good rating.", vi: "Điểm ở mức an toàn nhưng chưa cao. Hãy lên kế hoạch học cải thiện để kéo GPA lên mức Khá." },
        };

    // Ngưỡng Yếu (Academic Alert) -> Điểm chạm mốc trượt môn, cần tối ưu lại phương pháp
    if (gpa >= thresholds.alert)
        return {
            label: { en: "Academic Alert — Need Improvement", vi: "Cảnh báo — Cần cải thiện" },
            tone: "warning",
            advice: { en: "Plan retakes for weak subjects and raise your component scores.", vi: "Lên kế hoạch học cải thiện cho các môn yếu." },
        };

    // Ngưỡng Kém (Critical Fail) -> Buộc phải học lại để gỡ nợ
    return {
        label: { en: "Critical Fail — Re-take required", vi: "Nguy hiểm — Học lại" },
        tone: "destructive",
        advice: { en: "Prioritize retakes immediately; restructure your timeline and reduce course load.", vi: "Diện cảnh báo đỏ! Ưu tiên đăng ký học lại ngay các môn bị tạch để giải phóng nợ môn." },
    };
}

export const formatGpa = (value: number | null) => (value === null ? "—" : value.toFixed(2));

export const formatSemesterId = (semesterId: string | undefined) => {
    if (!semesterId) return "—";

    const match = semesterId.match(/^(\d{4})-(\d)$/);
    if (!match) return semesterId;

    const year = match[1];
    const term = match[2];
    return { year, term };
};