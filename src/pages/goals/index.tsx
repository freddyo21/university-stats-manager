import "./index.css";
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
import type { TGradingScale, TPrecisionMode, TStudyType } from "@/types/types";
import { Award, BookMarked, GraduationCap, Layers, Target, TrendingUp, TriangleAlert } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useI18n } from "@/i18n/use-i18n";
import { getScaleSuffix } from "@/utils/helpers";
import { ScaleSwitcher } from "@/components/shared/ScaleSwitcher";
import { SummaryCard } from "@/pages/goals/components/SummaryCard";
import { useGoalsMetrics } from "./useGoalsMetrics";
import type { IAppState } from "@/types/interfaces/IAppState";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import type { TranslationKey } from "@/i18n/i18n-types";
import { useActiveScale } from "@/hooks/useActiveScale";

type ScoreTone = "muted" | "primary" | "success" | "warning" | "destructive";

const TONE_CLASSES: Record<ScoreTone, { badge: string; dot: string }> = {
    muted: {
        badge: "bg-base-200 text-base-content",
        dot: "bg-base-content/40",
    },
    primary: {
        badge: "bg-primary/20 text-primary",
        dot: "bg-primary",
    },
    success: {
        badge: "bg-success/20 text-success",
        dot: "bg-success",
    },
    warning: {
        badge: "bg-warning/20 text-warning",
        dot: "bg-warning",
    },
    destructive: {
        badge: "bg-destructive/20 text-destructive",
        dot: "bg-destructive",
    },
};

function scoreTone(state: IAppState, score: number | null): ScoreTone {
    switch (state.activeScale) {
        case "10": {
            if (score === null) return "muted";
            if (score >= 8) return "success";
            if (score >= 6.5) return "primary";
            if (score >= 5) return "warning";
            return "destructive";
        }
        case "4": {
            if (score === null) return "muted";
            if (score >= 3.2) return "success";
            if (score >= 2.5) return "primary";
            if (score >= 2) return "warning";
            return "destructive";
        }
        case "100": {
            if (score === null) return "muted";
            if (score >= 80) return "success";
            if (score >= 65) return "primary";
            if (score >= 50) return "warning";
            return "destructive";
        }
        default: {
            return "muted";
        }
    }
}

function scoreToneClasses(state: IAppState, score: number | null) {
    const tone = scoreTone(state, score);
    return {
        tone,
        ...TONE_CLASSES[tone],
    };
}

function studyTypeLabel(t: (key: TranslationKey) => string, studyType: TStudyType): string {
    return {
        normal: t("goals.studyType.new"),
        retake: t("goals.studyType.retake"),
        improvement: t("goals.studyType.improvement"),
        exempt: t("goals.studyType.exempt"),
    }[studyType];
}

export default function GoalsPage() {
    const {
        state,
        selectedId,
        setSelectedId,
        selectedSemester,
        subjectCount,
        activeScale,
        currentGpa,
        grossCpa,
        currentCpa,
        goalAchieved,
        hasScholarship,
        metrics,
        precisionMode,
        roundedTargetGPA,
        roundedScholarshipGPA,
        formatGpa,
        setSemesterTarget,
        setPrecisionMode
    } = useGoalsMetrics();

    const { t } = useI18n();
    const { setActiveScale } = useActiveScale();

    const gpaInputEnabled = state.scoreInputMode === "gpaOnly";

    const convertTargetGPA = (currentGPA: number, fromScale: string, toScale: string): number => {
        if (!currentGPA || currentGPA <= 0) return 0;

        const from = Number(fromScale) || 10;
        const to = Number(toScale) || 10;

        // Quy đổi điểm số từ thang cũ sang thang mới một cách chuẩn xác
        const rawConverted = (currentGPA / from) * to;

        // Làm tròn số đẹp đẽ: Thang 100 lấy số nguyên, Thang 4 và 10 lấy 2 chữ số thập phân
        return toScale === "100"
            ? Math.round(rawConverted)
            : Math.round(rawConverted * 100) / 100;
    };

    const activeScaleManagement = (newScale: TGradingScale) => {
        const currentTarget = selectedSemester?.targetGPA ?? 0;

        // Tính toán điểm mới dựa trên thang điểm HIỆN TẠI (activeScale) sang THANG MỚI (newScale)
        const newTarget = convertTargetGPA(currentTarget, activeScale ?? "10", newScale);

        // Đảm bảo cập nhật đồng bộ cả biến trạng thái và điểm số mục tiêu
        setActiveScale(newScale);
        setSemesterTarget(newTarget);
    };

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
                            <option key={s.id} value={s.id}>{s.semesterId}</option>
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

                <Card className="mt-4 max-w-md p-4 flex items-center gap-4">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("goals.selectGpa")}
                    </Label>
                    <ScaleSwitcher />
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
                        <option key={s.id} value={s.id}>{s.semesterId}</option>
                    ))}
                </select>
                <div className="mt-4">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("goals.precision.DEFAULT")}
                    </Label>
                    <RadioGroup
                        value={String(precisionMode)}
                        onValueChange={(v) => setPrecisionMode(Number(v) as TPrecisionMode)}
                        className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6"
                    >
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <RadioGroupItem value="1" />
                            {t("goals.precision.number", { number: 1 })}
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <RadioGroupItem value="2" />
                            {t("goals.precision.number", { number: 2 })}
                        </label>
                    </RadioGroup>
                </div>
            </Card>

            {selectedSemester && (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 lg:grid-cols-40 items-stretch">
                        <div className="col-span-1 sm:col-span-2 lg:col-span-5 grid sm:max-lg:order-1 lg:order-0">
                            <SummaryCard
                                icon={Layers}
                                label={t("common.credits.DEFAULT")}
                                value={String(metrics.semesterData.credits)}
                            />
                        </div>
                        <div className="col-span-1 sm:col-span-2 lg:col-span-6 grid sm:max-lg:order-2 lg:order-0">
                            <SummaryCard
                                icon={BookMarked}
                                label={t("goals.activeSubjects")}
                                value={String(subjectCount)}
                            />
                        </div>
                        <Card className="col-span-2 max-sm:col-span-1 sm:max-md:col-span-full md:max-lg:col-span-2 lg:col-span-11 p-4 grid sm:max-lg:order-4 lg:order-0">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <Target className="h-4 w-4 text-accent" /> {t("goals.targetGpa")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {t("goals.help.inputTarget")}
                            </div>
                            <div className="mt-2 block sm:flex gap-2">
                                <div className="max-sm:w-full w-1/2">
                                    <Input type="number" inputMode="decimal"
                                        min={0} max={Number(state.activeScale)} step={state.activeScale === "100" ? "1" : "0.1"}
                                        value={selectedSemester.targetGPA}
                                        onChange={(e) => setSemesterTarget(Number(e.target.value) || 0)}
                                        className="h-9 text-lg font-semibold"
                                    />
                                </div>
                                <div className="max-sm:w-full w-1/2 max-sm:mt-2 flex">
                                    <Select
                                        value={activeScale}
                                        onValueChange={(v) => activeScaleManagement(v as TGradingScale)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t("goals.selectGpa")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="10">{getScaleSuffix("10", t)}</SelectItem>
                                                <SelectItem value="4">{getScaleSuffix("4", t)}</SelectItem>
                                                <SelectItem value="100">{getScaleSuffix("100", t)}</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>
                        <div className="col-span-1 sm:max-lg:col-span-2 lg:col-span-6 grid sm:max-lg:order-3 lg:order-0">
                            <SummaryCard
                                icon={GraduationCap}
                                label={t("goals.actual")}
                                value={formatGpa(currentGpa)}
                                tone={scoreToneClasses(state, currentGpa).tone} />
                        </div>
                        <div className="col-span-1 sm:col-span-3 md:col-span-2 lg:col-span-6 grid sm:max-lg:order-5 lg:order-0">
                            <SummaryCard
                                icon={GraduationCap}
                                label={t("goals.grossUpTo")}
                                value={formatGpa(grossCpa)}
                                tone={scoreToneClasses(state, grossCpa).tone} />
                        </div>
                        <div className="col-span-1 sm:col-span-3 md:col-span-2 lg:col-span-6 grid sm:max-lg:order-6 lg:order-0">
                            <SummaryCard
                                icon={TrendingUp}
                                label={t("goals.cumulativeUpTo")}
                                value={formatGpa(currentCpa)}
                                tone={scoreToneClasses(state, currentCpa).tone}
                                hint={`${metrics.cumulativeUpTo.credits} ${t("common.credits.DEFAULT").toLowerCase()}`}
                            />
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <Card className={`p-5 ${goalAchieved ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80"><Target className="h-4 w-4" /> {t("goals.achieved")}</div>
                            <div className="mt-2 text-3xl font-bold">{goalAchieved ? t("goals.yes") : t("goals.no")}</div>
                            <p className="mt-1 text-sm opacity-90">
                                {formatGpa(currentGpa)} / {roundedTargetGPA.toFixed(precisionMode)} ({getScaleSuffix(activeScale, t)})
                            </p>
                        </Card>
                        <Card className={`p-5 ${hasScholarship ? "bg-success text-success-foreground" : "bg-muted"}`}>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80"><Award className="h-4 w-4" /> {t("goals.scholarship")}</div>
                            <div className="mt-2 text-3xl font-bold">{hasScholarship ? t("goals.yes") : t("goals.nope")}</div>
                            <p className="mt-1 text-sm opacity-80">
                                ≥ {roundedScholarshipGPA.toFixed(precisionMode)} required ({getScaleSuffix(activeScale, t)})
                            </p>
                        </Card>
                    </div>

                    <Card className="mt-6 overflow-hidden p-0">
                        <div className="border-b border-border bg-muted/30 px-4 py-3">
                            <div className="flex justify-between">
                                <h3 className="text-sm font-semibold">{t("goals.subjects")} — {selectedSemester.semesterId}</h3>

                                <div className="flex gap-2">
                                    {[
                                        { label: "8.0+", tone: "success" as const },
                                        { label: "6.5-7.9", tone: "primary" as const },
                                        { label: "5.0-6.4", tone: "warning" as const },
                                        { label: "<5.0", tone: "destructive" as const },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center gap-2 text-xs font-medium">
                                            <div className={`h-3 w-3 rounded-full ${item.tone === "success" ? "bg-success" : item.tone === "primary" ? "bg-primary" : item.tone === "warning" ? "bg-warning" : "bg-destructive"}`} />
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-160 text-sm">
                                <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-2 text-left">{t("entry.subjectCode")}</th>
                                        <th className="px-4 py-2 text-left">{t("entry.subjectName")}</th>
                                        <th className="px-4 py-2 text-left">{t("common.credits.DEFAULT")}</th>
                                        <th className="px-4 py-2 text-left">{t("scale.gpa10")}</th>
                                        <th className="px-4 py-2 text-left">{t("scale.gpa4")}</th>
                                        <th className="px-4 py-2 text-left">
                                            <Tooltip
                                                id="study_status_tooltip"
                                                content={
                                                    <ul className="text-left list-inside list-disc text-xs">
                                                        <li className="text-purple-400">
                                                            {t("common.exempt")}
                                                        </li>
                                                        <li className="text-muted">
                                                            {t("common.inProgress")}
                                                        </li>
                                                        <li className="text-green-400">
                                                            {t("common.passed")}
                                                        </li>
                                                        <li className="text-red-400">
                                                            {t("common.failed")}
                                                        </li>
                                                    </ul>
                                                }>{t("common.status")}
                                            </Tooltip>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSemester.subjects.map((subject) => {
                                        const sc10 = gpaInputEnabled ? subject.gpa10 : subject.calculateGPA10(state.presetId);
                                        const {
                                            letterGrades,
                                            subjectPassThreshold,
                                            componentThresholdEnabled,
                                            componentPassThreshold,
                                            scoreInputMode,
                                            presetId
                                        } = state;

                                        const passed = subject.isPassed({
                                            subjectPassThreshold,
                                            componentThresholdEnabled,
                                            componentPassThreshold,
                                            scoreInputMode,
                                            presetId
                                        });

                                        const sc4 = sc10 === null ? null : subject.getGPA4(letterGrades);

                                        const studyType = subject.studyType;
                                        const isExempt = studyType === "exempt";

                                        // const rowTone = isExempt
                                        //     ? "success"
                                        //     : sc10 === null
                                        //         ? "muted"
                                        //         : scoreTone(state, state.activeScale === "4" ? sc4 : sc10);

                                        // const rowClasses = {
                                        //     muted: "bg-base-200/40",
                                        //     primary: "bg-primary/20",
                                        //     success: "bg-success/20",
                                        //     warning: "bg-warning/20",
                                        //     destructive: "bg-destructive/20",
                                        // }[rowTone];
                                        // const studyClasses = scoreToneClasses(state, sc10).badge;

                                        return (
                                            <tr key={subject.id} className={`border-t border-border`}>
                                                <td className="px-4 py-2 font-mono text-xs">{subject.code || "—"}</td>
                                                <td className="px-4 py-2 font-medium">{subject.name || <span className="text-muted-foreground">Untitled</span>}</td>
                                                <td className="px-4 py-2">{subject.credits}</td>
                                                <td className="px-4 py-2 tabular-nums">{sc10?.toFixed(precisionMode) ?? "—"}</td>
                                                <td className="px-4 py-2 tabular-nums">{sc4 === null ? "—" : sc4.toFixed(1)}</td>
                                                <td className="px-4 py-2">
                                                    <div className="flex gap-1">
                                                        {!isExempt && (passed === null || studyType === "retake") && (
                                                            <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium 
                                                            
                                                            // studyClasses
                                                            
                                                            `}>
                                                                {studyTypeLabel(t, subject.studyType)}
                                                            </span>
                                                        )}
                                                        {isExempt ? (
                                                            <span className="rounded-full bg-purple-600/10 px-2 py-0.5 text-xs font-medium text-purple-600">{t("common.exempt")}</span>
                                                        ) : passed === null ? (
                                                            <span className="text-xs text-muted-foreground flex items-center">{t("common.inProgress")}</span>
                                                        ) : passed ? (
                                                            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">{t("common.passed")}</span>
                                                        ) : (
                                                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{t("common.failed")}</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )
            }
        </>
    );
}