import { PageHeader } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cumulativeGPA10, semesterGPA10, subjectPassed, subjectScore10 } from "@/lib/academic/calc";
import { useI18n } from "@/lib/academic/i18n";
import { useAcademicStore } from "@/lib/academic/store";
import { Award, BookMarked, GraduationCap, Layers, Target, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function GoalsPage() {
    const { state, update } = useAcademicStore();
    const { t } = useI18n();
    const [selectedId, setSelectedId] = useState<string>("");

    useEffect(() => {
        if (!selectedId && state.semesters[0]) setSelectedId(state.semesters[0].id);
    }, [state.semesters, selectedId]);

    const selectedIndex = state.semesters.findIndex((s) => s.id === selectedId);
    const selected = state.semesters[selectedIndex];

    const semData = useMemo(
        () =>
            selected
                ? semesterGPA10(selected, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold)
                : { gpa: null, credits: 0 },
        [selected, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold],
    );
    const cumulativeUpTo = useMemo(() => {
        if (selectedIndex < 0) return { gpa: null, credits: 0 };
        return cumulativeGPA10(
            state.semesters.slice(0, selectedIndex + 1),
            state.subjectPassThreshold,
            state.componentPassEnabled,
            state.componentPassThreshold,
        );
    }, [state.semesters, selectedIndex, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold]);

    const active = selected ? selected.subjects.filter((s) => subjectPassed(s, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold) !== null).length : 0;

    const goalAchieved = selected && semData.gpa !== null && semData.gpa >= selected.targetGPA;
    const scholarship = semData.gpa !== null && semData.gpa >= state.scholarshipGPA;

    if (state.semesters.length === 0) {
        return (
            <>
                <PageHeader title={t("goals.title")} description={t("goals.desc")} />
                <Card className="border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                    {t("entry.empty")}
                </Card>
            </>
        );
    }

    const setSemesterTarget = (v: number) => {
        if (!selected) return;
        update((s) => ({
            ...s,
            semesters: s.semesters.map((x) => (x.id === selected.id ? { ...x, targetGPA: Math.min(10, Math.max(0, v)) } : x)),
        }));
    };

    return (
        <>
            <PageHeader title={t("goals.title")} description={t("goals.desc")} />

            <Card className="mb-6 p-4">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("goals.pick")}</Label>
                <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="mt-2 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    {state.semesters.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </Card>

            {selected && (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <SummaryCard icon={Layers} label={t("common.credits")} value={String(semData.credits)} />
                        <SummaryCard icon={BookMarked} label={t("goals.activeSubjects")} value={String(active)} />
                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <Target className="h-4 w-4 text-accent" /> {t("goals.targetGpa")}
                            </div>
                            <Input
                                type="number" min={0} max={10} step={0.1}
                                value={selected.targetGPA}
                                onChange={(e) => setSemesterTarget(Number(e.target.value) || 0)}
                                className="mt-2 h-9 text-lg font-semibold"
                            />
                        </Card>
                        <SummaryCard icon={GraduationCap} label={t("goals.actual")} value={semData.gpa?.toFixed(2) ?? "—"} />
                        <SummaryCard icon={TrendingUp} label={t("goals.cumulativeUpTo")} value={cumulativeUpTo.gpa?.toFixed(2) ?? "—"} hint={`${cumulativeUpTo.credits} cr.`} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <Card className={`p-5 ${goalAchieved ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80"><Target className="h-4 w-4" /> {t("goals.achieved")}</div>
                            <div className="mt-2 text-3xl font-bold">{goalAchieved ? t("goals.yes") : t("goals.no")}</div>
                            <p className="mt-1 text-sm opacity-90">
                                {semData.gpa?.toFixed(2) ?? "—"} / {selected.targetGPA.toFixed(2)}
                            </p>
                        </Card>
                        <Card className={`p-5 ${scholarship ? "bg-success text-success-foreground" : "bg-muted"}`}>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80"><Award className="h-4 w-4" /> {t("goals.scholarship")}</div>
                            <div className="mt-2 text-3xl font-bold">{scholarship ? t("goals.yes") : t("goals.nope")}</div>
                            <p className="mt-1 text-sm opacity-80">≥ {state.scholarshipGPA.toFixed(2)} required</p>
                        </Card>
                    </div>

                    <Card className="mt-6 overflow-hidden p-0">
                        <div className="border-b border-border bg-muted/30 px-4 py-3">
                            <h3 className="text-sm font-semibold">{t("common.subjects")} — {selected.name}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-160 text-sm">
                                <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-2 text-left">{t("entry.subjectCode")}</th>
                                        <th className="px-4 py-2 text-left">{t("entry.subjectName")}</th>
                                        <th className="px-4 py-2 text-left">{t("common.credits")}</th>
                                        <th className="px-4 py-2 text-left">Scale 10</th>
                                        <th className="px-4 py-2 text-left">{t("common.status")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selected.subjects.map((sub) => {
                                        const sc = subjectScore10(sub);
                                        const passed = subjectPassed(sub, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold);
                                        return (
                                            <tr key={sub.id} className="border-t border-border">
                                                <td className="px-4 py-2 font-mono text-xs">{sub.code || "—"}</td>
                                                <td className="px-4 py-2 font-medium">{sub.name || <span className="text-muted-foreground">Untitled</span>}</td>
                                                <td className="px-4 py-2">{sub.credits}</td>
                                                <td className="px-4 py-2 tabular-nums">{sc?.toFixed(2) ?? "—"}</td>
                                                <td className="px-4 py-2">
                                                    {passed === null ? (
                                                        <span className="text-xs text-muted-foreground">{t("common.inProgress")}</span>
                                                    ) : passed ? (
                                                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">{t("common.passed")}</span>
                                                    ) : (
                                                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{t("common.failed")}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    hint,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <Card className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
            {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
        </Card>
    );
}
