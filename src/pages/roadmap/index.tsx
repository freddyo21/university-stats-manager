import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, GraduationCap, BookCheck, BookMinus, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/Header";
import { useI18n } from "@/i18n/use-i18n";
import { useAcademicStore } from "@/hooks/useAcademicStore";
import { ScaleSwitcher } from "@/components/shared/ScaleSwitcher";
import type { ScoreTone } from "@/types/types";
import { StatRow } from "./components/StatRow";
import { MetricCard } from "./components/MetricCard";
import { classify, formatGpa } from "./helpers/helpers";
import { roundToPrecision } from "@/utils/helpers";
import { calculateGlobalCumulative } from "@/lib/academic/calc";
import type { Subject } from "@/entities/Subject";

export default function RoadmapPage() {
  const { state, update } = useAcademicStore();
  const { t, lang } = useI18n();

  const cumulative = useMemo(() => {
    return calculateGlobalCumulative({
      semesterInstances: state.semesters,
      letterGrades: state.letterGrades,
      subjectPassThreshold: state.subjectPassThreshold,
      componentThresholdEnabled: state.componentThresholdEnabled,
      componentPassThreshold: state.componentPassThreshold,
      scoreInputMode: state.scoreInputMode,
      presetId: state.presetId
    });
  }, [
    state.semesters,
    state.letterGrades,
    state.subjectPassThreshold,
    state.componentThresholdEnabled,
    state.componentPassThreshold,
    state.scoreInputMode,
    state.presetId
  ]);

  // Giải cấu trúc (Destructuring) ra các biến để xài trực tiếp ở UI bên dưới không cần sửa code giao diện
  const accumulated = cumulative.credits; // Đây chính là số tín chỉ tích lũy (gồm cả Passed + Exempt)

  const currentCPA = useMemo(() => {
    if (state.activeScale === "4") return cumulative.cpa4 ?? 0;
    if (state.activeScale === "100") return cumulative.cpa100 ?? 0;
    return cumulative.cpa10 ?? 0;
  }, [state.activeScale, cumulative]);

  // Số tín chỉ còn lại cần phải tích lũy để ra trường
  const remainingCredits = Math.max(0, state.totalCourseCredits - accumulated);

  /**
   * Tính toán điểm trung bình tích lũy cần thiết trên mỗi tín chỉ còn lại
   * để đạt được mục tiêu điểm tốt nghiệp (Target GPA).
   * 
   * Hàm này tự động bóc tách số tín chỉ miễn học (Exempt Credits) ra khỏi 
   * cả tổng điểm mục tiêu và tổng điểm hiện tại nhằm đảm bảo tính chính xác 
   * theo quy chế đào tạo tín chỉ, tránh lỗi phóng đại điểm số.
   * 
   * @returns {number | null} Điểm trung bình cần đạt (làm tròn 2 chữ số thập phân), 
   *                          hoặc null nếu không còn tín chỉ nào cần tích lũy.
   */
  const requiredAvg = useMemo(() => {
    // Nếu không còn tín chỉ nào cần tích lũy, trả về null (không cần tính toán)
    if (remainingCredits <= 0) return null;

    const passedCredits = cumulative.passedCredits ?? 0;
    const exemptCredits = cumulative.exemptCredits ?? 0;

    // Tổng số tín chỉ thực tế phải cày điểm
    const totalCreditsToGrade = state.totalCourseCredits - exemptCredits;

    // 🎯 STEP 1: Lấy chính xác điểm CPA hiện tại khớp với hệ điểm đang chọn
    const targetGPA = state.targetGPA ?? 0;

    // 🎯 STEP 2: Làm toán trực tiếp trên hệ điểm hiện tại để triệt tiêu sai số quy đổi
    const totalPointsNeeded = targetGPA * totalCreditsToGrade;
    const currentPointsEarned = currentCPA * passedCredits;

    // 🎯 Điểm trung bình cần thiết cho các môn còn lại
    const rawCPARequired = (totalPointsNeeded - currentPointsEarned) / remainingCredits;

    return state.activeScale === "100"
      ? Math.round(rawCPARequired)
      : Math.round(rawCPARequired * 100) / 100;
    // return Math.max(0, Math.min(10, Math.round(rawCPARequired * 100) / 100));
  }, [currentCPA, cumulative, state.targetGPA, state.totalCourseCredits, state.activeScale, remainingCredits]);

  // Phân phối số lượng môn học và tín chỉ theo hệ chữ (Bảng phân phối điểm - Distribution)
  const distribution = useMemo(() => {
    const buckets: Record<string, { letter: string; subjects: number; credits: number }> = {};

    // Khởi tạo các bucket điểm chữ dựa trên bảng cấu hình trường (A+, B, C...)
    for (const r of state.letterGrades) {
      buckets[r.letter] = { letter: r.letter, subjects: 0, credits: 0 };
    }

    // Khởi tạo riêng bucket "M" đại diện cho môn Miễn học (Exempt)
    const exemptLabel = t("common.exemptShort");
    buckets["M"] = { letter: exemptLabel, subjects: 0, credits: 0 };

    // Duyệt qua hệ thống Class Instance sạch sẽ
    for (const s of state.semesters) {
      for (const sub of s.subjects) {
        // Check trạng thái miễn học chuẩn Class OOP
        if (sub.studyType === "exempt") {
          buckets["M"].subjects += 1;
          buckets["M"].credits += sub.credits;
          continue;
        }

        // Gọi method nội tại của Class Subject để lấy điểm hệ 10 sạch
        const rawScore = sub.calculateGPA10(state.presetId);
        if (rawScore === null) continue;

        // Gọi method nội tại của Class Subject để tra điểm chữ, không phụ thuộc helper ngoài
        const letter = sub.getLetterGrade(state.letterGrades);

        if (!buckets[letter]) {
          buckets[letter] = { letter, subjects: 0, credits: 0 };
        }

        // Cập nhật số lượng môn học và tín chỉ vào bucket tương ứng
        buckets[letter].subjects += 1;
        buckets[letter].credits += sub.credits;
      }
    }

    return Object.values(buckets);
  }, [
    state.semesters,
    state.letterGrades,
    state.presetId,
    t
  ]);

  /**
   * Tính toán các thống kê hiệu suất học tập.
   * 
   * @returns {Object} Đối tượng chứa các thống kê về hiệu suất học tập.
   */
  const perfStats = useMemo(() => {
    let perfect = 0;
    let green = 0,
      blue = 0,
      amber = 0,
      red = 0;
    let exemptSubjects = 0,
      inProgress = 0;

    // Map quản lý lượt ĐẠT cao nhất/mới nhất để đếm số môn học độc lập
    const passedSubjectsMap = new Map<string, Subject>();
    // Set để đếm xem có bao nhiêu mã môn đã từng bị trượt ít nhất 1 lần trong đời
    const failedSubjectCodes = new Set<string>();

    const allGlobalSubjects = state.semesters.flatMap((sem) => sem.subjects);

    // 🚀 BƯỚC 1: Gom môn học độc lập theo chiến thuật (Strategy) trực tiếp, không qua helper ngoài
    for (const sub of allGlobalSubjects) {
      if (sub.studyType === "exempt") {
        exemptSubjects++;
        continue;
      }

      const rawScore = sub.calculateGPA10(state.presetId);
      if (rawScore === null) {
        inProgress++;
        continue;
      }

      // 🎯 ĐIỀU KIỆN BIÊN KHOẢN 3 ĐIỀU 24: Dưới 5.0 là TRƯỢT MÔN
      if (rawScore < 5.0) {
        red++; // Ghi nhận ngay 1 lần trượt vào lịch sử, không gạt đi đâu hết!
        failedSubjectCodes.add(sub.canonicalCode);
        continue;
      }

      // Nếu là môn ĐẠT (>= 5.0), áp dụng chiến thuật lọc trùng để giữ lại lượt tốt nhất
      const code = sub.canonicalCode;
      const existing = passedSubjectsMap.get(code);

      if (!existing) {
        passedSubjectsMap.set(code, sub);
        continue;
      }

      const currentScore = rawScore;
      const existingScore = existing.calculateGPA10(state.presetId);

      if (state.retakeStrategy === "latest") {
        passedSubjectsMap.set(code, sub);
      } else {
        // Mặc định hoặc "highest": Giữ lượt đạt điểm cao hơn
        if ((currentScore ?? -Infinity) > (existingScore ?? -Infinity)) {
          passedSubjectsMap.set(code, sub);
        }
      }
    }

    for (const sub of passedSubjectsMap.values()) {
      const score = sub.calculateGPA10(state.presetId)!;

      if (score === 10.0) {
        perfect++;
      } else if (score >= 8.0) {
        green++;
      } else if (score >= 6.5) {
        blue++;
      } else if (score >= 5.0) {
        amber++;
      }
    }

    let standaloneFailedCount = 0;
    for (const failedCode of failedSubjectCodes) {
      if (!passedSubjectsMap.has(failedCode)) {
        standaloneFailedCount++;
      }
    }

    const totalSubjects = passedSubjectsMap.size + standaloneFailedCount + exemptSubjects;

    return { perfect, green, blue, amber, red, totalSubjects, exemptSubjects, inProgress };
  }, [
    state.semesters,
    state.retakeStrategy,
    state.presetId
  ]);

  // const precisionMode = state.precisionMode;
  const advisory = useMemo(() => {
    // currentGPA lấy từ useMemo tính toán trực tiếp theo hệ hiển thị đã làm ở câu trước
    return classify(currentCPA, state.activeScale);
  }, [currentCPA, state.activeScale]);

  // const targetCPA = formatGpa(state.activeScale === "10" ? state.targetGPA : state.activeScale === "4" ? state.targetGPA / 2.5 : state.targetGPA * 10);

  return (
    <>
      <PageHeader title={t("roadmap.title")} description={t("roadmap.desc")} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Simulator</h3>
            <ScaleSwitcher />
          </div>
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
            <MetricCard icon={GraduationCap} label={t("roadmap.currentGpa")} value={formatGpa(currentCPA)} />
            <MetricCard icon={BookCheck} label={t("roadmap.passedCredits")} value={String(accumulated)} />
            <MetricCard icon={BookMinus} label={t("roadmap.remaining")} value={String(remainingCredits)} />
            <MetricCard icon={Target} label={t("common.target")} value={formatGpa(roundToPrecision(state.targetGPA, 2))} />
          </div>

          <div className="mt-5 rounded-lg border border-accent/30 bg-accent/5 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{t("roadmap.required")}</div>
                {(() => {
                  // 🎯 QUY ĐỔI CPA HIỆN TẠI SANG HỆ ĐIỂM ĐANG HIỂN THỊ ĐỂ SO SÁNH ĐỒNG BỘ
                  const currentCPAInActiveScale = cumulative.cpa10 !== null
                    ? (cumulative.cpa10 / 10) * Number(state.activeScale)
                    : 0;

                  const formattedCurrentCPA = roundToPrecision(currentCPAInActiveScale, 2);
                  const formattedTargetGPA = roundToPrecision(state.targetGPA, 2);

                  // TRƯỜNG HỢP 1: Đã học xong toàn bộ tín chỉ (Không còn tín chỉ còn lại)
                  if (requiredAvg === null) {
                    return (
                      <p className="text-sm text-muted-foreground">
                        {formattedCurrentCPA >= formattedTargetGPA
                          ? t("roadmap.secured")
                          : t("roadmap.unreachable")}
                      </p>
                    );
                  }

                  // TRƯỜNG HỢP 2: Mục tiêu bất khả thi (Điểm trung bình cần cày vượt quá max thang điểm)
                  if (requiredAvg > Number(state.activeScale)) {
                    return (
                      <p className="text-sm text-destructive">
                        {t("roadmap.unreachable")} (need {roundToPrecision(requiredAvg, 2).toFixed(2)}/{state.activeScale})
                      </p>
                    );
                  }

                  // TRƯỜNG HỢP 3: Đã chắc suất đạt mục tiêu (Điểm cần cày nhỏ hơn 0, nghĩa là chơi chơi cũng đủ điểm ra trường)
                  if (requiredAvg < 0) {
                    return (
                      <p className="text-sm text-success">
                        {t("roadmap.secured")}
                      </p>
                    );
                  }

                  // TRƯỜNG HỢP 4: Hiển thị điểm số cần cày bình thường
                  return (
                    <p className="text-sm">
                      <span className="font-bold text-accent">
                        {roundToPrecision(requiredAvg, 2).toFixed(2)}/{state.activeScale}
                      </span>
                      {" · "}
                      {remainingCredits}
                      {" "}
                      {t("common.credits.DEFAULT")}
                      {" → "}
                      {formattedTargetGPA.toFixed(2)}
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
        </Card>

        <Card className={cn("p-5", toneBg(advisory.tone))}>
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-80">Advisory</h3>
          <div className="mt-3 text-2xl font-bold">{advisory.label[lang]}</div>
          <div className="mt-1 text-sm opacity-80">{t("common.gpa")} {formatGpa(currentCPA)} / {Number(state.activeScale)}</div>
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
                  <Tooltip contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 12
                  }} />
                  <Bar dataKey="credits" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Credits" />
                  <Bar dataKey="subjects" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Subjects" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="py-2 text-left">{t("scale.letter")}</th><th>{t("common.subjects")}</th><th>{t("common.credits.DEFAULT")}</th></tr>
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
            <StatRow label={t("roadmap.totalSubjects")} value={perfStats.totalSubjects} tone="primary" />
            <StatRow label={t("roadmap.exemptSubjects")} value={perfStats.exemptSubjects} tone="success" />
            <StatRow label={t("roadmap.inProgress")} value={perfStats.inProgress} tone="muted" />
            <StatRow label={t("roadmap.perfect")} value={perfStats.perfect} tone="success" />
            <StatRow label="80% - 99%" value={perfStats.green} tone="success" />
            <StatRow label="65% - 79%" value={perfStats.blue} tone="accent" />
            <StatRow label="50% - 64%" value={perfStats.amber} tone="warning" />
            <StatRow label="< 50%" value={perfStats.red} tone="destructive" />
          </div>
        </Card>
      </div>
    </>
  );
}

function toneBg(tone: ScoreTone) {
  return {
    muted: "bg-card text-foreground",
    success: "bg-success text-success-foreground",
    info: "bg-info text-info-content",
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
    warning: "bg-warning text-warning-foreground",
    error: "bg-error text-error-content",
    destructive: "bg-destructive text-destructive-foreground",
  }[tone];
}