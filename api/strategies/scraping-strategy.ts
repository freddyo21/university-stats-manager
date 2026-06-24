import { UitScrapingStrategy } from "../schools/uit";

export abstract class ScrapingStrategy {
    abstract getSchoolKey(): string;
}