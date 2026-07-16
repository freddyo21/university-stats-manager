import type { ILetterGradeRange } from "@/types/interfaces/ILetterGradeRange";
import type { ISubject } from "@/types/interfaces/ISubject";
import type { ISubjectGradeComponent } from "@/types/interfaces/ISubjectGradeComponent";
import type { ISubjectWeights } from "@/types/interfaces/ISubjectWeights";
import type { TPresetId, TScoreInputMode, TStudyType } from "@/types/types";
import { DEFAULT_STATE } from "@/utils/constants";
import { uuidv7 } from "@/utils/uuid";

export class Subject implements ISubject {
    private _id: string;
    private _code: string;
    private _name: string;
    private _credits: number;
    private _studyType: TStudyType;
    private _weights: ISubjectWeights;
    private _scores: ISubjectGradeComponent;
    private _gpa10: number | null;

    constructor(subject: Partial<ISubject> = {
        id: uuidv7(),
        code: "",
        name: "",
        credits: 0,
        weights: { process: null, midterm: null, practice: null, final: null },
        scores: { process: null, midterm: null, practice: null, final: null },
        gpa10: null,
        studyType: "normal",
    }) {
        this._id = subject.id ?? uuidv7();
        this._code = subject.code ?? "";
        this._name = subject.name ?? "";
        this._credits = subject.credits ?? 0;
        this._studyType = subject.studyType ?? "normal";
        this._weights = subject.weights ?? { process: null, midterm: null, practice: null, final: null };
        this._scores = subject.scores ?? { process: null, midterm: null, practice: null, final: null };
        this._gpa10 = subject.gpa10 && typeof subject.gpa10 === "number" ? subject.gpa10 : null;
    }

    get id() { return this._id; }
    get code() { return this._code; }
    get name() { return this._name; }
    get credits() { return this._credits; }
    get studyType() { return this._studyType; }
    get weights() { return this._weights; }
    get scores() { return this._scores; }
    get gpa10() { return this._gpa10; }

    set code(value: string) { this._code = value; }
    set name(value: string) { this._name = value; }
    set credits(value: number) { this._credits = value; }
    set studyType(value: TStudyType) { this._studyType = value; }
    set weights(value: ISubjectWeights) { this._weights = value; }
    set scores(value: ISubjectGradeComponent) { this._scores = value; }
    set gpa10(value: number | null) { this._gpa10 = value; }

    calculateGPA10(presetId: TPresetId): number | null {
        if (this._studyType === "exempt") {
            return null;
        }

        if (this._weights === null
            || presetId === "custom"
        ) {
            return this._scores.final;
        }

        // Implementation for calculating GPA10 would go here
        if (!this.isWeightValid) return null;

        const { _scores, _weights } = this;

        const parts: { score: number | null; weight: number | null }[] = [
            { score: _scores.process, weight: _weights.process },
            { score: _scores.midterm, weight: _weights.midterm },
            { score: _scores.practice, weight: _weights.practice },
            { score: _scores.final, weight: _weights.final },
        ];

        for (const p of parts) {
            // Ép kiểu rõ ràng: Phải là number và lớn hơn 0
            const hasWeight = typeof p.weight === "number" && p.weight > 0;

            // Nếu cột đó CÓ TRỌNG SỐ nhưng điểm lại bị TRỐNG (null/NaN) -> Môn này chưa học xong
            if (hasWeight && (p.score === null || isNaN(p.score))) {
                return null;
            }
        }

        let rawSum = 0;
        let divider = 0;

        for (const p of parts) {
            const hasWeight = typeof p.weight === "number" && p.weight > 0;

            if (hasWeight) {
                rawSum += (p.score ?? 0) * p.weight!;
                divider += p.weight!;
            }
        }

        const rawFinalScore = rawSum / divider;

        if (presetId === "uit") {
            this._gpa10 = Math.round(rawFinalScore * 10) / 10;
        } else {
            this._gpa10 = Math.round(rawFinalScore * 100) / 100; // Custom mặc định lấy 2 chữ số
        }

        return this._gpa10;
    }

    public get canonicalCode(): string {
        return this._code.trim().toUpperCase() || this._id;
    }

    /**
     * Hàm tiện ích thuần túy: Chuyển đổi một con số hệ 10 bất kỳ sang hệ 4 dựa trên bảng quy đổi
     */
    convertGPA10ToGPA4(
        gpa10: number,
        letterGrades: ILetterGradeRange[]
    ): number {
        // Tìm khoảng điểm thỏa mãn: min <= gpa10 <= max
        const matchedRange = letterGrades.find((r) => gpa10 >= r.min && gpa10 < (r.max === 10 ? 10.01 : r.max)); // Để đảm bảo điểm tuyệt đối 10.0 vẫn được tính là A+ (hoặc tương đương)

        // Nếu không tìm thấy khoảng nào (lỗi cấu hình bảng điểm), mặc định trả về 0.0
        return matchedRange?.gpa4 ?? 0.0;
    }

    /**
     * Tiện ích quy đổi từ hệ 10 sang hệ 100 (Ví dụ: 8.5 -> 85)
     */
    convertGPA10ToGPA100(gpa10: number): number {
        return Math.round(gpa10 * 10);
    }

    /**
     * Tiện ích tra bảng quy đổi từ hệ 10 sang Điểm chữ (A+, B, C...)
     */
    convertGPA10ToLetter(
        gpa10: number,
        letterGrades: ILetterGradeRange[]
    ): string {
        // Tìm khoảng điểm thỏa mãn: min <= gpa10 < max
        const matchedRange = letterGrades.find((r) => gpa10 >= r.min && gpa10 < (r.max === 10 ? 10.01 : r.max)); // Để đảm bảo điểm tuyệt đối 10.0 vẫn được tính là A+ (hoặc tương đương)

        // Nếu không tìm thấy khoảng nào, trả về ký tự rỗng "—"
        return matchedRange?.letter ?? "—";
    }

    /**
     * Getter/Method của Instance: Lấy thẳng điểm hệ 4 của chính môn học này
     */
    getGPA4(letterGrades: ILetterGradeRange[]): number | null {
        // Nếu môn học chưa được tính điểm hệ 10 (hoặc là môn Miễn học) -> Trả về null ngay
        if (this._gpa10 === null) {
            return null;
        }

        // Gọi hàm tiện ích ở trên để quy đổi con điểm của chính mình
        return this.convertGPA10ToGPA4(this._gpa10, letterGrades);
    }

    /**
     * 
     * Getter/Method của Instance: Lấy thẳng điểm hệ 100 của chính môn học này
     */
    getGPA100(): number | null {
        if (this._gpa10 === null) {
            return null;
        }

        return this.convertGPA10ToGPA100(this._gpa10);
    }

    /**
     * Getter của Instance: Lấy điểm chữ trực tiếp của chính môn học này
     */
    getLetterGrade(
        letterGrades: ILetterGradeRange[]
    ): string {
        if (this._gpa10 === null) return "—";

        return this.convertGPA10ToLetter(this._gpa10, letterGrades);
    }

    getSubjectMetrics(letterGrades: ILetterGradeRange[], presetId: TPresetId) {
        const sc10 = this.calculateGPA10(presetId);
        if (sc10 === null || this.credits <= 0 || this.studyType === "exempt") {
            return null;
        }

        return {
            weighted10: sc10 * this.credits,
            weighted4: this.convertGPA10ToGPA4(sc10, letterGrades) * this.credits,
            weighted100: this.convertGPA10ToGPA100(sc10) * this.credits,
            credits: this.credits
        };
    }

    /**
     * Kiểm tra xem môn học này có bị liệt do điểm thành phần hay không
     * @description
     * - Nếu môn học này có trọng số thành phần (weights) và điểm thành phần (scores) của môn học này có bất kỳ cột nào bị liệt (dưới threshold hoặc null) -> Trả về true
     * 
     * @param componentThresholdEnabled - Bật/Tắt tính năng xét điểm liệt thành phần
     * @param componentThresholdScore - Điểm liệt thành phần (Ví dụ: 3.0 hoặc 4.0)
     * @param scoreInputMode 
     * @returns 
     */
    hasComponentFail(
        componentThresholdEnabled: boolean,
        componentThresholdScore: number,
        scoreInputMode: TScoreInputMode = "full",
    ): boolean {
        // Skip component check in gpaOnly mode
        if (scoreInputMode === "gpaOnly" || !componentThresholdEnabled) return false;

        if (this._weights === null) {
            return false;
        }

        const componentPairs: { score: number | null; weight: number | null }[] = [
            { score: this._scores.process, weight: this._weights.process },
            { score: this._scores.midterm, weight: this._weights.midterm },
            { score: this._scores.practice, weight: this._weights.practice },
            { score: this._scores.final, weight: this._weights.final },
        ];

        for (const pair of componentPairs) {
            const w = pair.weight ?? 0;
            const s = pair.score;

            // Nếu cột này CÓ TRỌNG SỐ (bắt buộc phải tham gia vào tổng điểm)
            if (w > 0) {
                // Case 1: Chưa nhập điểm/Bỏ thi (null) -> Tính là LIỆT/HỦY KẾT QUẢ luôn
                if (s === null || isNaN(s)) {
                    return true;
                }
                // Case 2: Điểm số thực tế thấp hơn mức điểm liệt quy định (threshold) -> LIỆT
                if (s < componentThresholdScore) {
                    return true;
                }
            }
        }

        // Không dính bất kỳ cột liệt nào
        return false;
    }

    isPassed(
        options: {
            subjectPassThreshold: number,
            componentThresholdEnabled: boolean,
            componentPassThreshold: number,
            scoreInputMode: TScoreInputMode,
            presetId: TPresetId,
        } = {
                subjectPassThreshold: DEFAULT_STATE.subjectPassThreshold,
                componentThresholdEnabled: DEFAULT_STATE.componentThresholdEnabled,
                componentPassThreshold: DEFAULT_STATE.componentPassThreshold,
                scoreInputMode: DEFAULT_STATE.scoreInputMode,
                presetId: DEFAULT_STATE.presetId,
            }
    ): boolean | null {
        if (this._studyType === "exempt") return true;

        const grade = options.scoreInputMode === "gpaOnly" ? this._gpa10 : this.calculateGPA10(options.presetId);

        if (grade === null) return null;

        if (this.hasComponentFail(options.componentThresholdEnabled, options.componentPassThreshold, options.scoreInputMode)) return false;

        return grade >= options.subjectPassThreshold;
    }

    get isWeightValid(): boolean {
        return this.weightTotal === 100;
    }

    /**
     * 📊 Tính tổng trọng số hiện tại của môn học (Thang 100)
     */
    get weightTotal(): number {
        if (!this._weights) return 0;

        const parts = [
            this._weights.process,
            this._weights.midterm,
            this._weights.practice,
            this._weights.final,
        ].filter((w) => typeof w === "number" && w > 0) as number[];

        return parts.reduce((sum, w) => {
            return sum + w;
        }, 0);
    }

    toJSON() {
        return {
            id: this._id,
            code: this._code,
            name: this._name,
            credits: this._credits,
            studyType: this._studyType,
            weights: this._weights,
            scores: this._scores,
            gpa10: this._gpa10,
        };
    }
}