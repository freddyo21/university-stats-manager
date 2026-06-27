import type { TxKey } from "@/i18n/i18n-types";
import type { TGradingScale, TPresetId } from "@/types/types";

export function getScaleSuffix(scale: TGradingScale, t: (key: TxKey) => string): string {
    if (scale === "4") return t("scale.gpa4");
    if (scale === "100") return t("scale.gpa100");
    return t("scale.gpa10");
}

export function isPresetId(value: any): value is TPresetId {
    return ["hust", "uit", "custom"].includes(value);
}

export function roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round((value + Number.EPSILON) * factor) / factor;
}