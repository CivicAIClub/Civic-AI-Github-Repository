/**
 * Apps Script POST client (write actions).
 *
 * Reads (roster, schedule) live in:
 *   src/api/appsScriptStudent.ts
 *   src/api/appsScriptSchedule.ts
 *
 * POSTs are gated by a shared secret stored in Script Properties on
 * the Apps Script side and in `.env.local` on this side
 * (`VITE_APPS_SCRIPT_SHARED_SECRET`). The secret is intentionally not
 * committed to git.
 *
 * IMPORTANT: this secret is bundled into the deployed JS — anyone
 * who can open the site in DevTools can read it. Treat the deployed
 * URL as private (don't link it publicly).
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
 * `JSON.parse`s it.
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

  const result = await fetchWithRetry(body, init?.signal);
  return processResponse<TResult>(result.text, result.status);
}

/**
 * fetch wrapper that retries once on a transient failure. Apps Script
 * occasionally returns 502/503/504 from a Google-side blip; a single
 * retry covers the vast majority of those without making the user wait
 * on a manual "Try again". The retry is skipped when the call is
 * aborted (the user explicitly cancelled).
 */
async function fetchWithRetry(
  body: string,
  signal: AbortSignal | undefined
): Promise<{ text: string; status: number }> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    let res: Response;
    try {
      res = await fetch(APPS_SCRIPT_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body,
        signal,
        redirect: "follow",
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      lastError = err;
      if (attempt === 0) {
        await wait(400, signal);
        continue;
      }
      throw new Error(
        `Could not reach Apps Script at ${APPS_SCRIPT_BASE_URL}. Network error or web app URL is wrong.`
      );
    }

    if (
      attempt === 0 &&
      (res.status === 502 || res.status === 503 || res.status === 504)
    ) {
      await wait(400, signal);
      continue;
    }

    const text = await res.text();
    return { text, status: res.status };
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Apps Script request failed.");
}

async function wait(ms: number, signal: AbortSignal | undefined): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const id = window.setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          window.clearTimeout(id);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true }
      );
    }
  });
}

function processResponse<TResult extends Record<string, unknown>>(
  text: string,
  status: number
): TResult {
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error(
      `Apps Script returned a non-JSON response (HTTP ${status}). Did you redeploy after changing Code.gs?`
    );
  }

  if (!isRecord(json)) {
    throw new Error("Apps Script returned an unexpected response shape (expected an object).");
  }

  if (json.ok === false) {
    const message =
      typeof json.error === "string" && json.error.trim()
        ? json.error
        : `Apps Script reported failure (HTTP ${status}).`;
    throw new Error(message);
  }

  if (status < 200 || status >= 300) {
    throw new Error(`Apps Script request failed (HTTP ${status}).`);
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
