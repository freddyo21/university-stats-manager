import { Card } from "@/components/ui/card";
import { BookOpen, Calculator, Download, Shield, Sliders, Target } from "lucide-react";
import { PageHeader } from "@/components/Header";
import { useI18n } from "@/hooks/use-i18n";

type Section = {
  icon: React.ComponentType<{ className?: string }>;
  title: { en: string; vi: string };
  body: { en: string; vi: string }[];
};

const sections: Section[] = [
  {
    icon: BookOpen,
    title: { en: "1. Add semesters & subjects", vi: "1. Thêm học kỳ & môn" },
    body: [
      { en: "Open Grade Entry, click Add Semester, rename it inline.", vi: "Mở Nhập điểm, bấm Thêm học kỳ, đổi tên trực tiếp." },
      { en: "Inside each semester, add subjects with code, name, credits and four components.", vi: "Trong mỗi kỳ, thêm môn với mã, tên, tín chỉ và 4 thành phần." },
      { en: "When all required components are filled, the live GPA preview appears.", vi: "Khi điền đủ các cột bắt buộc, GPA hiển thị tức thời." },
    ],
  },
  {
    icon: Sliders,
    title: { en: "2. Configure component weights", vi: "2. Cấu hình trọng số thành phần" },
    body: [
      { en: "Each subject sets its own Process / Midterm / Practice / Final weights, totaling 100%.", vi: "Mỗi môn có trọng số Quá trình / Giữa kỳ / Thực hành / Cuối kỳ, tổng = 100%." },
      { en: "If a weight is 0%, its score input is strictly disabled.", vi: "Nếu trọng số = 0%, ô điểm sẽ bị khóa hoàn toàn." },
      { en: "Scores are clamped to 0–10 automatically.", vi: "Điểm tự giới hạn trong khoảng 0–10." },
    ],
  },
  {
    icon: Calculator,
    title: { en: "3. Define grading scale & thresholds", vi: "3. Thiết lập thang điểm & mốc" },
    body: [
      { en: "Use Grading Scale tab to edit letter boundaries and Scale 4 mapping.", vi: "Dùng tab Thang điểm để chỉnh khoảng chữ & ánh xạ Hệ 4." },
      { en: "Set Subject Passing Threshold in Grade Entry → Settings (e.g. 4.0 HUST, 5.0 UIT).", vi: "Đặt mốc đậu môn ở Nhập điểm → Cài đặt (vd 4.0 HUST, 5.0 UIT)." },
      { en: "Enable Component-level pass (Liệt) and set a single threshold shared by all components.", vi: "Bật Liệt thành phần và đặt một mốc chung cho mọi thành phần." },
    ],
  },
  {
    icon: Target,
    title: { en: "4. Plan with Goals & Roadmap", vi: "4. Lập kế hoạch với Mục tiêu & Lộ trình" },
    body: [
      { en: "Semester Goals: pick a semester, set target GPA, see scholarship flag.", vi: "Mục tiêu kỳ: chọn kỳ, đặt GPA mục tiêu, xem học bổng." },
      { en: "Roadmap: enter graduation target & total credits; see the required average for remaining credits.", vi: "Lộ trình: nhập GPA tốt nghiệp & tổng tín chỉ; xem GPA trung bình cần đạt." },
    ],
  },
  {
    icon: Download,
    title: { en: "5. Backup & restore", vi: "5. Sao lưu & khôi phục" },
    body: [
      { en: "Data & Privacy tab: Export downloads a JSON snapshot; Import replaces current data.", vi: "Tab Dữ liệu & Riêng tư: Xuất tải JSON; Nhập sẽ thay thế dữ liệu hiện tại." },
    ],
  },
  {
    icon: Shield,
    title: { en: "6. Privacy", vi: "6. Riêng tư" },
    body: [
      { en: "All data lives in localStorage. Nothing leaves your device.", vi: "Mọi dữ liệu trong localStorage. Không gửi đi đâu cả." },
    ],
  },
];

export function HelpPage() {
  const { lang, t } = useI18n();
  return (
    <>
      <PageHeader title={t("nav.help")} description={lang === "vi" ? "Hướng dẫn từng bước." : "Step-by-step manual."} />
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title.en} className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold">{s.title[lang]}</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {s.body.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{b[lang]}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}
