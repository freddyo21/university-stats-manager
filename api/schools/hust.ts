import { ScrapingStrategy } from "../strategies/scraping-strategy.js";

export class HustScrapingStrategy extends ScrapingStrategy {
    getSchoolKey(): string {
        return "hust";
    }
}