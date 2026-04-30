import type { SheetStudentProfile } from "../api/mapSheetStudentResponse";
import {
  diffFormSubmissions,
  sortSubmissionsOldestFirst,
  submissionSortTimeMs,
} from "../lib/formSubmissionHistory";
import { formatTimestampLong } from "../lib/dateUtils";

function clipText(s: string, max = 200): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function formatSubmissionWhen(p: SheetStudentProfile): string {
  const raw = p.lastUpdated.trim() || p.date.trim();
  if (!raw) return "—";
  return formatTimestampLong(raw);
}

export function FormSubmissionHistorySection({
  submissions,
}: {
  submissions: SheetStudentProfile[];
}) {
  const ordered = sortSubmissionsOldestFirst(submissions);

  if (ordered.length === 0) {
    return (
      <section
        className="profile-section profile-section--form-history"
        aria-labelledby="profile-form-history-h"
      >
        <h3 id="profile-form-history-h" className="profile-section__heading">
          Google Form history
        </h3>
        <p className="muted profile-form-history-lead">
          No form rows were returned for this student from the roster request.
        </p>
      </section>
    );
  }

  return (
    <section
      className="profile-section profile-section--form-history"
      aria-labelledby="profile-form-history-h"
    >
      <h3 id="profile-form-history-h" className="profile-section__heading">
        Google Form history
      </h3>
      <p className="muted profile-form-history-lead">
        Each new Google Form submission usually adds a row with the same email.
        Changes below compare each row to the previous one for this student.
      </p>

      <ul className="profile-updates-list">
        {ordered.map((row, index) => {
          const when = formatSubmissionWhen(row);
          const prev = index > 0 ? ordered[index - 1] : null;
          const changes = prev != null ? diffFormSubmissions(prev, row) : [];

          return (
            <li
              key={`${row.email}:${index}:${submissionSortTimeMs(row)}`}
              className="profile-updates-list__item"
            >
              <p className="profile-updates-list__title">
                {index === 0 ? (
                  <span className="strong">Initial submission</span>
                ) : (
                  <span className="strong">Updated form</span>
                )}
                <span className="muted">
                  {" "}
                  · {when}
                </span>
              </p>

              {index === 0 ? (
                <p className="muted profile-updates-intro">
                  First row on file for this email (values at that time are
                  reflected in the profile sections above).
                </p>
              ) : changes.length === 0 ? (
                <p className="muted profile-updates-intro">
                  No differences detected vs the previous row (duplicate
                  submission or edits made directly in the sheet).
                </p>
              ) : (
                <ul className="profile-updates-list__changes">
                  {changes.map((c) => (
                    <li key={c.label}>
                      <span className="profile-updates-list__field">
                        {c.label}
                      </span>
                      <span className="muted profile-updates-list__delta">
                        <span className="profile-updates-list__before">
                          {clipText(c.before)}
                        </span>
                        {" → "}
                        <span className="profile-updates-list__after">
                          {clipText(c.after)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
