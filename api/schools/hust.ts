import { ScrapingStrategy } from "../strategies/scraping-strategy";

export class HustScrapingStrategy extends ScrapingStrategy {
    getSchoolKey(): string {
        return "hust";
    }
}