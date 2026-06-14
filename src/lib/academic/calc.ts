import type { LetterGradeRange, Semester, Subject, Weights } from "./types";

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function weightTotal(w: Weights) {
  return w.process + w.midterm + w.practice + w.final;
}

export function subjectScore10(subject: Subject): number | null {
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
    if (p.weight > 0) sum += (p.score ?? 0) * p.weight;
  }

  return Number((sum / total).toFixed(2));
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
): boolean | null {
  if (subject.isExempt) return true;

  const sc = subjectScore10(subject);

  if (sc === null) return null;

  if (hasComponentFail(subject, compEnabled, compThreshold)) return false;

  return sc >= subjectPass;
}

export function effectiveScore10(
  subject: Subject,
  subjectPass: number,
  compEnabled: boolean,
  compThreshold: number,
): number | null {
  const sc = subjectScore10(subject);

  if (sc === null) return null;

  if (hasComponentFail(subject, compEnabled, compThreshold)) return 0;

  if (sc < subjectPass) return 0;

  return sc;
}

export function to4(score10: number): number {
  if (score10 >= 8.5) return 4.0;
  if (score10 >= 8.0) return 3.5;
  if (score10 >= 7.0) return 3.0;
  if (score10 >= 6.5) return 2.5;
  if (score10 >= 5.5) return 2.0;
  if (score10 >= 5.0) return 1.5;
  if (score10 >= 4.0) return 1.0;
  return 0;
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
    const sc = effectiveScore10(sub, subjectPass, compEnabled, compThreshold);
    const passed = subjectPassed(sub, subjectPass, compEnabled, compThreshold);

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

  const res = {
    gpa10: any && passedCredits > 0 ? Number((weighted / passedCredits).toFixed(2)) : null,
    credits: totalCredits + exemptCredits,
    passedCredits,
    exemptCredits
  };

  return res;
}

export function cumulativeGPA10(
  semesters: Semester[],
  subjectPass: number,
  compEnabled: boolean,
  compThreshold: number,
): {
  gpa10: number | null;
  credits: number
} {
  let totalCredits = 0;
  let passedCredits = 0;
  let weighted = 0;

  for (const s of semesters) {
    for (const sub of s.subjects) {
      const sc = effectiveScore10(sub, subjectPass, compEnabled, compThreshold);
      const passed = subjectPassed(sub, subjectPass, compEnabled, compThreshold);

      if (sc === null || sub.credits <= 0) continue;

      weighted += sc * sub.credits;
      totalCredits += sub.credits;

      if (passed) {
        passedCredits += sub.credits;
      }
    }
  }

  const res = {
    gpa10: passedCredits > 0 ? Number((weighted / passedCredits).toFixed(2)) : null,
    credits: totalCredits
  };

  return res;
}

export function passedCredits(
  semesters: Semester[],
  subjectPass: number,
  compEnabled: boolean,
  compThreshold: number,
): number {
  let credits = 0;
  for (const s of semesters) {
    for (const sub of s.subjects) {
      if (subjectPassed(sub, subjectPass, compEnabled, compThreshold) === true) credits += sub.credits;
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
      advice: { en: "Solid baseline. Push a few subjects to unlock scholarship range.", vi: "Nền tảng ổn. Cố vài môn để lên ngưỡng học bổng." },
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
