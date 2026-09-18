import type { LessonRecap } from "../types";
import { formatLessonDateLong, formatTimestampLong } from "../lib/dateUtils";

/**
 * Formatted read-only recap. Renders in the structured order Mr. O'Neal
 * specified:
 *   Hi {Name}, {greeting body}
 *   Today we: {bullet-y list}
 *   HOMEWORK: {bullet-y list}
 *   Next Class: {bullet-y list}
 *
 * Blank sections are simply omitted so a recap that only fills in two
 * fields doesn't render empty headings. CSS uses `white-space: pre-wrap`
 * so the teacher's line breaks survive into the rendered output without
 * needing markdown.
 *
 * Compact variant drops the lesson-date header and section-spacing —
 * intended for the inline expand-under-row use case in the profile
 * timeline. The default variant includes the lesson-date header and is
 * used on the standalone Recaps page.
 */
export function LessonRecapBlock({
  recap,
  variant = "default",
}: {
  recap: LessonRecap;
  variant?: "default" | "compact";
}) {
  const greetingName = recap.studentName.trim().split(/\s+/)[0] || "there";
  const lessonHeader =
    variant === "compact"
      ? null
      : `${formatLessonDateLong(recap.lessonDate)} · ${recap.startTime}`;

  return (
    <article
      className={
        variant === "compact"
          ? "lesson-recap lesson-recap--compact"
          : "lesson-recap"
      }
      aria-label={`Recap for ${recap.studentName || recap.studentEmail} on ${recap.lessonDate}`}
    >
      {lessonHeader && (
        <p className="lesson-recap__header eyebrow">{lessonHeader}</p>
      )}

      <p className="lesson-recap__greeting">
        <span className="lesson-recap__greeting-prefix">
          Hi {greetingName},
        </span>{" "}
        {recap.greeting.trim() || (
          <span className="muted">(no greeting)</span>
        )}
      </p>

      {recap.todayWe.trim() && (
        <RecapSection label="Today we" body={recap.todayWe} />
      )}
      {recap.homework.trim() && (
        <RecapSection label="HOMEWORK" body={recap.homework} />
      )}
      {recap.nextClass.trim() && (
        <RecapSection label="Next Class" body={recap.nextClass} />
      )}

      {recap.updatedAt && (
        <p className="muted lesson-recap__footer">
          Updated {formatTimestampLong(recap.updatedAt)}
        </p>
      )}
    </article>
  );
}

function RecapSection({ label, body }: { label: string; body: string }) {
  return (
    <section className="lesson-recap__section">
      <p className="lesson-recap__label">{label}:</p>
      <p className="lesson-recap__body">{body}</p>
    </section>
  );
}
