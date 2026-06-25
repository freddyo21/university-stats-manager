import { ScrapingStrategy } from "../strategies/scraping-strategy.js";

export class HusScrapingStrategy extends ScrapingStrategy {
    getSchoolKey(): string {
        return "hus";
    }
}