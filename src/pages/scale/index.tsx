import { PageHeader } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/use-i18n";
import { STANDARD_REFERENCE } from "@/lib/academic/presets";
import { useAcademicStore } from "@/lib/academic/store";
import type { LetterGradeRange } from "@/types/types";
import { Plus, Trash2 } from "lucide-react";

function clampNum(v: string, min: number, max: number) {
    const n = Number(v);
    if (isNaN(n)) return min;
    return Math.min(max, Math.max(min, n));
}

export function ScalePage() {
    const { state, update } = useAcademicStore();
    const { t } = useI18n();

    const setRange = (i: number, patch: Partial<LetterGradeRange>) =>
        update((s) => ({
            ...s,
            letterGrades: s.letterGrades.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
        }));
    const addRange = () =>
        update((s) => ({
            ...s,
            letterGrades: [...s.letterGrades, { letter: "?", min: 0, max: 0, gpa4: 0 }],
        }));
    const removeRange = (i: number) =>
        update((s) => ({ ...s, letterGrades: s.letterGrades.filter((_, idx) => idx !== i) }));

    return (
        <>
            <PageHeader title={t("scale.title")} description={t("scale.desc")} />

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="overflow-hidden p-0">
                    <div className="border-b border-border bg-muted/30 px-4 py-3">
                        <h3 className="text-sm font-semibold">{t("scale.standard")}</h3>
                        <p className="text-xs text-muted-foreground">UIT-derived standard reference.</p>
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

                <Card className="overflow-hidden p-0">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                        <div>
                            <h3 className="text-sm font-semibold">{t("scale.active")}</h3>
                            <p className="text-xs text-muted-foreground">Lower ≤ Score &lt; Upper</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={addRange}>
                            <Plus className="h-3 w-3" /> {t("common.add")}
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-120 text-sm">
                            <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 text-left">{t("scale.letter")}</th>
                                    <th className="px-3 py-2 text-left">{t("scale.lower")}</th>
                                    <th className="px-3 py-2 text-left">{t("scale.upper")}</th>
                                    <th className="px-3 py-2 text-left">{t("scale.gpa4")}</th>
                                    <th className="px-3 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.letterGrades.map((r, i) => (
                                    <tr key={i} className="border-t border-border">
                                        <td className="px-3 py-2">
                                            <Input value={r.letter}
                                                onChange={(e) => setRange(i, { letter: e.target.value.slice(0, 3) })}
                                                className="h-8 w-16" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <Input type="text" inputMode="decimal"
                                                min={0}
                                                max={10}
                                                step={0.1}
                                                value={r.min}
                                                onChange={(e) => setRange(i, { min: clampNum(e.target.value, 0, 10) })}
                                                className="h-8 w-20"
                                                disabled={state.presetId === "UIT" || state.presetId === "HUST"}
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <Input type="text" inputMode="decimal"
                                                min={0}
                                                max={10.0}
                                                step={0.1}
                                                value={r.max}
                                                onChange={(e) => setRange(i, { max: clampNum(e.target.value, 0, 10.0) })}
                                                className="h-8 w-20"
                                                disabled={state.presetId === "UIT" || state.presetId === "HUST"}
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <Input type="text" inputMode="decimal"
                                                min={0}
                                                max={4}
                                                step={0.1}
                                                value={r.gpa4}
                                                onChange={(e) => setRange(i, { gpa4: clampNum(e.target.value, 0, 4) })}
                                                className="h-8 w-20"
                                                disabled={state.presetId === "UIT" || state.presetId === "HUST"}
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <Button size="icon" variant="ghost" onClick={() => removeRange(i)} aria-label="Remove">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </>
    );
}
