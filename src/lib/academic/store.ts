import type { IAppState } from "@/types/interfaces/IAppState";
import type { IExtensionSemester } from "@/types/interfaces/IExtensionSemester";
import type { ISemester } from "@/types/interfaces/ISemester";
import type { ISubject } from "@/types/interfaces/ISubject";
import { DEFAULT_STATE } from "@/utils/constants";
import { uuidv7 } from "@/utils/uuid";

export const STORAGE_KEY = "academic-hub-v2";
export const LEGACY_STORAGE_KEY = "academic-hub-v1";

const VALID_SCALES = ["10", "4", "100"] as const;
type Scale = (typeof VALID_SCALES)[number];
function isValidScale(v: unknown): v is Scale {
  return typeof v === "string" && (VALID_SCALES as readonly string[]).includes(v);
}

function migrate(parsed: unknown): IAppState {
  // shallow merge; nested defaults handled explicitly below
  const next: IAppState = { ...DEFAULT_STATE, ...(parsed as Partial<IAppState>) };

  if (next.precisionMode !== 1 && next.precisionMode !== 2) {
    next.precisionMode = DEFAULT_STATE.precisionMode;
  }

  // legacy field "gradingScale" -> "activeScale"; validate dù giá trị đã có sẵn
  const legacyScale = (parsed as { gradingScale?: unknown })?.gradingScale;
  if (!isValidScale(next.activeScale)) {
    next.activeScale = isValidScale(legacyScale) ? legacyScale : null;
  }

  // migrate: ensure subject.code & semester.targetGPA exist
  next.semesters = (next.semesters ?? []).map((sem: ISemester) => ({
    id: sem.id,
    name: sem.name,
    semesterNumber: typeof sem.semesterNumber === "number" ? sem.semesterNumber : 0,
    targetGPA: typeof sem.targetGPA === "number" ? sem.targetGPA : DEFAULT_STATE.targetGPA,
    subjects: (sem.subjects ?? []).map((sub: ISubject) => ({
      id: sub.id,
      code: sub.code ?? "",
      name: sub.name ?? "",
      credits: sub.credits ?? 0,
      weights: sub.weights ?? { process: 10, midterm: 20, practice: 20, final: 50 },
      scores: sub.scores ?? { process: null, midterm: null, practice: null, final: null },
      isExempt: sub.isExempt ?? false,
    })),
  }));

  return next;
}

export interface LoadResult {
  state: IAppState;
  /** true nếu dữ liệu được đọc từ key cũ (cần ghi lại sang key mới + xoá key cũ) */
  migratedFromLegacy: boolean;
}

export function loadAcademicState(): LoadResult {
  if (typeof window === "undefined") {
    return { state: DEFAULT_STATE, migratedFromLegacy: false };
  }
  try {
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    const legacyRaw = currentRaw ? null : localStorage.getItem(LEGACY_STORAGE_KEY);
    const raw = currentRaw ?? legacyRaw;
    if (!raw) return { state: DEFAULT_STATE, migratedFromLegacy: false };

    const parsed = JSON.parse(raw);
    return {
      state: migrate(parsed),
      migratedFromLegacy: !currentRaw && !!legacyRaw,
    };
  } catch (err) {
    console.error("[academic-hub] Failed to load/migrate stored state:", err);
    return { state: DEFAULT_STATE, migratedFromLegacy: false };
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

export function removeLegacyAcademicState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.error("[academic-hub] Failed to remove legacy state:", err);
  }
}

export function clearAcademicState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.error("[academic-hub] Failed to clear state:", err);
  }
}

export function mergeAcademicStateFromExtension(data: IExtensionSemester[]) {
  if (typeof window === "undefined") return;

  try {
    const { state: currentState } = loadAcademicState();

    // Sao chép sâu danh sách học kỳ hiện tại để tránh mutate state gốc
    const updatedSemesters = currentState.semesters.map((s) => ({
      ...s,
      id: uuidv7(), // Đảm bảo mỗi học kỳ có id mới để lưu vết thời gian merge, tránh trùng id với học kỳ cũ
      subjects: [...s.subjects], // clone luôn subjects array để tránh mutate ngược
    }));

    data.forEach((extSem) => {
      const semesterTargetString = extSem.semester.toString();

      // 1. Tìm học kỳ cũ dựa trên số học kỳ
      let localSem = updatedSemesters.find((s) => {
        if (s.semesterNumber != null) return s.semesterNumber === extSem.semester;
        const num = s.name.match(/\d+/)?.[0];
        return num === semesterTargetString;
      });

      // Nếu chưa có học kỳ này, tiến hành khởi tạo mới
      if (!localSem) {
        localSem = {
          id: uuidv7(),
          name: `${currentState.language === "vi" ? "Học kỳ" : "Semester"} ${extSem.semester}`,
          semesterNumber: extSem.semester,
          targetGPA: currentState.targetGPA ?? 8,
          subjects: []
        };
        updatedSemesters.push(localSem);
      } else if (localSem.semesterNumber == null) {
        // Backfill cho data cũ chưa có field, để lần sort sau dùng được luôn
        localSem.semesterNumber = extSem.semester;
      }

      // 2. Tạo Map để tra cứu môn học cũ nhanh nhằm tối ưu hiệu năng O(N)
      const localSubjectMap = new Map<string, ISubject>();
      localSem.subjects.forEach((sub) => {
        localSubjectMap.set(sub.code, sub);
      });

      // 3. Tiến hành merge từng môn từ Extension vào
      const mergedSubjects = extSem.subjects.map((extSub) => {
        const existingSub = localSubjectMap.get(extSub.code);

        if (existingSub) {
          // Kịch bản A: Môn đã có sẵn -> Chỉ đè điểm và trọng số, GIỮ NGUYÊN ID cũ của Web App
          return {
            ...existingSub,
            name: extSub.name ?? existingSub.name,
            credits: extSub.credits ?? existingSub.credits,
            weights: {
              process: extSub.weights?.process ?? existingSub.weights?.process,
              midterm: extSub.weights?.midterm ?? existingSub.weights?.midterm,
              practice: extSub.weights?.practice ?? existingSub.weights?.practice,
              final: extSub.weights?.final ?? existingSub.weights?.final,
            },
            scores: {
              process: extSub.scores?.process ?? existingSub.scores?.process,
              midterm: extSub.scores?.midterm ?? existingSub.scores?.midterm,
              practice: extSub.scores?.practice ?? existingSub.scores?.practice,
              final: extSub.scores?.final ?? existingSub.scores?.final,
            },
            isExempt: extSub.isExempt ?? existingSub.isExempt
          };
        } else {
          // Kịch bản B: Môn mới tinh từ hệ thống trường -> Tạo mới và sinh UUID tại đây
          return {
            id: uuidv7(),
            code: extSub.code ?? "",
            name: extSub.name ?? "",
            credits: extSub.credits ?? 0,
            weights: extSub.weights ?? { process: 10, midterm: 20, practice: 20, final: 50 },
            scores: extSub.scores ?? { process: null, midterm: null, practice: null, final: null },
            isExempt: extSub.isExempt ?? false
          };
        }
      });

      // 4. Bổ sung ngược lại những môn tự thêm tay (Môn có trong local nhưng Extension không cào thấy)
      const extSubCodes = new Set(extSem.subjects.map((s) => s.code));
      const customSubjects = localSem.subjects.filter((sub) => !extSubCodes.has(sub.code));

      // Cập nhật lại danh sách môn hoàn chỉnh cho học kỳ này
      localSem.subjects = [...mergedSubjects, ...customSubjects];
    });

    // Sắp xếp lại các học kỳ theo số tăng dần trích xuất từ chuỗi name
    const finalSemesters = updatedSemesters.sort((a, b) => {
      const numA = a.semesterNumber ?? parseInt(a.name.match(/\d+/)?.[0] || "0", 10);
      const numB = b.semesterNumber ?? parseInt(b.name.match(/\d+/)?.[0] || "0", 10);
      return numA - numB;
    });

    const mergedState: IAppState = {
      ...currentState,
      semesters: finalSemesters
    };

    persistAcademicState(mergedState);
    console.log("[academic-hub] Merged and persisted state successfully.");
  } catch (err) {
    console.error("[academic-hub] Failed to merge state from extension:", err);
  }
}