import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mockStudents } from "../data/mockStudents";

export function Dashboard() {
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return mockStudents
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="page-header__lede">
          Quick overview for lessons — data is sample-only for now.
        </p>
      </header>

      <div className="grid-dashboard">
        <section className="card card--stat">
          <h2 className="card__title">Total students</h2>
          <p className="stat-value">{mockStudents.length}</p>
          <p className="muted">Active roster (mock)</p>
        </section>

        <section className="card">
          <h2 className="card__title">Find a student</h2>
          <label className="label" htmlFor="dash-search">
            Search by name
          </label>
          <input
            id="dash-search"
            type="search"
            className="input"
            placeholder="Type a name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query.trim() && (
            <ul className="search-results">
              {searchResults.length === 0 && (
                <li className="muted">No matches</li>
              )}
              {searchResults.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/students?student=${encodeURIComponent(s.id)}`}
                    className="link-block"
                  >
                    <span className="strong">{s.name}</span>
                    <span className="muted">
                      {s.instrument} · {s.currentLevel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card span-2 placeholder-card">
          <h2 className="card__title">Recent student updates</h2>
          <p className="placeholder-text">
            Form submissions and profile changes will show here after Google
            Forms and Sheets are connected.
          </p>
          <p className="muted">
            For now, open the Students page to view and edit mock profiles
            inline during lessons.
          </p>
        </section>

        <section className="card span-2 placeholder-card">
          <h2 className="card__title">Upcoming lessons</h2>
          <p className="placeholder-text">
            Calendar and reminders will appear here after scheduling is
            connected.
          </p>
          <p className="muted">
            For now, use your regular planner — this block is a placeholder.
          </p>
        </section>
      </div>
    </div>
  );
}
