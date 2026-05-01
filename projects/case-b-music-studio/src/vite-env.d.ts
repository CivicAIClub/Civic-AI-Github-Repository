/// <reference types="vite/client" />

interface ImportMetaEnv {
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
