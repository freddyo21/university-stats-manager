import { useI18n } from "@/lib/academic/i18n";
import type { GradingScale } from "@/lib/academic/types";

export function useScaleSuffix(scale: GradingScale): string {
    const { t } = useI18n();

    if (scale === "4") return t("scale.gpa4");
    if (scale === "100") return t("scale.gpa100");
    return t("scale.gpa10");
}