import type { IAppState } from "./IAppState";
import type { TPresetId } from "../types";

export interface IPreset {
    id: TPresetId;
    label: string;
    description: string;
    apply: (s: IAppState) => IAppState;
};