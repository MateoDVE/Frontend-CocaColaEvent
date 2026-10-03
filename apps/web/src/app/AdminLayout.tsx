import { BrandLogo } from "../shared/ui/BrandLogo";
import { uiText } from "../shared/i18n";
import { useState } from "react";
import {
  NavLink,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  AudioLines,
  Package,
  ChartNoAxesCombined,
  ScanLine,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { es } from "../shared/i18n";
import { useSession } from "../shared/session";
import { useEvents } from "../features/event-management";
import { demoEventId } from "../shared/demo";
export default function AdminLayout() {
  const [menu, setMenu] = useState(false);
  const { data: events = [] } = useEvents();
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useSession((s) => s.logout);
  const currentId =
    location.pathname.match(/\/events\/([^/]+)/)?.[1] ?? demoEventId;
  const selected = events.find((e) => e.id === currentId) ?? events[0];
  const links = [
    {
      to: `/admin/events/${selected?.id ?? demoEventId}/live`,
      label: es.overview,
      icon: LayoutDashboard,
    },
    { to: "/admin/events", label: es.events, icon: CalendarDays, end: true },
    {
      to: `/admin/events/${selected?.id ?? demoEventId}/feedback`,
      label: es.feedback,
      icon: AudioLines,
    },
    { to: "/admin/products", label: es.products, icon: Package },
    { to: "/admin/analytics", label: es.analytics, icon: ChartNoAxesCombined },
  ];
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#main">
        {uiText.adminLayout1}
      </a>
      {menu && (
        <button
          className="sidebar-scrim"
          aria-label={es.close}
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "sidebar-open" : ""}`}>
        <Link className="brand" to="/admin/events">
          <BrandLogo />
          <span className="brand-product">{es.app}</span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label={es.close}
          onClick={() => setMenu(false)}
        >
          <X />
        </button>
        <div className="workspace-label">
          <span className="workspace-icon">{uiText.adminLayout3}</span>
          <div>
            <strong>{uiText.adminLayout4}</strong>
            <small>{uiText.adminLayout5}</small>
          </div>
        </div>
        <nav aria-label={uiText.adminLayout6}>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenu(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="staff-promo">
            <ScanLine size={23} />
            <strong>
              {uiText.adminLayout7}
              <br />
              {uiText.adminLayout8}
            </strong>
            <Link to="/staff/login">
              {es.staff}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="profile">
            <span className="avatar">{uiText.adminLayout9}</span>
            <div>
              <strong>{uiText.adminLayout10}</strong>
              <small>{uiText.adminLayout11}</small>
            </div>
            <button
              className="icon-button"
              aria-label={es.logout}
              onClick={() => {
                logout();
                navigate("/admin/login");
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu icon-button"
              aria-label={uiText.adminLayout12}
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <span className="topbar-label">{uiText.adminLayout13}</span>
            <span className="topbar-divider">/</span>
            <strong>{uiText.adminLayout14}</strong>
          </div>
          <span className="demo-chip">
            <span />
            {es.demo}
          </span>
        </header>
        <main id="main" className="main-content" tabIndex={-1}>
          <div className="context-row">
            <span className="context-label">{uiText.adminLayout15}</span>
            {events.length > 0 && (
              <div className="event-select">
                <CalendarDays size={16} />
                <select
                  aria-label={uiText.adminLayout16}
                  value={selected?.id}
                  onChange={(e) =>
                    navigate(
                      `/admin/events/${e.target.value}/${location.pathname.endsWith("feedback") ? "feedback" : "live"}`,
                    )
                  }
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} />
              </div>
            )}
          </div>
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>{uiText.adminLayout17}</span>
          <span>{es.demoNote}</span>
        </footer>
      </div>
    </div>
  );
}
