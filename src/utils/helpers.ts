import type { TGradingScale } from "@/types/types";

export function getScaleSuffix(scale: TGradingScale, t: (key: string) => string): string {
    if (scale === "4") return t("scale.gpa4");
    if (scale === "100") return t("scale.gpa100");
    return t("scale.gpa10");
}