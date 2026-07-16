import { I18nContext } from "@/contexts/I18nContext";
import { D } from "@/i18n/dict";
import type { Lang, ReplaceOptions, TranslationKey } from "@/i18n/i18n-types";
import { LANG_KEY } from "@/utils/constants";
import { useCallback, useState, type ReactNode } from "react";

// ============================================================================
// TypeScript Magic: Tiện ích chuyển đổi Object lồng thành chuỗi Dot-Notation Paths
// ============================================================================

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>(() => {
        try {
            const saved = localStorage.getItem(LANG_KEY) as Lang | null;
            if (saved === "en" || saved === "vi") return saved;
        } catch (error) {
            // Phòng hờ môi trường SSR hoặc trình duyệt chặn cookies
        }
        return "en";
    });

    const setLang = useCallback((l: Lang) => {
        setLangState(l);
        try {
            localStorage.setItem(LANG_KEY, l);
        } catch { }
    }, []);

    const t = useCallback((key: TranslationKey, replaceOptions?: ReplaceOptions) => {
        try {
            // 1. Tìm bản dịch dựa trên ngôn ngữ hiện tại
            const currentDict = D[lang];
            const keys = key.split(".");

            // Duyệt sâu qua từng tầng object theo mảng keys (ví dụ: ["common", "collapse", "all"])
            let result: any = currentDict;
            for (const k of keys) {
                if (result && Object.prototype.hasOwnProperty.call(result, k)) {
                    result = result[k];
                } else {
                    result = undefined;
                    break;
                }
            }

            // Xử lý kịch bản key DEFAULT thông minh: 
            // Nếu đích đến cuối cùng vẫn là một object (do lồng lớp), tự động chọc tiếp vào node DEFAULT nếu có
            if (result && typeof result === "object" && "DEFAULT" in result) {
                result = result["DEFAULT"];
            }

            // Fallback về chính cái key nếu không tìm thấy chuỗi string hợp lệ
            let template = typeof result === "string" ? result : String(key);

            // 2. Nếu có truyền biến nội suy, tiến hành quét lặp qua để replace
            if (replaceOptions) {
                Object.keys(replaceOptions).forEach((variableName) => {
                    const targetValue = replaceOptions[variableName];
                    const regex = new RegExp(`\\{${variableName}\\}`, "g");
                    template = template.replace(regex, String(targetValue));
                });
            }

            return template;
        } catch (error) {
            return String(key);
        }
    }, [lang]);

    return (
        <I18nContext.Provider value={{ lang, setLang, t }}>
            {children}
        </I18nContext.Provider>
    );
}