import type { ILetterGradeRange } from "@/types/interfaces/ILetterGradeRange";
import schoolStandardScales from "../../data/school-standard-scales.json" with { type: "json" };
import type { IAppState } from "@/types/interfaces/IAppState";
import type { IPreset } from "@/types/interfaces/IPreset";
import type { TPresetId } from "@/types/types";
import { DEFAULT_LETTER_GRADES } from "@/utils/constants";

// Định nghĩa Data Config thuần cho từng trường
const PRESET_CONFIGS: Record<Exclude<TPresetId, "custom">, Partial<IAppState>> = {
  uit: {
    activeScale: "10",
    letterGrades: schoolStandardScales.uit as ILetterGradeRange[],
    subjectPassThreshold: 5.0,
    componentPassEnabled: false,
    componentPassThreshold: 3.0,
    eligibleForScholarshipGPA: 8.0,
  },
  hust: {
    activeScale: "4",
    letterGrades: schoolStandardScales.hust as ILetterGradeRange[],
    subjectPassThreshold: 4.0,
    componentPassEnabled: true,
    componentPassThreshold: 3.0,
    eligibleForScholarshipGPA: 3.2,
  },
};

// Map dữ liệu để tự động sinh ra object PRESETS hoàn chỉnh
export const PRESETS: Record<TPresetId, IPreset> = {
  uit: {
    id: "uit",
    label: "UIT (HCMC)",
    description: "Scale 10, passing 5.0. Failing threshold off by default.",
    apply: (s) => ({ ...s, ...PRESET_CONFIGS.uit, presetId: "uit" }),
  },
  hust: {
    id: "hust",
    label: "HUST (Hanoi)",
    description: "Scale 10, passing 4.0. Failing threshold at 3.0.",
    apply: (s) => ({ ...s, ...PRESET_CONFIGS.hust, presetId: "hust" }),
  },
  custom: {
    id: "custom",
    label: "Custom",
    description: "Free-form configuration.",
    apply: (s) => ({ ...s, presetId: "custom" }),
  },
};

export function listPresets() {
  return Object.values(PRESETS);
}

export function applyPreset(state: IAppState, id: TPresetId): IAppState {
  console.log(PRESETS[id]);
  return PRESETS[id].apply(state);
}

export { DEFAULT_LETTER_GRADES };
