import { ScrapingStrategy } from "../strategies/scraping-strategy";

export class UitScrapingStrategy extends ScrapingStrategy {
    getSchoolKey(): string {
        return "uit";
    }
}