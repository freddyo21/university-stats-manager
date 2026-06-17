import { Routes, Route } from 'react-router-dom';
import { IndexRoutes } from './IndexRoute';
import { Layout } from '@/layouts/Layout';
import type { ReactNode } from 'react';

const routesConfig = [
    {
        path: "/*",
        element: (
            <Layout />
        ),
        children: [
            { path: "*", element: <IndexRoutes /> }
        ]
    }
];

interface CustomRouteObject {
    path?: string;
    index?: boolean;
    element: ReactNode;
    children?: CustomRouteObject[];
}

// Helper function to recursively render routes from config
function renderRoutes(routesArray: CustomRouteObject[]) {
    return routesArray.map((route: CustomRouteObject, idx: number) => {
        if (route.index) {
            return <Route key={`route-${idx}`} index element={route.element} />;
        }
        if (route.children) {
            return (
                <Route
                    key={`route-${idx}`}
                    path={route.path}
                    element={route.element}
                >
                    {renderRoutes(route.children)}
                </Route>
            );
        }
        return (
            <Route
                key={`route-${idx}`}
                path={route.path}
                element={route.element}
            />
        );
    });
}

export function RoutesConfig() {
    return (
        <Routes>
            {renderRoutes(routesConfig)}
        </Routes>
    );
}