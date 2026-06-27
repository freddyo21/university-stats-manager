import type { TxKey } from "@/i18n/i18n-types";
import type { TGradingScale, TPresetId } from "@/types/types";

export function getScaleSuffix(scale: TGradingScale, t: (key: TxKey) => string): string {
    if (scale === "4") return t("scale.gpa4");
    if (scale === "100") return t("scale.gpa100");
    return t("scale.gpa10");
}