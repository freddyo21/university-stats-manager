import { I18nContext } from "@/contexts/I18nContext";
import { D } from "@/lib/academic/i18n";
import type { Lang, ReplaceOptions } from "@/types/interfaces/i18n";
import { LANG_KEY } from "@/utils/constants";
import { useCallback, useState, type ReactNode } from "react";

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>(() => {
        try {
            const saved = localStorage.getItem(LANG_KEY) as Lang | null;
            if (saved === "en" || saved === "vi") return saved;
        } catch (error) {
            // Bọc phòng hờ môi trường SSR hoặc trình duyệt chặn cookies
        }
        return "en";
    });

    const setLang = useCallback((l: Lang) => {
        setLangState(l);
        try {
            localStorage.setItem(LANG_KEY, l);
        } catch { }
    }, []);

    const t = useCallback((key: keyof typeof D, replaceOptions?: ReplaceOptions) => {
        // 1. Trích xuất chuỗi thô theo ngôn ngữ, nếu không tìm thấy thì fallback về chính cái key
        let template = D[key]?.[lang] ?? String(key);

        // 2. Nếu có truyền object các từ cần thay thế, tiến hành quét lặp qua để replace
        if (replaceOptions) {
            Object.keys(replaceOptions).forEach((variableName) => {
                const targetValue = replaceOptions[variableName];
                // Tạo Regex động để tìm kiếm tất cả các cụm nằm trong ngoặc nhọn, ví dụ: {number}
                const regex = new RegExp(`\\{${variableName}\\}`, "g");
                template = template.replace(regex, String(targetValue));
            });
        }

        return template;
    }, [lang]);

    return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}