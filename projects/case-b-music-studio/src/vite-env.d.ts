/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Apps Script web app `/exec` URL. Required. See `.env.example`. */
  readonly VITE_APPS_SCRIPT_BASE_URL?: string;
  /**
   * Shared secret sent with every POST to the Apps Script web app.
   * Must match the SHARED_SECRET property in Apps Script Project
   * Settings → Script Properties. Loaded from .env.local — never commit.
   */
  readonly VITE_APPS_SCRIPT_SHARED_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
