import { NavLink, Outlet } from "react-router-dom";
import { SchoolBrandMark } from "./SchoolBrandMark";

function navPillClassName({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-pill nav-pill--active" : "nav-pill";
}

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-top">
        <div className="app-top__row">
          <div className="app-top__brand">
            <SchoolBrandMark variant="compact" className="app-top__crest" />
            <div className="app-top__brand-text">
              <span className="app-top__title">Pomfret School</span>
              <span className="app-top__subtitle">Music studio</span>
            </div>
          </div>
          <nav className="app-top__nav" aria-label="Main navigation">
            <NavLink to="/" end className={navPillClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/students" className={navPillClassName}>
              Students
            </NavLink>
            <NavLink to="/resources" className={navPillClassName}>
              Resource Hub
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="main__body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
