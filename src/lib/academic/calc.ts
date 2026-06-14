import type { LetterGradeRange, PrecisionMode, Semester, Subject, Weights } from "./types";

/** Component scores are entered at 1 decimal place by instructors. */
const SUBJECT_COMPONENT_PRECISION = 1;

export function roundToPrecision(value: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

export function roundGpa(value: number, precisionMode: PrecisionMode): number {
  return roundToPrecision(value, precisionMode);
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function weightTotal(w: Weights) {
  return w.process + w.midterm + w.practice + w.final;
}

export function subjectScore10(subject: Subject, precision: PrecisionMode = 2): number | null {
  const { weights, scores } = subject;

  const total = weightTotal(weights);
  if (total === 0) return null;

  const parts: { score: number | null; weight: number }[] = [
    { score: scores.process, weight: weights.process },
    { score: scores.midterm, weight: weights.midterm },
    { score: scores.practice, weight: weights.practice },
    { score: scores.final, weight: weights.final },
  ];

  for (const p of parts) {
    if (p.weight > 0 && (p.score === null || isNaN(p.score))) return null;
  }

  let sum = 0;
  for (const p of parts) {
    if (p.weight > 0) {
      const roundedComponent = roundToPrecision(p.score ?? 0, SUBJECT_COMPONENT_PRECISION);
      sum += roundedComponent * p.weight;
    }
  }

  const rawScore = sum / total;
  const factor = Math.pow(10, precision);
  return Math.round(rawScore * factor) / factor;
}

export function hasComponentFail(subject: Subject, enabled: boolean, threshold: number): boolean {
  if (!enabled) return false;
  const keys: (keyof Subject["weights"])[] = ["process", "midterm", "practice", "final"];
  for (const k of keys) {
    if (subject.weights[k] > 0) {
      const s = subject.scores[k];
      if (s !== null && s < threshold) return true;
    }
  }
  return false;
}

export function subjectPassed(
  subject: Subject,
  subjectPass: number,
  compEnabled: boolean,
  compThreshold: number,
  precision: PrecisionMode = 2,
): boolean | null {
  if (subject.isExempt) return true;

  const sc = subjectScore10(subject, precision);

  if (sc === null) return null;

  if (hasComponentFail(subject, compEnabled, compThreshold)) return false;

  return sc >= subjectPass;
}

export function effectiveScore10(
  subject: Subject,
  // subjectPass: number,
  compEnabled: boolean,
  compThreshold: number,
  precision: PrecisionMode = 2,
): number | null {
  const sc = subjectScore10(subject, precision);

  if (sc === null) return null;

  if (hasComponentFail(subject, compEnabled, compThreshold)) return 0;

  // if (sc < subjectPass) return 0;

  return sc;
}

export function gpa4FromScore10(score10: number, letterGrades: LetterGradeRange[]): number {
  const matchedRange = letterGrades.find((r) => score10 >= r.min && score10 < r.max);
  return matchedRange ? matchedRange.gpa4 : 0.0;
}

export function to100(score10: number) {
  return Math.round(score10 * 10);
}

export function toLetter(score10: number, ranges: LetterGradeRange[]): string {
  for (const r of ranges) {
    if (score10 >= r.min && score10 < r.max) return r.letter;
  }
  return "—";
}

export function semesterGPA10(
  s: Semester,
  subjectPass: number,
  compEnabled: boolean,
  compThreshold: number,
  precisionMode: PrecisionMode = 2,
): {
  gpa10: number | null;
  credits: number;
  passedCredits: number;
  exemptCredits: number;
} {
  let totalCredits = 0;
  let passedCredits = 0;
  let exemptCredits = 0;
  let weighted = 0;
  let any = false;

  for (const sub of s.subjects) {
    const sc = effectiveScore10(sub, compEnabled, compThreshold, precisionMode);
    const passed = subjectPassed(sub, subjectPass, compEnabled, compThreshold, precisionMode);

    if ((sc === null && !sub.isExempt) || sub.credits <= 0) continue;

    if (sc === null && sub.isExempt) {
      exemptCredits += sub.credits;
      continue;
    }

    if (sc !== null) {
      any = true;
      weighted += sc * sub.credits;
      totalCredits += sub.credits;
    }

    if (passed) {
      passedCredits += sub.credits;
    }
  }

  return {
    gpa10: any && totalCredits > 0 ? roundGpa(weighted / totalCredits, precisionMode) : null,
    credits: totalCredits + exemptCredits,
    passedCredits,
    exemptCredits,
  };
}

export function semesterGPA4(
  s: Semester,
  letterGrades: LetterGradeRange[],
  subjectPass: number,
  compEnabled: boolean,
  compThreshold: number,
  precisionMode: PrecisionMode = 2,
): {
  gpa4: number | null;
  credits: number;
  passedCredits: number;
  exemptCredits: number;
} {
  let totalCredits = 0;
  let passedCredits = 0;
  let exemptCredits = 0;
  let weighted = 0;
  let any = false;

  for (const sub of s.subjects) {
    const sc = effectiveScore10(sub, compEnabled, compThreshold, precisionMode);
    const passed = subjectPassed(sub, subjectPass, compEnabled, compThreshold, precisionMode);

    if ((sc === null && !sub.isExempt) || sub.credits <= 0) continue;

    if (sc === null && sub.isExempt) {
      exemptCredits += sub.credits;
      continue;
    }

    if (sc !== null) {
      any = true;
      weighted += gpa4FromScore10(sc, letterGrades) * sub.credits;
      totalCredits += sub.credits;
    }

    if (passed) {
      passedCredits += sub.credits;
    }
  }

  return {
    gpa4: any && totalCredits > 0 ? roundGpa(weighted / totalCredits, precisionMode) : null,
    credits: totalCredits + exemptCredits,
    passedCredits,
    exemptCredits,
  };
}

export function cumulativeGPA4(
  semesters: Semester[],
  letterGrades: LetterGradeRange[],
  subjectPass: number,
  compEnabled: boolean,
  compThreshold: number,
  precisionMode: PrecisionMode = 2,
): {
  gpa4: number | null;
  credits: number;
  passedCredits: number;
  exemptCredits: number;
} {
  let passedCredits = 0;   // Tín chỉ của các môn ĐÃ ĐẠT và CÓ ĐIỂM (Dùng làm mẫu số tính GPA)
  let exemptCredits = 0;   // Tín chỉ của các môn ĐẠT dưới dạng MIỄN ĐIỂM
  let weighted = 0;
  let any = false;

  for (const s of semesters) {
    for (const sub of s.subjects) {
      if (sub.credits <= 0) continue;

      // Trường hợp 1: Môn miễn điểm (Không tính vào điểm hệ 4 nhưng tính vào tổng số tín tích lũy)
      if (sub.isExempt) {
        exemptCredits += sub.credits;
        continue;
      }

      const sc = effectiveScore10(sub, compEnabled, compThreshold, precisionMode);
      const passed = subjectPassed(sub, subjectPass, compEnabled, compThreshold, precisionMode);

      // Trường hợp 2: Môn bị trượt hoặc chưa có điểm -> Bỏ qua hoàn toàn khỏi CPA tích lũy
      if (sc === null || passed !== true) continue;

      // Trường hợp 3: Môn có điểm và đã đạt chuẩn (Pass)
      any = true;
      weighted += gpa4FromScore10(sc, letterGrades) * sub.credits;
      passedCredits += sub.credits; // Mẫu số tích lũy chỉ tăng khi môn đó thực sự ĐẬU
    }
  }

  const res = {
    // Điểm tích lũy hệ 4 chỉ chia cho tổng số tín chỉ của các môn đã đạt có điểm thực tế
    gpa4: any && passedCredits > 0 ? roundGpa(weighted / passedCredits, precisionMode) : null,
    // Tổng số tín chỉ tích lũy hiển thị = Tín chỉ môn có điểm đạt + Tín chỉ môn miễn
    credits: passedCredits + exemptCredits,
    passedCredits,
    exemptCredits,
  };

  console.log(res);

  return res;
}

export function cumulativeGPA10(
  semesters: Semester[],
  subjectPass: number,
  compEnabled: boolean,
  compThreshold: number,
  precisionMode: PrecisionMode = 2,
): {
  gpa10: number | null;
  credits: number;
  passedCredits: number;
  exemptCredits: number;
} {
  let passedCredits = 0;   // Tín chỉ của các môn ĐÃ ĐẠT và CÓ ĐIỂM (Dùng làm mẫu số tính GPA)
  let exemptCredits = 0;   // Tín chỉ của các môn ĐẠT dưới dạng MIỄN ĐIỂM
  let weighted = 0;
  let any = false;

  for (const s of semesters) {
    for (const sub of s.subjects) {
      if (sub.credits <= 0) continue;

      // Trường hợp 1: Môn miễn điểm (Không tính vào điểm hệ 4 nhưng tính vào tổng số tín tích lũy)
      if (sub.isExempt) {
        exemptCredits += sub.credits;
        continue;
      }

      const sc = effectiveScore10(sub, compEnabled, compThreshold, precisionMode);
      const passed = subjectPassed(sub, subjectPass, compEnabled, compThreshold, precisionMode);

      // Trường hợp 2: Môn bị trượt hoặc chưa có điểm -> Bỏ qua hoàn toàn khỏi CPA tích lũy
      if (sc === null || passed !== true) continue;

      // Trường hợp 3: Môn có điểm và đã đạt chuẩn (Pass)
      any = true;
      weighted += sc * sub.credits;
      passedCredits += sub.credits; // Mẫu số tích lũy chỉ tăng khi môn đó thực sự ĐẬU
    }
  }

  const res = {
    gpa10: any && passedCredits > 0 ? roundGpa(weighted / passedCredits, precisionMode) : null,
    credits: passedCredits + exemptCredits,
    passedCredits,
    exemptCredits,
  };

  return res;
}

export function passedCredits(
  semesters: Semester[],
  subjectPass: number,
  compEnabled: boolean,
  compThreshold: number,
  precision: PrecisionMode = 2,
): number {
  let credits = 0;
  for (const s of semesters) {
    for (const sub of s.subjects) {
      if (subjectPassed(sub, subjectPass, compEnabled, compThreshold, precision) === true) {
        credits += sub.credits;
      }
    }
  }
  return credits;
}

export type Advisory = {
  label: { en: string; vi: string };
  tone: "success" | "primary" | "warning" | "destructive";
  advice: { en: string; vi: string };
};

export function classify(gpa: number | null): Advisory {
  if (gpa === null)
    return {
      label: { en: "—", vi: "—" },
      tone: "primary",
      advice: { en: "Enter grades to see your classification.", vi: "Nhập điểm để xem xếp loại." },
    };
  if (gpa >= 8.5)
    return {
      label: { en: "Excellent — Scholarship", vi: "Xuất sắc — Học bổng" },
      tone: "success",
      advice: { en: "Outstanding performance. Maintain momentum to keep scholarships.", vi: "Thành tích xuất sắc. Giữ phong độ để duy trì học bổng." },
    };
  if (gpa >= 7.0)
    return {
      label: { en: "Good / Fair — Acceptable", vi: "Khá / Trung bình — Tạm được" },
      tone: "warning",
      advice: { en: "Solid baseline. Push a few subjects to unlock scholarship range.", vi: "Nền tảng ổn. Nên cố gắng học cải thiện thêm vài môn điểm thấp để lên ngưỡng học bổng." },
    };
  if (gpa >= 5.0)
    return {
      label: { en: "Academic Alert — Need Improvement", vi: "Cảnh báo — Cần cải thiện" },
      tone: "warning",
      advice: { en: "Plan retakes for weak subjects and raise your component scores.", vi: "Lên kế hoạch học cải thiện cho các môn yếu." },
    };
  return {
    label: { en: "Critical Fail — Re-take required", vi: "Nguy hiểm — Phải học lại" },
    tone: "destructive",
    advice: { en: "Prioritize retakes immediately; reduce course load if possible.", vi: "Ưu tiên học lại ngay; cân nhắc giảm khối lượng môn." },
  };
}
