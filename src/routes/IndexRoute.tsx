import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const GradeEntryPage = lazy(() => import("@/pages/index"));
const DataPage = lazy(() => import("@/pages/data"));
const GoalsPage = lazy(() => import("@/pages/goals"));
const HelpPage = lazy(() => import("@/pages/help"));
const RoadmapPage = lazy(() => import("@/pages/roadmap"));
const ScalePage = lazy(() => import("@/pages/scale"));

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