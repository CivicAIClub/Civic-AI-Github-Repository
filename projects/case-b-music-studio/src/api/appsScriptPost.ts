/**
 * Apps Script POST client (write actions).
 *
 * GETs are public read-only and live in:
 *   src/api/appsScriptStudent.ts
 *   src/api/appsScriptSchedule.ts
 *
 * POSTs are gated by a shared secret stored in Script Properties on the
 * Apps Script side and in `.env.local` on this side
 * (`VITE_APPS_SCRIPT_SHARED_SECRET`). The secret is intentionally not
 * committed to git. See apps-script/Code.gs (file header → "Auth").
 *
 * ──────────────────────────────────────────────────────────────────────
 * Why Content-Type: text/plain
 * ──────────────────────────────────────────────────────────────────────
 * Apps Script web apps don't expose custom CORS headers. A POST with
 * `Content-Type: application/json` is a "non-simple" CORS request and
 * triggers a preflight OPTIONS that Apps Script can't answer, so it
 * fails before the handler runs. Sending the JSON body as `text/plain`
 * keeps the request "simple" — the browser skips the preflight, and the
 * Apps Script side reads the raw string at `e.postData.contents` and
 * `JSON.parse`s it. This is the standard workaround.
 *
 * ──────────────────────────────────────────────────────────────────────
 * Response shape (every POST)
 * ──────────────────────────────────────────────────────────────────────
 *   { ok: true, ...data }     // success
 *   { ok: false, error: "…" } // any failure (auth, bad input, handler threw)
 *
 * `postToAppsScript` resolves with the success payload and rejects with
 * an Error whose `.message` is the server-side `error` string. Callers
 * never have to branch on `ok` themselves.
 */
import { APPS_SCRIPT_BASE_URL } from "./appsScriptStudent";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readSharedSecret(): string {
  const value = import.meta.env.VITE_APPS_SCRIPT_SHARED_SECRET;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(
      "Missing VITE_APPS_SCRIPT_SHARED_SECRET. Add it to projects/case-b-music-studio/.env.local (see .env.example) and restart the dev server."
    );
  }
  return value;
}

export type AppsScriptPostInit = {
  signal?: AbortSignal;
  /**
   * Override the shared secret read from `.env.local`. Useful in tests
   * and one-off browser-console smoke checks. Production code should
   * always rely on the env var.
   */
  secret?: string;
};

/**
 * Sends a POST to the Apps Script web app and returns the success
 * payload (without the `ok: true` wrapper).
 *
 * @param action  Routed by the `switch` in `doPost` inside Code.gs.
 * @param payload Extra fields merged into the request body alongside
 *                `action` and `secret`. Must be JSON-serialisable.
 *                Reserved keys (`action`, `secret`) on `payload` are
 *                ignored — the explicit args win.
 */
export async function postToAppsScript<TResult extends Record<string, unknown>>(
  action: string,
  payload: Record<string, unknown> = {},
  init?: AppsScriptPostInit
): Promise<TResult> {
  const trimmedAction = action.trim();
  if (!trimmedAction) {
    throw new Error("postToAppsScript requires a non-empty action.");
  }

  const secret = init?.secret ?? readSharedSecret();

  const { action: _ignoredAction, secret: _ignoredSecret, ...rest } = payload;
  void _ignoredAction;
  void _ignoredSecret;

  const body = JSON.stringify({
    action: trimmedAction,
    secret,
    ...rest,
  });

  let res: Response;
  try {
    res = await fetch(APPS_SCRIPT_BASE_URL, {
      method: "POST",
      // text/plain keeps this a "simple" CORS request — see file header.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
      signal: init?.signal,
      redirect: "follow",
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new Error(
      `Could not reach Apps Script at ${APPS_SCRIPT_BASE_URL}. Network error or web app URL is wrong.`
    );
  }

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error(
      `Apps Script returned a non-JSON response (HTTP ${res.status}). Did you redeploy after changing Code.gs?`
    );
  }

  if (!isRecord(json)) {
    throw new Error("Apps Script returned an unexpected response shape (expected an object).");
  }

  if (json.ok === false) {
    const message =
      typeof json.error === "string" && json.error.trim()
        ? json.error
        : `Apps Script reported failure (HTTP ${res.status}).`;
    throw new Error(message);
  }

  if (!res.ok) {
    throw new Error(`Apps Script request failed (HTTP ${res.status}).`);
  }

  return json as TResult;
}

// ──────────────────────────────────────────────────────────────────────
// Concrete actions
// ──────────────────────────────────────────────────────────────────────

export type PingResult = {
  ok: true;
  pong: true;
  ts: number;
  echo: string | null;
  spreadsheet: string;
};

/**
 * Smoke-test the POST round trip. Useful in the browser console:
 *
 *     import("./src/api/appsScriptPost").then(m => m.pingAppsScript().then(console.log))
 *
 * Returns the parsed success payload; throws on any failure.
 */
export async function pingAppsScript(
  message?: string,
  init?: AppsScriptPostInit
): Promise<PingResult> {
  return postToAppsScript<PingResult>(
    "ping",
    message != null ? { message } : {},
    init
  );
}
