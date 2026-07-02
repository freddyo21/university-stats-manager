import { Card } from "@/components/ui/card";
import { useAcademicStore } from "@/hooks/useAcademicStore";
import { useStandardReference } from "@/pages/scale/useStandardReference";
import { useI18n } from "@/i18n/use-i18n";

export function StandardReferenceCard() {
    const { state } = useAcademicStore();
    const { t } = useI18n();

    const { STANDARD_REFERENCE } = useStandardReference();

    return (
        <>
            <Card className="overflow-hidden p-0">
                <div className="border-b border-border bg-muted/30 px-4 py-3">
                    <h3 className="text-sm font-semibold">{t("scale.standard")}</h3>
                    <p className="text-xs text-muted-foreground">{state.presetId.toUpperCase()}-derived standard reference.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-90 text-sm">
                        <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                            <tr>
                                <th className="px-4 py-2 text-left">{t("scale.range")}</th>
                                <th className="px-4 py-2 text-left">{t("scale.letter")}</th>
                                <th className="px-4 py-2 text-left">{t("scale.gpa4")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {STANDARD_REFERENCE.map((r) => (
                                <tr key={r.letter} className="border-t border-border">
                                    <td className="px-4 py-2 tabular-nums">{r.range}</td>
                                    <td className="px-4 py-2 font-semibold">{r.letter}</td>
                                    <td className="px-4 py-2 tabular-nums">{r.gpa4.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    );
}