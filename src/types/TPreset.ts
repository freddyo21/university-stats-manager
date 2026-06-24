import type { TAppState } from "./TAppState";
import type { TPresetId } from "./types";

export type TPreset = {
    id: TPresetId;
    label: string;
    description: string;
    apply: (s: TAppState) => TAppState;
};