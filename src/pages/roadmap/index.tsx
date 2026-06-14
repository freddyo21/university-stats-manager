import { useMemo } from "react";
import { useAcademicStore } from "@/lib/academic/store";
import {
  classify,
  cumulativeGPA10,
  effectiveScore10,
  passedCredits,
  roundGpa,
  subjectScore10,
  toLetter,
} from "@/lib/academic/calc";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, GraduationCap, BookCheck, BookMinus, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/academic/i18n";
import { PageHeader } from "@/components/Header";

export function RoadmapPage() {
  const { state, update } = useAcademicStore();
  const { t, lang } = useI18n();

  const cumulative = useMemo(
    () =>
      cumulativeGPA10(
        state.semesters,
        state.subjectPassThreshold,
        state.componentPassEnabled,
        state.componentPassThreshold,
        state.precisionMode,
      ),
    [state.semesters, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold, state.precisionMode],
  );
  const passed = useMemo(
    () =>
      passedCredits(
        state.semesters,
        state.subjectPassThreshold,
        state.componentPassEnabled,
        state.componentPassThreshold,
        state.precisionMode,
      ),
    [state.semesters, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold, state.precisionMode],
  );
  const remaining = Math.max(0, state.totalCourseCredits - passed);

  const requiredAvg = useMemo(() => {
    const totalNeeded = state.targetGPA * state.totalCourseCredits;
    const have = (cumulative.gpa10 ?? 0) * cumulative.credits;
    if (remaining <= 0) return null;
    return (totalNeeded - have) / remaining;
  }, [cumulative, state.targetGPA, state.totalCourseCredits, remaining]);

  const distribution = useMemo(() => {
    const buckets: Record<string, { letter: string; subjects: number; credits: number }> = {};
    for (const r of state.letterGrades) buckets[r.letter] = { letter: r.letter, subjects: 0, credits: 0 };
    for (const s of state.semesters) {
      for (const sub of s.subjects) {
        const sc = effectiveScore10(
          sub,
          // state.subjectPassThreshold,
          state.componentPassEnabled,
          state.componentPassThreshold,
          state.precisionMode,
        );
        if (sc === null) continue;
        const l = toLetter(sc, state.letterGrades);
        if (!buckets[l]) buckets[l] = { letter: l, subjects: 0, credits: 0 };
        buckets[l].subjects += 1;
        buckets[l].credits += sub.credits;
      }
    }
    return Object.values(buckets);
  }, [state.semesters, state.letterGrades, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold, state.precisionMode]);

  const perfStats = useMemo(() => {
    let perfect = 0, above9 = 0, above8 = 0, failed = 0, totalSubjects = 0;
    for (const s of state.semesters)
      for (const sub of s.subjects) {
        const raw = subjectScore10(sub, state.precisionMode);
        const eff = effectiveScore10(
          sub,
          // state.subjectPassThreshold,
          state.componentPassEnabled,
          state.componentPassThreshold,
          state.precisionMode,
        );
        if (raw === null) continue;
        totalSubjects++;
        if (raw >= 10) perfect++;
        if (raw >= 9) above9++;
        if (raw >= 8) above8++;
        if (eff === null || eff < state.subjectPassThreshold) failed++;
      }
    return { perfect, above9, above8, failed, totalSubjects };
  }, [state.semesters, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold, state.precisionMode]);

  const precisionMode = state.precisionMode;
  const formatGpa = (value: number | null) => (value === null ? "—" : value.toFixed(precisionMode));

  const advisory = classify(cumulative.gpa10);

  return (
    <>
      <PageHeader title={t("roadmap.title")} description={t("roadmap.desc")} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Simulator</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("roadmap.targetGrad")}</Label>
              <Input
                type="number" min={0} max={10} step={0.1}
                value={state.targetGPA}
                onChange={(e) => update((s) => ({ ...s, targetGPA: Math.min(10, Math.max(0, Number(e.target.value) || 0)) }))}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("roadmap.totalCourse")}</Label>
              <Input
                type="number" min={0} max={500}
                value={state.totalCourseCredits}
                onChange={(e) => update((s) => ({ ...s, totalCourseCredits: Math.min(500, Math.max(0, Number(e.target.value) || 0)) }))}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric icon={GraduationCap} label={t("roadmap.currentGpa")} value={formatGpa(cumulative.gpa10)} />
            <Metric icon={BookCheck} label={t("roadmap.passedCredits")} value={String(passed)} />
            <Metric icon={BookMinus} label={t("roadmap.remaining")} value={String(remaining)} />
            <Metric icon={Target} label={t("common.target")} value={roundGpa(state.targetGPA, precisionMode).toFixed(precisionMode)} />
          </div>

          <div className="mt-5 rounded-lg border border-accent/30 bg-accent/5 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{t("roadmap.required")}</div>
                {requiredAvg === null ? (
                  <p className="text-sm text-muted-foreground">
                    {cumulative.gpa10 !== null &&
                    roundGpa(cumulative.gpa10, precisionMode) >= roundGpa(state.targetGPA, precisionMode)
                      ? t("roadmap.secured")
                      : t("roadmap.unreachable")}
                  </p>
                ) : requiredAvg > 10 ? (
                  <p className="text-sm text-destructive">{t("roadmap.unreachable")} (need {roundGpa(requiredAvg, precisionMode).toFixed(precisionMode)}/10)</p>
                ) : requiredAvg < 0 ? (
                  <p className="text-sm text-success">{t("roadmap.secured")}</p>
                ) : (
                  <p className="text-sm">
                    <span className="font-bold text-accent">{roundGpa(requiredAvg, precisionMode).toFixed(precisionMode)}/10</span> · {remaining} {t("common.credits")} → {roundGpa(state.targetGPA, precisionMode).toFixed(precisionMode)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className={cn("p-5", toneBg(advisory.tone))}>
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-80">Advisory</h3>
          <div className="mt-3 text-2xl font-bold">{advisory.label[lang]}</div>
          <div className="mt-1 text-sm opacity-80">{t("common.gpa")} {formatGpa(cumulative.gpa10)} / 10</div>
          <p className="mt-4 text-sm">{advisory.advice[lang]}</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <h3 className="text-sm font-semibold">{t("roadmap.distribution")}</h3>
          </div>
          <div className="p-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="letter" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="credits" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Credits" />
                  <Bar dataKey="subjects" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Subjects" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="py-2 text-left">{t("scale.letter")}</th><th>{t("common.subjects")}</th><th>{t("common.credits")}</th></tr>
                </thead>
                <tbody>
                  {distribution.map((d) => (
                    <tr key={d.letter} className="border-t border-border">
                      <td className="py-1.5 font-semibold">{d.letter}</td>
                      <td className="text-center tabular-nums">{d.subjects}</td>
                      <td className="text-center tabular-nums">{d.credits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("roadmap.stats")}</h3>
          <div className="mt-4 space-y-3">
            <StatRow label={t("roadmap.totalSubjects")} value={perfStats.totalSubjects} />
            <StatRow label={t("roadmap.perfect")} value={perfStats.perfect} tone="success" />
            <StatRow label={t("roadmap.over9")} value={perfStats.above9} tone="success" />
            <StatRow label={t("roadmap.over8")} value={perfStats.above8} tone="primary" />
            <StatRow label={t("roadmap.failed")} value={perfStats.failed} tone="destructive" />
          </div>
        </Card>
      </div>
    </>
  );
}

function toneBg(tone: "success" | "primary" | "warning" | "destructive") {
  return {
    success: "bg-success text-success-foreground",
    primary: "bg-primary text-primary-foreground",
    warning: "bg-warning text-warning-foreground",
    destructive: "bg-destructive text-destructive-foreground",
  }[tone];
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function StatRow({ label, value, tone }: { label: string; value: string | number; tone?: "success" | "primary" | "destructive" }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-base font-semibold tabular-nums",
          tone === "success" && "text-success",
          tone === "primary" && "text-primary",
          tone === "destructive" && "text-destructive",
        )}
      >
        {value}
      </span>
    </div>
  );
}
