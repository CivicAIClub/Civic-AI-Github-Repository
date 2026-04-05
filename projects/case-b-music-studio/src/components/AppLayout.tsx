import { NavLink, Outlet } from "react-router-dom";

function navClassName({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link nav-link--active" : "nav-link";
}

export function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar__brand">
          <span className="sidebar__title">Student Profile Manager</span>
          <span className="sidebar__subtitle">Roster & resources</span>
        </div>
        <nav className="sidebar__nav">
          <NavLink to="/" end className={navClassName}>
            Dashboard
          </NavLink>
          <NavLink to="/students" className={navClassName}>
            Students
          </NavLink>
          <NavLink to="/resources" className={navClassName}>
            Resource Hub
          </NavLink>
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
