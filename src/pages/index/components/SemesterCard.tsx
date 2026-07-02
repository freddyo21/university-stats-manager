import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAcademicStore } from "@/hooks/useAcademicStore";
import { useI18n } from "@/i18n/use-i18n";
import { calculateSemesterMetrics } from "@/lib/academic/calc";
import type { ISemester } from "@/types/interfaces/ISemester";
import type { ISubject } from "@/types/interfaces/ISubject";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { SubjectRow } from "./SubjectRow";
import { newSubject } from "../../../utils/index-helpers";

export function SemesterCard({ semester }: { semester: ISemester; index: number }) {
    const { state, update } = useAcademicStore();
    const { t } = useI18n();
    const [open, setOpen] = useState(true);
    const [openSignal, setOpenSignal] = useState<{ open: boolean; tick: number } | null>(null);
    const [semExpanded, setSemExpanded] = useState(true);
    const { gpa10, credits, passedCredits, exemptCredits } = useMemo(
        () =>
            calculateSemesterMetrics(
                semester,
                state.letterGrades,
                state.subjectPassThreshold,
                state.componentPassEnabled,
                state.componentPassThreshold,
                state.precisionMode,
            ),
        [semester, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold, state.precisionMode],
    );

    const setSemester = (patch: Partial<ISemester>) =>
        update((s) => ({
            ...s,
            semesters: s.semesters.map((x) => (x.id === semester.id ? { ...x, ...patch } : x)),
        }));

    const remove = () =>
        update((s) => ({ ...s, semesters: s.semesters.filter((x) => x.id !== semester.id) }));

    const addSubject = () => setSemester({ subjects: [...semester.subjects, newSubject()] });

    const updateSubject = (id: string, patch: Partial<ISubject>) =>
        setSemester({
            subjects: semester.subjects.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
        });

    const removeSubject = (id: string) =>
        setSemester({ subjects: semester.subjects.filter((s) => s.id !== id) });

    const broadcastOpen = (val: boolean) => {
        setSemExpanded(val);
        setOpenSignal((s) => ({ open: val, tick: (s?.tick ?? 0) + 1 }));
    };

    return (
        <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-border bg-muted/30 p-4">
                <button
                    onClick={() => setOpen(!open)}
                    className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted cursor-pointer"
                    aria-label={`${open ? t("common.collapse.DEFAULT") : t("common.expand.DEFAULT")} ${t("common.semester")}`}
                >
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <div className="min-w-0">
                    <Input
                        value={semester.name}
                        onChange={(e) => setSemester({ name: e.target.value })}
                        className="h-8 max-w-xs border-none bg-transparent px-3 text-base font-semibold focus-visible:ring-0"
                    />
                    <div className="mt-0.5 text-xs text-muted-foreground">
                        {semester.subjects.length} {t("common.subjects")} · {credits} {t("common.credits.DEFAULT")} · {passedCredits} {t("common.credits.passed")} · {credits - passedCredits - exemptCredits} {t("common.credits.failed")} · {exemptCredits} {t("common.credits.exempt")} · {t("common.gpa")}{" "}
                        <span className="font-semibold text-foreground">{gpa10?.toFixed(2) ?? "—"}</span>
                    </div>
                </div>

                <Button size="sm" variant="ghost" className="text-xs px-2"
                    onClick={() => broadcastOpen(!semExpanded)}
                    aria-label={semExpanded ? t("common.collapse.all") : t("common.expand.all")}>
                    {semExpanded ? t("common.collapse.all") : t("common.expand.all")}
                </Button>

                <Button size="icon" variant="ghost" onClick={remove} aria-label={t("common.delete")}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        
            {open && (
                <div className="space-y-3 p-4">
                    {semester.subjects.map((sub) => (
                        <SubjectRow
                            key={sub.id}
                            subject={sub}
                            letterGrades={state.letterGrades}
                            precisionMode={state.precisionMode}
                            subjectPass={state.subjectPassThreshold}
                            componentPassEnabled={state.componentPassEnabled}
                            componentPass={state.componentPassThreshold}
                            openSignal={openSignal}
                            onChange={(patch) => updateSubject(sub.id, patch)}
                            onDelete={() => removeSubject(sub.id)}
                        />
                    ))}
                    <Button variant="outline" size="sm" onClick={addSubject}
                        aria-label={t("entry.addSubject")}>
                        <Plus className="h-4 w-4" /> {t("entry.addSubject")}
                    </Button>
                </div>
            )}
        </Card>
    );
}
