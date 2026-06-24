import type { VercelRequest, VercelResponse } from "@vercel/node";
import { StrategyFactory } from "./strategies/strategy-factory";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { domain } = req.query;

        if (!domain || typeof domain !== "string") {
            return res.status(400).json({ error: "Missing or invalid domain parameter" });
        }

        const factory = new StrategyFactory();
        const strategy = factory.getStrategy(domain);

        const schoolKey = strategy.getSchoolKey();

        return res.status(200).json({ schoolKey });

    } catch (error: any) {
        return res.status(404).json({ error: error.message || "Strategy not found" });
    }
}