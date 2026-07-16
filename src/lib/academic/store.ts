import { Semester } from "@/entities/Semester";
import { Subject } from "@/entities/Subject";
import type { IAppState } from "@/types/interfaces/IAppState";
import type { IExtensionSemester } from "@/types/interfaces/IExtensionSemester";
import type { ISemester } from "@/types/interfaces/ISemester";
import type { ISubject } from "@/types/interfaces/ISubject";
import { DEFAULT_STATE } from "@/utils/constants";
import { uuidv7 } from "@/utils/uuid";

export const STORAGE_KEY = "academic-hub-v1";

const VALID_SCALES = ["10", "4", "100"] as const;
type Scale = (typeof VALID_SCALES)[number];

function isValidScale(v: unknown): v is Scale {
  return typeof v === "string" && (VALID_SCALES as readonly string[]).includes(v);
}

const VALID_RETAKE_STRATEGIES = ["highest", "latest", "average"] as const;
type RetakeStrategy = (typeof VALID_RETAKE_STRATEGIES)[number];

function isValidRetakeStrategy(v: unknown): v is RetakeStrategy {
  return typeof v === "string" && (VALID_RETAKE_STRATEGIES as readonly string[]).includes(v as RetakeStrategy);
}

function normalizeSubject(subject: Partial<ISubject> | Subject): Subject {
  return subject instanceof Subject
    ? subject
    : new Subject({
      id: subject.id,
      code: subject.code,
      name: subject.name,
      credits: subject.credits,
      weights: subject.weights,
      scores: subject.scores,
      studyType: subject.studyType,
      gpa10: subject.gpa10
    });
}

function normalizeSemester(semester: Partial<ISemester> | Semester, index: number): Semester {
  return semester instanceof Semester
    ? semester
    : new Semester({
      id: semester.id,
      // name: semester.name,
      currentLength: index,
      semesterNumber: typeof semester.semesterNumber === "number" ? semester.semesterNumber : 0,
      targetGPA: typeof semester.targetGPA === "number" ? semester.targetGPA : DEFAULT_STATE.targetGPA,
      semesterId: semester.semesterId,
      subjects: (semester.subjects ?? []).map((subject) => normalizeSubject(subject)),
    });
}

export function normalizeAcademicState(state: IAppState): IAppState {
  return {
    ...state,
    semesters: (state.semesters ?? []).map((semester, index) => normalizeSemester(semester, index)),
  };
}

function migrate(parsed: unknown): IAppState {
  const next: IAppState = { ...DEFAULT_STATE, ...(parsed as Partial<IAppState>) };

  if (next.precisionMode !== 1 && next.precisionMode !== 2) {
    next.precisionMode = DEFAULT_STATE.precisionMode;
  }

  const legacyScale = (parsed as { gradingScale?: unknown })?.gradingScale;
  if (!isValidScale(next.activeScale)) {
    next.activeScale = isValidScale(legacyScale) ? legacyScale : null;
  }

  if (!isValidRetakeStrategy(next.retakeStrategy)) {
    next.retakeStrategy = DEFAULT_STATE.retakeStrategy;
  }

  return normalizeAcademicState(next);
}

export interface LoadResult {
  state: IAppState;
  // migratedFromLegacy?: boolean;
}

export function loadAcademicState(): LoadResult {
  if (typeof window === "undefined") {
    return { state: DEFAULT_STATE };
  }

  try {
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    if (!currentRaw) {
      return { state: DEFAULT_STATE };
    }

    const parsed = JSON.parse(currentRaw);
    return {
      state: migrate(parsed),
      // migratedFromLegacy: (parsed as { gradingScale?: unknown })?.gradingScale !== undefined,
    };
  } catch (err) {
    console.error("[academic-hub] Failed to load/migrate stored state:", err);
    return { state: DEFAULT_STATE };
  }
}

export function persistAcademicState(state: IAppState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("[academic-hub] Failed to persist state:", err);
  }
}

export function clearAcademicState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("[academic-hub] Failed to clear state:", err);
  }
}

/**
 * 🔄 Trộn (Merge) dữ liệu cào từ Extension trường vào Local State hiện tại
 */
export function mergeAcademicStateFromExtension(currentState: IAppState, data: IExtensionSemester[]) {
  const normalizedCurrentState = normalizeAcademicState(currentState);

  // 🚀 BƯỚC 1: Clone an toàn và đúc lại toàn bộ Instance Class để bảo toàn method toán học
  const updatedSemesters: Semester[] = normalizedCurrentState.semesters.map((sem) => {
    return new Semester({
      id: sem.id,
      // name: sem.name,
      semesterNumber: sem.semesterNumber,
      targetGPA: sem.targetGPA,
      semesterId: sem.semesterId,
      subjects: sem.subjects
    });
  });

  data.forEach((extSem) => {
    const targetSemesterId = extSem.semesterId?.trim() || "";

    // 🔥 SỬA BẪY CHÍ MẠNG: Phải đối chiếu bằng thuộc tính chuẩn semesterId của trường, không so với .name
    let targetIdx = updatedSemesters.findIndex((s) => s.semesterId === targetSemesterId);
    let localSem = targetIdx !== -1 ? updatedSemesters[targetIdx] : null;

    // Tạo danh sách môn trộn mới tinh
    let finalSubjectsList: Subject[] = [];

    if (!localSem) {
      // Kịch bản A: Chưa có học kỳ này -> Tạo mới Instance Class Semester
      localSem = new Semester({
        id: uuidv7(),
        // name: `Học kỳ ${extSem.semester}`,
        semesterNumber: extSem.semester,
        targetGPA: normalizedCurrentState.targetGPA ?? 8,
        semesterId: targetSemesterId,
        subjects: []
      });
      updatedSemesters.push(localSem);
      targetIdx = updatedSemesters.length - 1;
    }

    // Bản đồ tra cứu nhanh môn học local dựa trên canonicalCode
    const localSubjectMap = new Map<string, Subject>();
    localSem.subjects.forEach((sub) => {
      localSubjectMap.set(sub.canonicalCode, sub);
    });

    // Trộn từng môn cào được từ Extension
    const mergedSubjects: Subject[] = extSem.subjects.map((extSub) => {
      const extCanonicalCode = extSub.code.trim().toUpperCase();
      const existingSub = localSubjectMap.get(extCanonicalCode);

      if (existingSub) {
        // Kịch bản B.1: Môn đã có -> Bảo lưu ID cục bộ của Web App, đè điểm số mới lên
        return new Subject({
          id: existingSub.id,
          code: extSub.code ?? existingSub.code,
          name: extSub.name ?? existingSub.name,
          credits: extSub.credits ?? existingSub.credits,
          weights: {
            process: extSub.weights?.process ?? existingSub.weights?.process ?? null,
            midterm: extSub.weights?.midterm ?? existingSub.weights?.midterm ?? null,
            practice: extSub.weights?.practice ?? existingSub.weights?.practice ?? null,
            final: extSub.weights?.final ?? existingSub.weights?.final ?? null,
          },
          scores: {
            process: extSub.scores?.process ?? existingSub.scores?.process ?? null,
            midterm: extSub.scores?.midterm ?? existingSub.scores?.midterm ?? null,
            practice: extSub.scores?.practice ?? existingSub.scores?.practice ?? null,
            final: extSub.scores?.final ?? existingSub.scores?.final ?? null,
          },
          studyType: extSub.studyType ?? existingSub.studyType,
          gpa10: extSub.gpa10 ?? existingSub.gpa10,
        });
      } else {
        // Kịch bản B.2: Môn mới hoàn toàn -> Cấp UUIDv7 và bọc Class
        return new Subject({
          id: uuidv7(),
          code: extSub.code ?? "",
          name: extSub.name ?? "",
          credits: extSub.credits ?? 0,
          weights: extSub.weights ?? null,
          scores: extSub.scores ?? { process: null, midterm: null, practice: null, final: null },
          studyType: extSub.studyType ?? "normal",
          gpa10: extSub.gpa10 ?? null,
        });
      }
    });

    // 🚀 BƯỚC BÙ MÔN TỰ THÊM TAY: Giữ lại những môn sinh viên tự tạo trên UI mà Extension không quét thấy
    const extSubCodes = new Set(extSem.subjects.map((s) => s.code.trim().toUpperCase()));
    const customSubjects = localSem.subjects.filter((sub) => !extSubCodes.has(sub.canonicalCode));

    finalSubjectsList = [...mergedSubjects, ...customSubjects];

    // 🚀 BƯỚC ĐÈ INSTANCE: Ghi đè thực thể học kỳ đã được trộn trọn vẹn danh sách môn vào mảng tổng
    updatedSemesters[targetIdx] = new Semester({
      id: localSem.id,
      // name: localSem.name,
      semesterNumber: extSem.semester ?? localSem.semesterNumber, // Đồng bộ/Backfill số học kỳ
      targetGPA: localSem.targetGPA,
      semesterId: localSem.semesterId,
      subjects: finalSubjectsList
    });
  });

  // Sắp xếp các học kỳ tịnh tiến tăng dần dựa trên mã học kỳ của trường (Ví dụ: 20241, 20242...)
  const finalSemesters = updatedSemesters.sort((a, b) => {
    return Number(a.semesterId || 0) - Number(b.semesterId || 0);
  });

  return normalizeAcademicState({
    ...normalizedCurrentState,
    semesters: finalSemesters
  });
}