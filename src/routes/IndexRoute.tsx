import { GradeEntryPage } from "@/pages";
import { DataPage } from "@/pages/data";
import { GoalsPage } from "@/pages/goals";
import { HelpPage } from "@/pages/help";
import { RoadmapPage } from "@/pages/roadmap";
import { ScalePage } from "@/pages/scale";
import { Navigate, Route, Routes } from "react-router-dom";

export const IndexRoutes = () => {

    return (
        <Routes>
            <Route index element={<GradeEntryPage />} />
            <Route path="scale" element={<ScalePage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="data" element={<DataPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}