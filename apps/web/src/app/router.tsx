import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";
import { useSession } from "../shared/session";
import { Loading, Button } from "../shared/ui";
import { es } from "../shared/i18n";
const Admin = lazy(() => import("./AdminLayout"));
const Login = lazy(() => import("../pages/LoginPage"));
const Events = lazy(() => import("../pages/EventsPage"));
const Dashboard = lazy(() => import("../pages/DashboardPage"));
const Detail = lazy(() => import("../pages/EventDetailPage"));
const Feedback = lazy(() => import("../pages/FeedbackPage"));
const Products = lazy(() => import("../pages/ProductsPage"));
const Analytics = lazy(() => import("../pages/AnalyticsPage"));
const Staff = lazy(() => import("../pages/StaffPage"));
function Boundary() {
  return (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  );
}
function RequireAdmin() {
  const demo = useSession((s) => s.adminDemo);
  return demo ? <Admin /> : <Navigate to="/admin/login" replace />;
}
function RequireStaff() {
  const demo = useSession((s) => s.staffDemo);
  const location = useLocation();
  return demo ? (
    <Staff key={location.pathname + location.search} />
  ) : (
    <Navigate to="/staff/login" replace />
  );
}
export const router = createBrowserRouter([
  {
    element: <Boundary />,
    errorElement: (
      <div className="empty-state">
        <h1>{es.error}</h1>
        <Button onClick={() => window.location.assign("/")}>{es.retry}</Button>
      </div>
    ),
    children: [
      { path: "/", element: <Navigate to="/admin/login" replace /> },
      { path: "/admin/login", element: <Login /> },
      {
        path: "/admin",
        element: <RequireAdmin />,
        children: [
          { index: true, element: <Navigate to="events" replace /> },
          { path: "events", element: <Events /> },
          { path: "events/:id", element: <Detail /> },
          { path: "events/:id/live", element: <Dashboard /> },
          { path: "events/:id/feedback", element: <Feedback /> },
          { path: "products", element: <Products /> },
          { path: "analytics", element: <Analytics /> },
        ],
      },
      { path: "/staff", element: <Navigate to="/staff/login" replace /> },
      { path: "/staff/login", element: <Staff /> },
      { path: "/staff/mode", element: <RequireStaff /> },
      { path: "/staff/scan", element: <RequireStaff /> },
      { path: "/staff/history", element: <RequireStaff /> },
      {
        path: "*",
        element: (
          <div className="empty-state">
            <h1>{es.notFound}</h1>
            <Button asChild>
              <Link to="/admin/events">{es.home}</Link>
            </Button>
          </div>
        ),
      },
    ],
  },
]);
