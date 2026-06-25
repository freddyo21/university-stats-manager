import schools from "./universities.json" with { type: "json" };
import { ScrapingStrategy } from "./scraping-strategy.js";
import { UitScrapingStrategy } from "../schools/uit.js";

export class StrategyFactory {
    // Registry nằm ở đây là chuẩn bài, tách biệt hoàn toàn với lớp chiến thuật
    private registry: Record<string, ScrapingStrategy> = {
        "uit": new UitScrapingStrategy(),
        // "hust": new HustScrapingStrategy()
    };

    getStrategy(domain: string): ScrapingStrategy {
        // 1. Tìm trường trong file JSON cấu hình bằng domain
        const school = schools.find((s) => s.link.includes(domain) && s.isActive);

        if (!school) {
            throw new Error("Trường học này chưa được hệ thống hỗ trợ hoặc đang bảo trì!");
        }

        // 2. Lấy strategy tương ứng từ registry
        const strategy = this.registry[school.id];
        if (!strategy) {
            throw new Error(`Cấu hình lỗi: Thiếu lớp xử lý cho trường ${school.name}`);
        }

        return strategy;
    }
}