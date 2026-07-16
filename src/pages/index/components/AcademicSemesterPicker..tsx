import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo } from "react";

interface AcademicSemesterPickerProps {
    value: string | undefined; // Nhận mã ID học kỳ hiện tại (ví dụ: 20261) từ state/store phía trên
    onChange: (semesterId: string) => void; // Hàm tự động cập nhật data khi có thay đổi
}

export function AcademicSemesterPicker({ onChange, value }: AcademicSemesterPickerProps) {
    // 🎯 1. LẤY ĐỘNG NĂM HIỆN TẠI (Năm 2026) VÀ GIỚI HẠN XUỐNG 2000
    const currentYear = new Date().getFullYear();
    const MIN_YEAR = 2000;

    // 🎯 2. TỰ ĐỘNG SINH DẢI NĂM CHO BỘ CUỘN (Từ năm hiện tại lùi về quá khứ)
    const yearsRange = useMemo(() => {
        const years: number[] = [];
        for (let y = currentYear; y >= MIN_YEAR; y--) {
            years.push(y);
        }
        return years;
    }, [currentYear]);

    // 🎯 3. PHÂN TÍCH VALUE GỐC (20261) THÀNH NĂM VÀ HỌC KỲ ĐỂ BIND LÊN SELECT
    // Nếu chưa có value hoặc value lỗi, mặc định sẽ văng về Năm hiện tại + Kỳ 1
    const { startYear, term } = useMemo(() => {
        const valStr = String(value);
        if (valStr.length === 5) {
            return {
                startYear: parseInt(valStr.substring(0, 4), 10),
                term: parseInt(valStr.substring(4), 10)
            };
        }
        return { startYear: currentYear, term: 1 };
    }, [value, currentYear]);

    // 🎯 4. TỰ ĐỘNG KHỞI TẠO GIÁ TRỊ GỐC (NĂM GẦN NHẤT - HỌC KỲ 1) NẾU CHƯA CÓ DỮ LIỆU
    useEffect(() => {
        if (!value) {
            const defaultId = `${currentYear}1`;
            onChange(defaultId);
        }
    }, [value, currentYear, onChange]);

    // 🎯 5. HÀM KÍCH HOẠT TỰ ĐỘNG LƯU KHI USER THAY ĐỔI TÙY CHỌN
    const handleYearChange = (yearStr: string) => {
        const newId = `${yearStr}${term}`;
        onChange(newId);
    };

    const handleTermChange = (termStr: string) => {
        const newId = `${startYear}${termStr}`;
        onChange(newId);
    };

    return (
        <div className="flex items-center gap-4 bg-transparent p-0 text-sm">
            {/* SELECT CHỌN NĂM BẮT ĐẦU */}
            <div className="flex items-center gap-1">
                <Select
                    value={String(startYear)}
                    onValueChange={handleYearChange}
                >
                    {/* border-none shadow-none bg-transparent loại bỏ hoàn toàn dấu vết khung viền */}
                    <SelectTrigger className="w-fit border-none shadow-none bg-transparent p-0 h-auto focus:ring-0 font-medium">
                        <SelectValue placeholder="Năm" />
                    </SelectTrigger>
                    <SelectContent className="max-h-50">
                        {yearsRange.map((year) => (
                            <SelectItem key={year} value={String(year)}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Hiển thị niên khóa phụ trợ dạng text thuần túy */}
                <span className="text-muted-foreground font-mono">
                    {` - ${startYear + 1}`}
                </span>
            </div>

            <span className="text-muted-foreground/50">|</span>

            {/* SELECT CHỌN SỐ HỌC KỲ */}
            <Select
                value={String(term)}
                onValueChange={handleTermChange}
            >
                <SelectTrigger className="w-fit border-none shadow-none bg-transparent p-0 h-auto focus:ring-0 font-medium">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">Học kỳ 1</SelectItem>
                    <SelectItem value="2">Học kỳ 2</SelectItem>
                    <SelectItem value="3">Học kỳ hè</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};