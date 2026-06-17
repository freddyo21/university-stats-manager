# Study Stats Suite - Core Grading Logic Engine

Bộ thư viện xử lý và tính toán chỉ số học tập (GPA/CPA) nâng cao dành cho sinh viên, được tối ưu hóa theo quy chế đào tạo tín chỉ đại chúng và cấu hình linh hoạt theo từng trường Đại học (ví dụ: UIT).

## 🚀 Tính năng cốt lõi

- **Fix triệt để lỗi dấu phẩy động (Floating-point):** Loại bỏ hoàn toàn hiện tượng hụt điểm hệ 10 khi làm tròn các mốc sát nút như `5.85 -> 5.8` hay `7.95 -> 7.9` của JavaScript.
- **Phân tách rạch ròi GPA và CPA:**
  - **Điểm trung bình học kỳ (GPA):** Tính tất cả các môn đã đăng ký trong kỳ, bao gồm cả các môn bị trượt để phản ánh đúng năng lực học kỳ.
  - **Điểm trung bình tích lũy (CPA):** Chỉ tính các môn đã đạt (`Pass`). Các môn trượt sẽ bị loại bỏ hoàn toàn khỏi tử số và mẫu số tích lũy cho đến khi có điểm học lại.
- **Xử lý trọn vẹn môn điểm miễn:** Tự động đếm và cộng số tín chỉ đã miễn vào tổng số tín chỉ tích lũy toàn khóa, nhưng cô lập hoàn toàn điểm số (`null`) khỏi bộ chia trung bình GPA/CPA.
- **Dynamic Precision Mode:** Hỗ trợ cấu hình động số chữ số thập phân hiển thị (1 hoặc 2 chữ số) linh hoạt từ State UI xuống tầng core util.
- **Không Hardcode Thang Điểm:** Loại bỏ hoàn toàn việc hardcode thang điểm cố định, chuyển sang cơ chế quét khoảng điểm động theo cấu hình riêng biệt của từng trường đại học khi runtime.

## 🛠️ Thiết kế Kiến trúc (Design Patterns)

Dự án áp dụng các mẫu thiết kế chuẩn mực để đảm bảo code clean, dễ scale và bảo trì:

1. **Facade Pattern:** Toàn bộ logic tính toán phân bố điểm chữ (`computeDistribution`) và thống kê hiệu suất chuyên sâu (`computePerformance`) được gom vào giao diện `GradeStatsFacade`. Tầng UI Component chỉ việc gọi Facade, che giấu hoàn toàn các vòng lặp lồng nhau phức tạp bên dưới.
2. **Strategy Pattern:** Cơ chế quy đổi điểm và dò mốc học bổng/mục tiêu thay đổi thuật toán linh hoạt dựa trên trạng thái cấu hình thang điểm (`activeScale: "10" | "4" | "100"`).

## 📂 Mã nguồn Logic Tính Toán Cốt Lõi

Hệ thống tính toán phân tách cấu trúc minh bạch qua các hàm chính trong `calc.ts`:

```typescript
// Tính điểm tổng kết học phần hệ 10 kèm xử lý an toàn dấu phẩy động
export function subjectScore10(subject: Subject, precision: number = 2): number | null;

// Tính GPA học kỳ hệ 10 (Bao gồm cả môn trượt)
export function semesterGPA10(s: Semester, ...): { gpa10: number | null; credits: number; ... };

// Tính CPA tích lũy hệ 4 (Loại bỏ môn trượt, đếm kèm môn miễn chỉ)
export function cumulativeGPA4(semesters: Semester[], letterGrades: LetterGradeRange[], ...): { gpa4: number | null; credits: number; ... };
```

## 📦 Lệnh triển khai dự án
Chạy kiểm tra cú pháp strict-type của TypeScript và đóng gói ứng dụng:

```bash
# Kiểm tra lỗi biên dịch Type và Build Production
npm run build
# Hoặc chạy thủ công qua bộ công cụ
tsc -b && vite build
```

## 📝 Quy chuẩn đóng góp mã nguồn (Contribution Guidelines)
* Strict TypeScript: Luôn khai báo kiểu dữ liệu tường minh, không lạm dụng kiểu any rác.


## 📬 Liên hệ & Hỗ trợ (Contact)

Nếu bạn có bất kỳ câu hỏi, góp ý hoặc phát hiện lỗ hổng logic/bảo mật nào trong bộ mã nguồn tính toán này, vui lòng liên hệ qua các kênh sau:

- **Người phát triển:** Bùi Duy Anh (Freddy)
- **Email liên hệ:** <a href="mailto:freddy.preo21@gmail.com">freddy.preo21@gmail.com</a>
- **GitHub:** [Tại đây](https://github.com/freddyo21)
- **LinkedIn:** [Tại đây](https://www.linkedin.com/in/freddy0605/)
- **Số điện thoại:** <a href="tel:0984528986">0984528986</a>
- **Lĩnh vực hoạt động:** Backend Development & Information Security (Red Team Operations)
- **Tổ chức/Trường học:** Trường Đại học Công nghệ Thông tin, ĐHQG TP.HCM (UIT)

---
*Dự án được xây dựng và phát triển với mục tiêu tối ưu hóa hiệu suất quản lý học tập cá nhân, cam kết tuân thủ các quy chuẩn clean code và thiết kế hệ thống hướng đối tượng.*