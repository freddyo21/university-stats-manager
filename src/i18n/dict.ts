// Import file JSON thô bằng cú pháp chuẩn hệ thống của ông
import viLocale from "./locales/vi.json" with { type: "json" };
import enLocale from "./locales/en.json" with { type: "json" };

// Khởi tạo Type dựa trên chính cấu trúc tự động của file JSON mẫu
export type DictionarySchema = typeof viLocale;

// Từ nay biến D của ông sẽ an tâm sử dụng mà không lo mất Type
export const D: Record<"vi" | "en", DictionarySchema> = {
    "vi": viLocale,
    "en": enLocale,
};