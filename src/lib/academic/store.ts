import type { TAppState } from "@/types/TAppState";
import type { TSemester } from "@/types/TSemester";
import type { TSubject } from "@/types/TSubject";
import { DEFAULT_STATE } from "@/utils/constants";

export const STORAGE_KEY = "academic-hub-v2";
export const LEGACY_STORAGE_KEY = "academic-hub-v1";

const VALID_SCALES = ["10", "4", "100"] as const;
type Scale = (typeof VALID_SCALES)[number];
function isValidScale(v: unknown): v is Scale {
  return typeof v === "string" && (VALID_SCALES as readonly string[]).includes(v);
}

function migrate(parsed: unknown): TAppState {
  // shallow merge; nested defaults handled explicitly below
  const next: TAppState = { ...DEFAULT_STATE, ...(parsed as Partial<TAppState>) };

  if (next.precisionMode !== 1 && next.precisionMode !== 2) {
    next.precisionMode = DEFAULT_STATE.precisionMode;
  }

  // legacy field "gradingScale" -> "activeScale"; validate dù giá trị đã có sẵn
  const legacyScale = (parsed as { gradingScale?: unknown })?.gradingScale;
  if (!isValidScale(next.activeScale)) {
    next.activeScale = isValidScale(legacyScale) ? legacyScale : null;
  }

  // migrate: ensure subject.code & semester.targetGPA exist
  next.semesters = (next.semesters ?? []).map((sem: TSemester) => ({
    id: sem.id,
    name: sem.name,
    targetGPA: typeof sem.targetGPA === "number" ? sem.targetGPA : DEFAULT_STATE.targetGPA,
    subjects: (sem.subjects ?? []).map((sub: TSubject) => ({
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
  state: TAppState;
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

export function persistAcademicState(state: TAppState) {
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