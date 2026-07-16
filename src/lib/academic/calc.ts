import { Semester } from "@/entities/Semester";
import { Subject } from "@/entities/Subject";
import type { ILetterGradeRange } from "@/types/interfaces/ILetterGradeRange";
import type { TPresetId, TRetakeStrategy, TScoreInputMode } from "@/types/types";

/**
 * Tính toán điểm Trung bình chung toàn khóa lũy tiến (Gross GPA Global).
 * 
 * Hàm này duyệt qua toàn bộ danh sách học kỳ, thu thập tổng điểm trọng số và tổng tín chỉ thô
 * từ method `calculateGrossMetrics` của từng Class Semester con, sau đó thực hiện phép chia 
 * và làm tròn cứng về 2 chữ số thập phân duy nhất một lần ở cuối để triệt tiêu sai số.
 * Chế độ này tính tất cả mọi nỗ lực học (kể cả đạt và trượt), ngoại trừ môn Miễn học "exempt".
 * @param semesterInstances Mảng các đối tượng Instance của Class Semester
 * @param letterGrades Mảng cấu hình khoảng điểm quy đổi sang Hệ chữ (A+, B...)
 * @param presetId Cấu hình quy chế trường ("uit" hoặc "Custom", mặc định là "uit")
 * @returns Object chứa kết quả GPA toàn khóa hệ 10, hệ 4, hệ 100 và tổng số tín chỉ tính Gross
 */
export function calculateGlobalGross({
  semesterInstances,
  letterGrades,
  presetId = "uit",
  retakeStrategy = "highest"
}: {
  semesterInstances: Semester[],
  letterGrades: ILetterGradeRange[],
  presetId: TPresetId,
  retakeStrategy: TRetakeStrategy
}) {
  // Mảng chứa danh sách môn học cuối cùng sau khi đã xử lý lặp môn
  let effectiveSubjects: Subject[] = [];

  // Thu thập TẤT CẢ các môn học từ TẤT CẢ các học kỳ đã cào về
  const allGlobalSubjects = semesterInstances.flatMap((sem) => sem.subjects);

  // 🚀 BƯỚC 1: GOM NHÓM TẤT CẢ CÁC MÔN THEO MÃ MÔN TOÀN CỤC (Không bỏ sót môn nào)
  const globalSubjectGroups = new Map<string, Subject[]>();
  for (const sub of allGlobalSubjects) {
    let group = globalSubjectGroups.get(sub.code);
    if (!group) {
      group = [];
      globalSubjectGroups.set(sub.code, group);
    }
    group.push(sub);
  }

  // 🚀 BƯỚC 2: ÁP DỤNG CHIẾN THUẬT TRÊN TỪNG NHÓM MÔN HỌC
  for (const [_, allAttempts] of globalSubjectGroups.entries()) {
    // TH 1: Môn chỉ học đúng 1 lần duy nhất -> Ăn thẳng vào danh sách
    if (allAttempts.length === 1) {
      effectiveSubjects.push(allAttempts[0]);
      continue;
    }

    // TH 2: User ép TẤT CẢ các lượt học của mã môn này thành "normal" (Muốn tính song song như 2 môn khác nhau)
    const isAllNormal = allAttempts.every((s) => s.studyType === "normal");
    if (isAllNormal) {
      effectiveSubjects.push(...allAttempts);
      continue;
    }

    switch (retakeStrategy) {
      case "highest": {
        // Giữ lại lượt học có điểm hệ 10 cao nhất
        // Tối ưu hóa: Cache điểm số ngay trong lượt duyệt đầu tiên để tránh gọi lại hàm ở bước sau
        let maxAttempt = allAttempts[0];
        let maxScore = maxAttempt.calculateGPA10(presetId);

        for (let i = 1; i < allAttempts.length; i++) {
          const currentScore = allAttempts[i].calculateGPA10(presetId);
          if (currentScore !== null && (maxScore === null || currentScore > maxScore)) {
            maxAttempt = allAttempts[i];
            maxScore = currentScore;
          }
        }

        effectiveSubjects.push(maxAttempt);
        break;
      }

      case "latest": {
        // Lấy lượt học cuối cùng (Lượt push vào sau cùng trong mảng gốc)
        effectiveSubjects.push(allAttempts[allAttempts.length - 1]);
        break;
      }

      default:
        // Nếu chiến thuật không hợp lệ, mặc định giữ lượt học cuối cùng
        effectiveSubjects.push(allAttempts[allAttempts.length - 1]);
        break;
    }
  }

  console.log("Effective Subjects for Global Gross Calculation:", effectiveSubjects);

  let totalCredits = 0;
  let totalWeighted10 = 0;
  let totalWeighted4 = 0;
  let totalWeighted100 = 0;

  // 🚀 BƯỚC 3: TÍNH TOÁN TRÊN DANH SÁCH EFFECTIVE SUBJECTS ĐÃ LỌC SẠCH KHÔNG TRÙNG LẶP
  for (const sub of effectiveSubjects) {
    // Gọi cục 2 của Class Semester
    // const metrics = sem.calculateGrossMetrics(letterGrades, presetId);

    const metrics = sub.getSubjectMetrics(letterGrades, presetId);
    if (!metrics) continue;

    totalWeighted10 += metrics.weighted10;
    totalWeighted4 += metrics.weighted4;
    totalWeighted100 += metrics.weighted100;
    totalCredits += metrics.credits;

    // totalWeighted10 += metrics.weighted10;
    // totalWeighted4 += metrics.weighted4;
    // totalWeighted100 += metrics.weighted100;
    // totalCredits += metrics.creditsCount;
  }

  return {
    gpa10: totalCredits > 0 ? Math.round((totalWeighted10 / totalCredits) * 100) / 100 : null,
    gpa4: totalCredits > 0 ? Math.round((totalWeighted4 / totalCredits) * 100) / 100 : null,
    gpa100: totalCredits > 0 ? Math.round((totalWeighted100 / totalCredits) * 100) / 100 : null,
    credits: totalCredits
  };
}

/**
 * 🏆 Tính toán điểm Tích lũy tốt nghiệp toàn khóa (Cumulative CPA Global).
 * 
 * Hàm này gom dữ liệu thô từ method `calculateCumulativeMetrics` của các Class Semester con.
 * Áp dụng nghiêm ngặt quy chế đào tạo đại học:
 * - Chặn đứng và loại bỏ hoàn toàn các môn mang trạng thái Trả nợ "retake" để mẫu số tín chỉ không bị phình ảo.
 * - Chỉ tính điểm của những môn thực sự ĐẠT (Passed).
 * - Tách biệt kho tín chỉ Miễn học "exempt" để cộng dồn vào tổng số tín chỉ tích lũy xét tốt nghiệp cuối cùng.
 * 
 * Phép chia trung bình và làm tròn về 2 chữ số thập phân được thực hiện một lần duy nhất ở cuối quy trình.
 * @param semesterInstances Mảng các đối tượng Instance của Class Semester
 * @param letterGrades Mảng cấu hình khoảng điểm quy đổi sang Hệ chữ
 * @param subjectPassThreshold Điểm sàn để tính là qua môn (Ví dụ: 5.0)
 * @param componentPassEnabled Bật/Tắt tính năng xét điểm liệt thành phần
 * @param componentPassThreshold Thang điểm liệt thành phần (Ví dụ: 3.0 hoặc 4.0)
 * @param scoreInputMode Chế độ nhập điểm ("full" hoặc "gpaOnly")
 * @param presetId Cấu hình quy chế trường ("uit" hoặc "Custom", mặc định là "uit")
 * @returns Object chứa kết quả CPA toàn khóa hệ 10, hệ 4, hệ 100, tổng tín chỉ thực tế đạt và tín chỉ miễn học
 */
export function calculateGlobalCumulative({
  semesterInstances,
  letterGrades,
  subjectPassThreshold,
  componentThresholdEnabled,
  componentPassThreshold,
  scoreInputMode,
  presetId
}: {
  semesterInstances: Semester[],
  letterGrades: ILetterGradeRange[],
  subjectPassThreshold: number,
  componentThresholdEnabled: boolean,
  componentPassThreshold: number,
  scoreInputMode: TScoreInputMode,
  presetId: TPresetId
}) {
  let totalCredits = 0;
  let totalExemptCredits = 0;
  let totalWeighted10 = 0;
  let totalWeighted4 = 0;
  let totalWeighted100 = 0;

  for (const sem of semesterInstances) {
    // Gọi cục 3 của Class Semester
    const metrics = sem.calculateCumulativeMetrics(
      letterGrades,
      subjectPassThreshold,
      componentThresholdEnabled,
      componentPassThreshold,
      scoreInputMode,
      presetId
    );

    totalWeighted10 += metrics.weighted10;
    totalWeighted4 += metrics.weighted4;
    totalWeighted100 += metrics.weighted100;
    totalCredits += metrics.creditsCount;
    totalExemptCredits += metrics.exemptCreditsCount;
  }

  const finalCredits = totalCredits + totalExemptCredits;

  return {
    cpa10: totalCredits > 0 ? Math.round((totalWeighted10 / totalCredits) * 100) / 100 : null,
    cpa4: totalCredits > 0 ? Math.round((totalWeighted4 / totalCredits) * 100) / 100 : null,
    cpa100: totalCredits > 0 ? Math.round((totalWeighted100 / totalCredits) * 100) / 100 : null,
    credits: finalCredits,
    passedCredits: totalCredits,
    exemptCredits: totalExemptCredits
  };
}

// End new functions