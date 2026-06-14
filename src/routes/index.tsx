import { Routes, Route } from 'react-router-dom';
import { IndexRoutes } from './IndexRoute';
import { Layout } from '@/layouts/Layout';

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

// Helper function to recursively render routes from config
function renderRoutes(routesArray: any) {
    return routesArray.map((route: any, idx: number) => {
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