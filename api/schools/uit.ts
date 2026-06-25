import { ScrapingStrategy } from "../strategies/scraping-strategy.js";

export class UitScrapingStrategy extends ScrapingStrategy {
    getSchoolKey(): string {
        return "uit";
    }
}