import { NavLink, Outlet } from "react-router-dom";
import { SchoolBrandMark } from "./SchoolBrandMark";

function navClassName({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link nav-link--active" : "nav-link";
}

export function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar__brand sidebar__brand--with-mark">
          <SchoolBrandMark variant="compact" className="sidebar__crest" />
          <div className="sidebar__brand-text">
            <span className="sidebar__title">Pomfret School</span>
            <span className="sidebar__subtitle">Music studio</span>
          </div>
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
        <header
          className="site-header"
          aria-label="Pomfret School music studio"
        >
          <SchoolBrandMark variant="compact" className="site-header__crest" />
        </header>
        <div className="main__body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
