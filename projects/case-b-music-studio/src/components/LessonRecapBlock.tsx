import { useCallback, useEffect, useState } from "react";
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
 * Compact variant drops the lesson-date header and section-spacing,
 * intended for the inline expand-under-row use case in the profile
 * timeline. The default variant includes the lesson-date header and is
 * used on the standalone Recaps page.
 *
 * Every variant gets a "Copy" button that puts the recap into the
 * clipboard as both rich HTML (for paste into Gmail / Docs) and plain
 * text (for plain-text targets), formatted with a blank line between
 * each section. Lesson date / time are intentionally NOT included in
 * the copy: it's just the message body the teacher will paste into an
 * email.
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
      <div className="lesson-recap__top">
        {lessonHeader && (
          <p className="lesson-recap__header eyebrow">{lessonHeader}</p>
        )}
        <CopyRecapButton recap={recap} greetingName={greetingName} />
      </div>

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

/**
 * Builds the plain-text and HTML versions of a recap for the
 * clipboard. Format: greeting line, then each filled section with its
 * label, separated by a blank line. No date / time / "Updated at"
 * footer — the copied text is the message body itself, ready to drop
 * into an email.
 */
function buildCopyContent(
  recap: LessonRecap,
  greetingName: string
): { text: string; html: string } {
  const greetingBody = recap.greeting.trim();
  const greetingLine = greetingBody
    ? `Hi ${greetingName}, ${greetingBody}`
    : `Hi ${greetingName},`;

  const sections: Array<{ label: string; body: string }> = [];
  if (recap.todayWe.trim()) {
    sections.push({ label: "Today we", body: recap.todayWe.trim() });
  }
  if (recap.homework.trim()) {
    sections.push({ label: "HOMEWORK", body: recap.homework.trim() });
  }
  if (recap.nextClass.trim()) {
    sections.push({ label: "Next Class", body: recap.nextClass.trim() });
  }

  const textParts: string[] = [greetingLine];
  for (const s of sections) {
    textParts.push(`${s.label}:\n${s.body}`);
  }
  const text = textParts.join("\n\n");

  const htmlParts: string[] = [`<p>${escapeHtml(greetingLine)}</p>`];
  for (const s of sections) {
    htmlParts.push(
      `<p><strong>${escapeHtml(s.label)}:</strong><br>${escapeHtml(s.body).replace(/\n/g, "<br>")}</p>`
    );
  }
  const html = htmlParts.join("");

  return { text, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type CopyState = "idle" | "copied" | "error";

function CopyRecapButton({
  recap,
  greetingName,
}: {
  recap: LessonRecap;
  greetingName: string;
}) {
  const [state, setState] = useState<CopyState>("idle");

  // Auto-reset the "Copied!" / "Failed" label back to "Copy" after 2s
  // so the button doesn't sit in a stale state if the teacher copies
  // the same recap twice.
  useEffect(() => {
    if (state === "idle") return;
    const id = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(id);
  }, [state]);

  const onCopy = useCallback(async () => {
    const { text, html } = buildCopyContent(recap, greetingName);

    // Prefer the modern Clipboard API with multi-format support so a
    // paste into Gmail / Docs picks up the bolded section headings and
    // line breaks. Fall back to plain-text writeText, then to a
    // hidden-textarea execCommand for the last-resort browsers.
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([text], { type: "text/plain" }),
          }),
        ]);
        setState("copied");
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setState("copied");
        return;
      }
      legacyCopy(text);
      setState("copied");
    } catch (err) {
      console.error("CopyRecapButton failed:", err);
      try {
        legacyCopy(text);
        setState("copied");
      } catch {
        setState("error");
      }
    }
  }, [recap, greetingName]);

  const label =
    state === "copied" ? "Copied!" : state === "error" ? "Copy failed" : "Copy";

  return (
    <button
      type="button"
      className="button-ghost lesson-recap__copy"
      onClick={onCopy}
      aria-live="polite"
      title="Copy this recap as formatted text (paste into Gmail or Docs)"
    >
      {label}
    </button>
  );
}

/** Pre-Clipboard-API fallback. Hidden textarea + document.execCommand. */
function legacyCopy(text: string): void {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "absolute";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}
