import type { ISemester } from "@/types/interfaces/ISemester";
import { Subject } from "./Subject";
import { uuidv7 } from "@/utils/uuid";
import type { ILetterGradeRange } from "@/types/interfaces/ILetterGradeRange";
import type { TPresetId, TScoreInputMode } from "@/types/types";
import type { IScaleMetrics } from "@/types/interfaces/IScaleMetrics";

export class Semester implements ISemester {
    private _id: string;
    // private _name: string;
    private _semesterNumber: number;
    private _semesterId?: string;
    private _targetGPA: number
    private _subjects: Subject[];
    private _index: number = 0;

    constructor(semester?: Partial<ISemester> & { currentLength?: number }) {
        // Nếu truyền currentLength từ ngoài vào (ví dụ lúc add mới), ta dùng nó làm index để tăng số học kỳ
        if (typeof semester?.currentLength === "number") {
            this._index = semester.currentLength;
        }

        const nextNumber = (semester?.semesterNumber && semester.semesterNumber > 0)
            ? semester.semesterNumber
            : (this._index + 1);

        this._id = semester?.id ?? uuidv7();
        this._semesterId = semester?.semesterId ?? "";
        this._targetGPA = semester?.targetGPA ?? 8.0;

        // Sử dụng nextNumber thống nhất để đồng bộ cả Tên và Số học kỳ
        // this._name = semester?.name ?? `Semester ${nextNumber}`;
        this._semesterNumber = nextNumber;

        this._subjects = (semester?.subjects || []).map((sub) => {
            // Nếu item đã là Instance của Class Subject rồi thì giữ nguyên, ngược lại thì new Subject()
            return sub instanceof Subject ? sub : new Subject(sub);
        });
    }

    get id() { return this._id; }
    // get name() { return this._name; }
    get semesterNumber() { return this._semesterNumber; }
    get semesterId() { return this._semesterId; }
    get targetGPA() { return this._targetGPA; }
    get subjects() { return this._subjects; }

    // set name(value: string) { this._name = value; }
    set semesterNumber(value: number) { this._semesterNumber = value; }
    set semesterId(value: string | undefined) { this._semesterId = value; }
    set targetGPA(value: number) { this._targetGPA = value; }
    set subjects(value: Subject[]) { this._subjects = value; }

    /**
     * 📊 Tính toán toàn bộ chỉ số GPA nội bộ của riêng học kỳ này.
     * * Hàm này phục vụ mục đích hiển thị thông số trên UI Card của từng Học kỳ độc lập.
     * Tính toán dựa trên TẤT CẢ các môn có phát sinh điểm trong kỳ (normal, retake, improvement).
     * Điểm đầu ra được chia trung bình và làm tròn cứng về 2 chữ số thập phân.
     * @param letterGrades Mảng cấu hình khoảng điểm quy đổi sang Hệ chữ (A+, B...)
     * @param subjectPassThreshold Điểm sàn để tính là qua môn (Ví dụ: 5.0)
     * @param componentThresholdEnabled Bật/Tắt tính năng xét điểm liệt thành phần
     * @param componentPassThreshold Thang điểm liệt thành phần (Ví dụ: 3.0 hoặc 4.0)
     * @param scoreInputMode Chế độ nhập điểm ("full" tính từ thành phần, "gpaOnly" lấy thẳng gpa10)
     * @param presetId Cấu hình quy chế trường ("uit" hoặc "Custom")
     * @returns Object chứa đầy đủ GPA hệ 10, hệ 4, hệ 100 và số tín chỉ của riêng kỳ này
     */
    calculateSemesterMetrics({
        letterGrades,
        subjectPassThreshold,
        componentThresholdEnabled,
        componentPassThreshold,
        scoreInputMode = "full",
        presetId = "uit"
    }: {
        letterGrades: ILetterGradeRange[],
        subjectPassThreshold: number,
        componentThresholdEnabled: boolean,
        componentPassThreshold: number,
        scoreInputMode: TScoreInputMode,
        presetId: TPresetId
    }): IScaleMetrics {
        let totalCredits = 0,
            passedCredits = 0,
            failedCredits = 0,
            exemptCredits = 0;

        let weighted10 = 0,
            weighted4 = 0,
            weighted100 = 0;

        let any = false;

        for (const sub of this._subjects) {
            const credits = sub.credits;
            if (credits <= 0) continue;

            // 1. Xử lý trạng thái MIỄN HỌC (exempt)
            if (sub.studyType === "exempt") {
                exemptCredits += credits;
                // Môn miễn học mặc định được tính là đã tích lũy đạt để xét tốt nghiệp
                passedCredits += credits;
                continue;
            }

            // Phòng thủ chặn các trạng thái dị biệt (nếu có)
            if (sub.studyType !== "normal" && sub.studyType !== "retake" && sub.studyType !== "improvement") {
                continue;
            }

            // 2. Gọi logic tự tính điểm và check Đạt/Tạch của riêng môn đó
            const sc10 = sub.calculateGPA10(presetId);
            const passed = sub.isPassed({
                subjectPassThreshold,
                componentThresholdEnabled,
                componentPassThreshold,
                scoreInputMode,
                presetId
            });

            // Nếu môn này chưa được nhập điểm (Môn đang học) -> Bỏ qua không tính vào GPA kỳ hiện tại
            if (sc10 === null) continue;

            // 3. Quy đổi trực tiếp sang hệ 4 và hệ 100 từ con điểm 10 đã được làm tròn sạch sẽ
            const sc4 = sub.convertGPA10ToGPA4(sc10, letterGrades);
            const sc100 = sub.convertGPA10ToGPA100(sc10);

            // 4. CỘNG DỒN TRỌNG SỐ TÍN CHỈ
            any = true;
            weighted10 += sc10 * credits;
            weighted4 += sc4 * credits;
            weighted100 += sc100 * credits;
            totalCredits += credits;

            if (passed === true) {
                passedCredits += credits;
            } else if (passed === false) {
                failedCredits += credits;
            }
        }

        const calculateGPA = (weighted: number, total: number) => {
            return any && total > 0 ? Math.round((weighted / total) * 100) / 100 : null;
        };

        // 5. TRẢ VỀ ĐỒNG THỜI CÁC HỆ ĐIỂM (Làm tròn 2 chữ số sau dấu phẩy ở tầng hiển thị học kỳ)
        return {
            gpa10: calculateGPA(weighted10, totalCredits),
            gpa4: calculateGPA(weighted4, totalCredits),
            gpa100: calculateGPA(weighted100, totalCredits),
            credits: totalCredits + exemptCredits,
            passedCredits,
            failedCredits,
            exemptCredits,
        };
    }

    /**
     * 📈 Thu thập tổng điểm trọng số và tổng tín chỉ thô phục vụ tính Trung bình chung toàn khóa (Gross GPA).
     * * Hàm này KHÔNG chia trung bình hay làm tròn. Nó chỉ trả về nguyên liệu thô (tử số và mẫu số) 
     * để hàm Tổng quản ở ngoài cùng gom từ nhiều học kỳ lại rồi mới chia, tránh sai số tích lũy lũy tiến.
     * Chế độ Gross tính tất cả mọi nỗ lực học, loại trừ môn Miễn học "exempt" do không có điểm hệ 10.
     * @param letterGrades Mảng cấu hình khoảng điểm quy đổi sang Hệ chữ
     * @param presetId Cấu hình quy chế trường ("uit" hoặc "Custom")
     * @returns Object chứa tổng tử số các hệ điểm và tổng mẫu số tín chỉ của học kỳ ở chế độ Gross
     */
    // calculateGrossMetrics(
    //     letterGrades: ILetterGradeRange[],
    //     presetId: TPresetId = "uit"
    // ) {
    //     let creditsCount = 0;
    //     let weighted10 = 0; // Tổng điểm hệ 10 * tín chỉ
    //     let weighted4 = 0; // Tổng điểm hệ 4 * tín chỉ
    //     let weighted100 = 0; // Tổng điểm hệ 100 * tín chỉ

    //     for (const sub of this._subjects) {
    //         if (sub.credits <= 0 || sub.studyType === "exempt") continue;

    //         const sc10 = sub.calculateGPA10(presetId);
    //         if (sc10 === null) continue;

    //         const sc4 = sub.convertGPA10ToGPA4(sc10, letterGrades);
    //         const sc100 = sub.convertGPA10ToGPA100(sc10);

    //         weighted10 += sc10 * sub.credits;
    //         weighted4 += sc4 * sub.credits;
    //         weighted100 += sc100 * sub.credits;
    //         creditsCount += sub.credits;
    //     }

    //     return { weighted10, weighted4, weighted100, creditsCount };
    // }

    /**
     * 🏆 Thu thập tổng điểm trọng số và tổng tín chỉ thô phục vụ tính Điểm tích lũy tốt nghiệp (CPA / Cumulative).
     * * Hàm này áp dụng bộ lọc nghiêm ngặt của quy chế đào tạo:
     * - Loại bỏ hoàn toàn môn mang trạng thái Trả nợ "retake" để chặn đứng lỗi phình mẫu số tín chỉ ảo.
     * - Chỉ ghi nhận điểm của các môn thực sự ĐẠT (Passed).
     * - Môn Miễn học "exempt" chỉ cộng dồn vào kho tín chỉ tích lũy (mẫu số riêng), không tham gia vào tử số tính điểm.
     * @param letterGrades Mảng cấu hình khoảng điểm quy đổi sang Hệ chữ
     * @param subjectPassThreshold Điểm sàn để tính là qua môn (Ví dụ: 5.0)
     * @param componentThresholdEnabled Bật/Tắt tính năng xét điểm liệt thành phần
     * @param componentPassThreshold Thang điểm liệt thành phần
     * @param scoreInputMode Chế độ nhập điểm ("full" hoặc "gpaOnly")
     * @param presetId Cấu hình quy chế trường ("uit" hoặc "Custom")
     * @returns Object chứa tổng tử số các hệ điểm, tổng mẫu số tín chỉ đạt và tổng tín chỉ miễn học
     */
    calculateCumulativeMetrics(
        letterGrades: ILetterGradeRange[],
        subjectPassThreshold: number,
        componentThresholdEnabled: boolean,
        componentPassThreshold: number,
        scoreInputMode: TScoreInputMode = "full",
        presetId: TPresetId = "uit"
    ) {
        let creditsCount = 0;
        let exemptCreditsCount = 0;
        let weighted10 = 0;
        let weighted4 = 0;
        let weighted100 = 0;

        for (const sub of this._subjects) {
            if (sub.credits <= 0) continue;

            // Môn miễn học: Vẫn ghi nhận số tín chỉ tích lũy, nhưng bypass tính điểm GPA
            if (sub.studyType === "exempt") {
                exemptCreditsCount += sub.credits;
                continue;
            }

            // 🎯 BỘ LỌC ĐỘC QUYỀN UIT: Môn Trả nợ (retake) KHÔNG được phép tham gia vào mẫu số tích lũy
            // if (sub.studyType === "retake") {
            //     continue;
            // }

            const sc10 = sub.calculateGPA10(presetId);
            const passed = sub.isPassed({
                subjectPassThreshold,
                componentThresholdEnabled,
                componentPassThreshold,
                scoreInputMode,
                presetId
            });

            // Môn chưa nhập điểm (đang học) hoặc môn bị TẠCH -> Không được tính vào tích lũy tốt nghiệp
            if (sc10 === null || passed !== true) continue;

            const sc4 = sub.convertGPA10ToGPA4(sc10, letterGrades);
            const sc100 = sub.convertGPA10ToGPA100(sc10);

            weighted10 += sc10 * sub.credits;
            weighted4 += sc4 * sub.credits;
            weighted100 += sc100 * sub.credits;
            creditsCount += sub.credits;
        }

        return { weighted10, weighted4, weighted100, creditsCount, exemptCreditsCount };
    }

    toJSON() {
        return {
            id: this._id,
            // name: this._name,
            semesterNumber: this._semesterNumber,
            semesterId: this._semesterId,
            targetGPA: this._targetGPA,
            subjects: this._subjects.map((sub) => sub.toJSON()),
        };
    }
}