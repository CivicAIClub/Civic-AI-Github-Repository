import { useMemo, useState } from "react";
import {
  RESOURCE_CATEGORY_LABEL,
  RESOURCE_CATEGORIES,
  mockResources,
} from "../data/mockResources";
import type { ResourceCategory } from "../types";

const CATEGORY_ICONS: Record<ResourceCategory, string> = {
  "sheet-music": "♫",
  exercises: "≋",
  warmups: "◇",
  technique: "◎",
  theory: "⊕",
  "student-specific": "☆",
};

function categoryIcon(category: ResourceCategory): string {
  return CATEGORY_ICONS[category];
}

export function ResourceHub() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ResourceCategory | "">("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockResources.filter((r) => {
      if (category && r.category !== category) return false;
      if (!q) return true;
      const inTitle = r.title.toLowerCase().includes(q);
      const inDesc = r.description.toLowerCase().includes(q);
      const inTags = (r.tags ?? []).some((t) => t.toLowerCase().includes(q));
      return inTitle || inDesc || inTags;
    });
  }, [query, category]);

  const grouped = useMemo(() => {
    const map = new Map<ResourceCategory, typeof filtered>();
    for (const c of RESOURCE_CATEGORIES) map.set(c, []);
    for (const r of filtered) {
      const list = map.get(r.category);
      if (list) list.push(r);
    }
    return map;
  }, [filtered]);

  const showGrouped = !category;

  return (
    <div className="page page--wide">
      <header className="page-header">
        <h1>Resource Hub</h1>
        <p className="page-header__lede">
          Teaching materials to share with students later — organized by category
          (mock data).
        </p>
      </header>

      <div className="filters card">
        <div className="filters__row">
          <div className="field grow">
            <label className="label" htmlFor="hub-search">
              Search
            </label>
            <input
              id="hub-search"
              type="search"
              className="input"
              placeholder="Title, description, or tag…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="hub-category">
              Category
            </label>
            <select
              id="hub-category"
              className="select"
              value={category}
              onChange={(e) =>
                setCategory((e.target.value || "") as ResourceCategory | "")
              }
            >
              <option value="">All categories</option>
              {RESOURCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {RESOURCE_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="muted filters__count">
          Showing {filtered.length} of {mockResources.length} resources
        </p>
      </div>

      {showGrouped ? (
        <div className="resource-hub-sections">
          {RESOURCE_CATEGORIES.map((cat) => {
            const items = grouped.get(cat) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={cat} className="resource-section card">
                <h2 className="resource-section__title">
                  <span className="resource-folder-icon" aria-hidden>
                    {categoryIcon(cat)}
                  </span>
                  {RESOURCE_CATEGORY_LABEL[cat]}
                  <span className="resource-section__count muted">
                    {items.length}
                  </span>
                </h2>
                <div className="resource-card-grid">
                  {items.map((r) => (
                    <article key={r.id} className="resource-card">
                      <div className="resource-card__icon" aria-hidden>
                        {categoryIcon(r.category)}
                      </div>
                      <h3 className="resource-card__title">{r.title}</h3>
                      <p className="resource-card__desc">{r.description}</p>
                      {(r.tags?.length ?? 0) > 0 && (
                        <ul className="resource-card__tags">
                          {r.tags!.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="resource-card-grid resource-card-grid--flat">
          {filtered.map((r) => (
            <article key={r.id} className="resource-card">
              <div className="resource-card__icon" aria-hidden>
                {categoryIcon(r.category)}
              </div>
              <p className="resource-card__category muted">
                {RESOURCE_CATEGORY_LABEL[r.category]}
              </p>
              <h3 className="resource-card__title">{r.title}</h3>
              <p className="resource-card__desc">{r.description}</p>
              {(r.tags?.length ?? 0) > 0 && (
                <ul className="resource-card__tags">
                  {r.tags!.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="empty-state">
          No resources match. Try a different search or clear the category
          filter.
        </p>
      )}
    </div>
  );
}
