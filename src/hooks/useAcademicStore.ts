import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
    loadAcademicState,
    persistAcademicState,
    removeLegacyAcademicState,
    clearAcademicState,
} from "../lib/academic/store";
import { DEFAULT_STATE } from "@/utils/constants";
import type { TAppState } from "@/types/TAppState";

// --- module-level store: 1 nguồn sự thật duy nhất, chia sẻ giữa mọi component ---
let memory: TAppState = DEFAULT_STATE; // khớp với server render -> không hydration mismatch
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((l) => l());
}
function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

const getSnapshot = () => memory;
const getServerSnapshot = () => DEFAULT_STATE;
const getHydratedSnapshot = () => hydrated;
const getServerHydratedSnapshot = () => false;

// Chỉ thực sự load 1 lần cho toàn app, bất kể bao nhiêu component gọi hook này
function ensureHydrated() {
    if (hydrated || typeof window === "undefined") return;
    const { state, migratedFromLegacy } = loadAcademicState();
    memory = state;
    hydrated = true;

    if (migratedFromLegacy) {
        persistAcademicState(memory); // hoàn tất migrate: ghi ngay sang key mới
        removeLegacyAcademicState(); // và dọn key cũ luôn, không chờ tới update() đầu tiên
    }
    emit();
}

// Debounce ghi localStorage khi update dồn dập (gõ phím điểm số liên tục...)
// nhưng vẫn flush ngay trước khi tab bị đóng/ẩn để không mất dữ liệu.
let persistTimer: ReturnType<typeof setTimeout> | null = null;
const PERSIST_DEBOUNCE_MS = 200;

function schedulePersist(state: TAppState) {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
        persistTimer = null;
        persistAcademicState(state);
    }, PERSIST_DEBOUNCE_MS);
}

function flushPersist() {
    if (persistTimer) {
        clearTimeout(persistTimer);
        persistTimer = null;
        persistAcademicState(memory);
    }
}

if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", flushPersist);
    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flushPersist();
    });
}

export function useAcademicStore() {
    // Khai báo useSyncExternalStore TRƯỚC useEffect để effect nội bộ của nó
    // (subscribe vào `listeners`) chạy trước effect ensureHydrated bên dưới,
    // đảm bảo emit() trong ensureHydrated không bị "rơi" mất subscriber nào.
    const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const isHydrated = useSyncExternalStore(subscribe, getHydratedSnapshot, getServerHydratedSnapshot);

    useEffect(() => {
        ensureHydrated();
    }, []);

    // ⚠️ `updater` PHẢI trả về object MỚI (immutable update), không mutate `s` trực tiếp.
    const update = useCallback((updater: (s: TAppState) => TAppState) => {
        memory = updater(memory);
        schedulePersist(memory);
        emit();
    }, []);

    const replace = useCallback((next: TAppState) => {
        memory = next;
        schedulePersist(memory);
        emit();
    }, []);

    const reset = useCallback(() => {
        memory = DEFAULT_STATE;
        if (persistTimer) {
            clearTimeout(persistTimer);
            persistTimer = null;
        }
        clearAcademicState();
        emit();
    }, []);

    return { state, update, replace, reset, hydrated: isHydrated };
}