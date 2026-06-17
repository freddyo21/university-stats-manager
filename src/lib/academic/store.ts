import { useCallback, useEffect, useState } from "react";
import { type AppState, DEFAULT_STATE, type Semester, type Subject } from "../../types/types";

const KEY = "academic-hub-v2";
const LEGACY_KEY = "academic-hub-v1";

function load(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // shallow merge; nested defaults handled by callers
    const next: AppState = { ...DEFAULT_STATE, ...parsed };

    if (next.precisionMode !== 1 && next.precisionMode !== 2) {
      next.precisionMode = DEFAULT_STATE.precisionMode;
    }
    
    const legacyScale = (parsed as { gradingScale?: string }).gradingScale;
    
    if (next.activeScale === undefined || next.activeScale === null) {
      next.activeScale =
        legacyScale === "10" || legacyScale === "4" || legacyScale === "100"
          ? legacyScale
          : null;
    }
    // migrate: ensure subject.code & semester.targetGPA exist
    next.semesters = (next.semesters ?? []).map((sem: Semester) => ({
      id: sem.id,
      name: sem.name,
      targetGPA: typeof sem.targetGPA === "number" ? sem.targetGPA : DEFAULT_STATE.targetGPA,
      subjects: (sem.subjects ?? []).map((sub: Subject) => ({
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
  } catch {
    return DEFAULT_STATE;
  }
}

let memory: AppState = DEFAULT_STATE;
let hydrated = false;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function useAcademicStore() {
  const [, setTick] = useState(0);
  const [state, setState] = useState<AppState>(memory);

  useEffect(() => {
    if (!hydrated) {
      memory = load();
      hydrated = true;
      emit();
    }
    const listener = () => {
      setState(memory);
      setTick((t) => t + 1);
    };

    listeners.add(listener);
    listener();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const update = useCallback((updater: (s: AppState) => AppState) => {
    memory = updater(memory);

    try {
      localStorage.setItem(KEY, JSON.stringify(memory));
    } catch { }

    emit();
  }, []);

  const replace = useCallback((next: AppState) => {
    memory = next;

    try {
      localStorage.setItem(KEY, JSON.stringify(memory));
    } catch { }

    emit();
  }, []);

  const reset = useCallback(() => {
    memory = DEFAULT_STATE;

    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(LEGACY_KEY);

    } catch { }

    emit();
  }, []);

  return { state, update, replace, reset, hydrated };
}
