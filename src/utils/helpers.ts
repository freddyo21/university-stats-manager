import type { TranslationKey } from "@/i18n/i18n-types";
import type { TGradingScale, TPresetId } from "@/types/types";

export const clampNum = (v: string, min: number, max: number) => {
    const n = Number(v);
    if (isNaN(n)) return min;
    return Math.min(max, Math.max(min, n));
};

export const getScaleSuffix = (scale: TGradingScale, t: (key: TranslationKey) => string): string => {
    if (scale === "4") return t("scale.gpa4");
    if (scale === "100") return t("scale.gpa100");
    return t("scale.gpa10");
};

export const isPresetId = (value: any): value is TPresetId => {
    return ["uit", "custom"].includes(value);
};

export const roundToPrecision = (value: number, precision: number): number => {
    const factor = Math.pow(10, precision);
    return Math.round((value + Number.EPSILON) * factor) / factor;
};