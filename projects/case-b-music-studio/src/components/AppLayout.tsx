import { NavLink, Outlet } from "react-router-dom";
import { SchoolBrandMark } from "./SchoolBrandMark";
import {
  EXTERNAL_LINKS,
  EXTERNAL_LINK_ORDER,
  EXTERNAL_LINK_SHORT_LABEL,
} from "../lib/externalLinks";
import { CASE_B_GITHUB_PAGES_URL } from "../lib/publicSiteUrl";

function navPillClassName({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-pill nav-pill--active" : "nav-pill";
}

export function AppLayout() {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
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
            <NavLink to="/recaps" className={navPillClassName}>
              Recaps
            </NavLink>
            <span
              className="app-top__nav-divider"
              aria-hidden="true"
              role="presentation"
            />
            {EXTERNAL_LINK_ORDER.map((key) => {
              const link = EXTERNAL_LINKS[key];
              const shortLabel = EXTERNAL_LINK_SHORT_LABEL[key];
              return (
                <a
                  key={key}
                  className="nav-pill nav-pill--external"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.label}
                  aria-label={`${link.label} (opens in a new tab)`}
                >
                  {shortLabel}
                  <span className="nav-pill__external-icon" aria-hidden="true">
                    ↗
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
      </header>
      <main id="main-content" className="main" tabIndex={-1}>
        <div className="main__body">
          <Outlet />
        </div>
      </main>
      <footer className="app-footer" role="contentinfo">
        <p className="app-footer__text">
          <span className="app-footer__label">Case B — live on GitHub Pages</span>
          <a
            className="app-footer__link"
            href={CASE_B_GITHUB_PAGES_URL}
            title="Official GitHub Pages URL for this dashboard"
          >
            {CASE_B_GITHUB_PAGES_URL}
          </a>
        </p>
      </footer>
    </div>
  );
}
