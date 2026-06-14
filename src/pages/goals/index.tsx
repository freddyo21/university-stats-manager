import { PageHeader } from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    cumulativeGPA10,
    cumulativeGPA4,
    gpa4FromScore10,
    roundGpa,
    semesterGPA10,
    semesterGPA4,
    subjectPassed,
    subjectScore10,
} from "@/lib/academic/calc";
import { useI18n } from "@/lib/academic/i18n";
import { useAcademicStore } from "@/lib/academic/store";
import type { GradingScale, PrecisionMode } from "@/lib/academic/types";
import { Award, BookMarked, GraduationCap, Layers, Target, TrendingUp, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useScaleSuffix } from "@/hooks/use-scale-suffix";

const SCALE_4_FACTOR = 2.5;

export function GoalsPage() {
    const { state, update } = useAcademicStore();
    const { t } = useI18n();
    const [selectedId, setSelectedId] = useState<string>("");

    useEffect(() => {
        if (!selectedId && state.semesters[0]) setSelectedId(state.semesters[0].id);
    }, [state.semesters, selectedId]);

    const selectedIndex = state.semesters.findIndex((s) => s.id === selectedId);
    const selected = state.semesters[selectedIndex];

    const passOpts = [
        state.subjectPassThreshold,
        state.componentPassEnabled,
        state.componentPassThreshold,
    ] as const;

    const precisionMode = state.precisionMode;

    const semData = useMemo(
        () =>
            selected
                ? semesterGPA10(selected, ...passOpts, precisionMode)
                : { gpa10: null, credits: 0, passedCredits: 0, exemptCredits: 0 },
        [selected, precisionMode, ...passOpts],
    );

    const semData4 = useMemo(
        () =>
            selected
                ? semesterGPA4(selected, state.letterGrades, ...passOpts, precisionMode)
                : { gpa4: null, credits: 0, passedCredits: 0, exemptCredits: 0 },
        [selected, state.letterGrades, precisionMode, ...passOpts],
    );

    const cumulative10UpTo = useMemo(() => {
        if (selectedIndex < 0) return {
            gpa10: null,
            credits: 0,
            passedCredits: 0,
            exemptCredits: 0,
        };

        return cumulativeGPA10(
            state.semesters.slice(0, selectedIndex + 1),
            ...passOpts,
            precisionMode,
        );
    }, [state.semesters, selectedIndex, precisionMode, ...passOpts]);

    const cumulative4UpTo = useMemo(() => {
        if (selectedIndex < 0) return {
            gpa4: null,
            credits: 0,
            passedCredits: 0,
            exemptCredits: 0
        };

        return cumulativeGPA4(
            state.semesters.slice(0, selectedIndex + 1),
            state.letterGrades,
            ...passOpts,
            precisionMode,
        );
    }, [state.semesters, state.letterGrades, selectedIndex, precisionMode, ...passOpts]);

    const active = selected
        ? selected.subjects.filter(
            (s) => subjectPassed(s, ...passOpts, precisionMode) !== null,
        ).length
        : 0;

    const setSemesterTarget = (v: number) => {
        if (!selected) return;
        update((s) => ({
            ...s,
            semesters: s.semesters.map((x) =>
                x.id === selected.id ? { ...x, targetGPA: Math.min(10, Math.max(0, v)) } : x,
            ),
        }));
    };

    const setActiveScale = (scale: GradingScale) => {
        update((s) => ({
            ...s,
            activeScale: scale,
            scholarshipGPA: Number(scale) * 0.8,
        }));
    };

    const setPrecisionMode = (mode: PrecisionMode) => {
        update((s) => ({ ...s, precisionMode: mode }));
    };

    const formatGpa = (value: number | null) =>
        value === null ? "—" : value.toFixed(precisionMode);

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

    const activeScale = state.activeScale;

    const displayCurrentGPA =
        activeScale === "4"
            ? semData4.gpa4
            : activeScale === "100" && semData.gpa10 !== null
                ? roundGpa(semData.gpa10 * 10, precisionMode)
                : semData.gpa10;

    const displayCumulativeGPA =
        activeScale === "4"
            ? cumulative4UpTo.gpa4
            : activeScale === "100" && cumulative10UpTo.gpa10 !== null
                ? roundGpa(cumulative10UpTo.gpa10 * 10, precisionMode)
                : cumulative10UpTo.gpa10;

    const displayTargetGPARaw =
        activeScale === "4" && selected
            ? selected.targetGPA / SCALE_4_FACTOR
            : activeScale === "100" && selected
                ? selected.targetGPA * 10
                : selected?.targetGPA ?? 0;

    const roundedCurrentGPA =
        displayCurrentGPA !== null ? roundGpa(displayCurrentGPA, precisionMode) : null;

    const roundedTargetGPA = roundGpa(displayTargetGPARaw, precisionMode);

    const roundedScholarshipGPA = roundGpa(state.scholarshipGPA, precisionMode);

    const goalAchieved =
        selected &&
        roundedCurrentGPA !== null &&
        roundedCurrentGPA >= roundedTargetGPA;

    const scholarship =
        roundedCurrentGPA !== null && roundedCurrentGPA >= roundedScholarshipGPA;

    if (!activeScale) {
        return (
            <>
                <PageHeader title={t("goals.title")} description={t("goals.desc")} />

                <Card className="mb-6 p-4">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mr-4">
                        {t("goals.pick")}
                    </Label>
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

                <Alert className="border-warning/40 bg-warning/10">
                    <TriangleAlert className="h-4 w-4 text-warning" />
                    <AlertTitle>⚠️ Please select a grading scale</AlertTitle>
                    <AlertDescription>
                        Please select a grading scale to view your goals and scholarship eligibility.
                    </AlertDescription>
                </Alert>

                <Card className="mt-4 max-w-md p-4">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("goals.selectGpa")}
                    </Label>
                    <Select onValueChange={(v) => setActiveScale(v as GradingScale)}>
                        <SelectTrigger className="mt-2 w-full">
                            <SelectValue placeholder={t("goals.selectGpa")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="10">Hệ 10</SelectItem>
                                <SelectItem value="4">Hệ 4</SelectItem>
                                <SelectItem value="100">Hệ 100</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Card>
            </>
        );
    }

    return (
        <>
            <PageHeader title={t("goals.title")} description={t("goals.desc")} />

            <Card className="mb-6 p-4">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mr-4">{t("goals.pick")}</Label>
                <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="mt-2 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    {state.semesters.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <div className="mt-4">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Độ chính xác GPA
                    </Label>
                    <RadioGroup
                        value={String(precisionMode)}
                        onValueChange={(v) => setPrecisionMode(Number(v) as PrecisionMode)}
                        className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6"
                    >
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <RadioGroupItem value="1" />
                            1 chữ số thập phân
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <RadioGroupItem value="2" />
                            2 chữ số thập phân
                        </label>
                    </RadioGroup>
                </div>
            </Card>

            {selected && (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <SummaryCard
                            icon={Layers}
                            label={t("common.credits")}
                            value={String(semData.credits)}
                        />
                        <SummaryCard
                            icon={BookMarked}
                            label={t("goals.activeSubjects")}
                            value={String(active)}
                        />
                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <Target className="h-4 w-4 text-accent" /> {t("goals.targetGpa")}
                            </div>
                            <div className="mt-2">
                                <Input type="number" inputMode="decimal"
                                    min={0} max={10} step={0.1}
                                    value={selected.targetGPA}
                                    onChange={(e) => setSemesterTarget(Number(e.target.value) || 0)}
                                    className="h-9 text-lg font-semibold"
                                />
                                <Select
                                    value={activeScale}
                                    onValueChange={(v) => setActiveScale(v as GradingScale)}
                                >
                                    <SelectTrigger className="w-full max-w-72 mt-2">
                                        <SelectValue placeholder={t("goals.selectGpa")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="10">Hệ 10</SelectItem>
                                            <SelectItem value="4">Hệ 4</SelectItem>
                                            <SelectItem value="100">Hệ 100</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </Card>
                        <SummaryCard icon={GraduationCap} label={t("goals.actual")} value={formatGpa(displayCurrentGPA)} />
                        <SummaryCard
                            icon={TrendingUp}
                            label={t("goals.cumulativeUpTo")}
                            value={formatGpa(displayCumulativeGPA)}
                            hint={`${cumulative10UpTo.credits} ${t("common.credits").toLowerCase()}`}
                        />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <Card className={`p-5 ${goalAchieved ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80"><Target className="h-4 w-4" /> {t("goals.achieved")}</div>
                            <div className="mt-2 text-3xl font-bold">{goalAchieved ? t("goals.yes") : t("goals.no")}</div>
                            <p className="mt-1 text-sm opacity-90">
                                {formatGpa(displayCurrentGPA)} / {roundedTargetGPA.toFixed(precisionMode)} ({useScaleSuffix(activeScale)})
                            </p>
                        </Card>
                        <Card className={`p-5 ${scholarship ? "bg-success text-success-foreground" : "bg-muted"}`}>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80"><Award className="h-4 w-4" /> {t("goals.scholarship")}</div>
                            <div className="mt-2 text-3xl font-bold">{scholarship ? t("goals.yes") : t("goals.nope")}</div>
                            <p className="mt-1 text-sm opacity-80">
                                ≥ {roundedScholarshipGPA.toFixed(precisionMode)} required ({useScaleSuffix(activeScale)})
                            </p>
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
                                        <th className="px-4 py-2 text-left">{t("scale.gpa10")}</th>
                                        <th className="px-4 py-2 text-left">{t("scale.gpa4")}</th>
                                        <th className="px-4 py-2 text-left">{t("common.status")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selected.subjects.map((sub) => {
                                        const sc10 = subjectScore10(sub, precisionMode);
                                        const passed = subjectPassed(sub, ...passOpts, precisionMode);
                                        const sc4 = sc10 === null ? null : gpa4FromScore10(sc10, state.letterGrades);

                                        return (
                                            <tr key={sub.id} className="border-t border-border">
                                                <td className="px-4 py-2 font-mono text-xs">{sub.code || "—"}</td>
                                                <td className="px-4 py-2 font-medium">{sub.name || <span className="text-muted-foreground">Untitled</span>}</td>
                                                <td className="px-4 py-2">{sub.credits}</td>
                                                <td className="px-4 py-2 tabular-nums">{sc10?.toFixed(precisionMode) ?? "—"}</td>
                                                <td className="px-4 py-2 tabular-nums">{sc4 === null ? "—" : sc4.toFixed(1)}</td>
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
