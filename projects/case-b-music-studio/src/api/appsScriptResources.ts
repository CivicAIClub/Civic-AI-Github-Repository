/**
 * Phase 3 — Class Resources client.
 *
 * The Class Resources folder is a single shared Drive folder that every
 * enrolled student should be able to view. The Apps Script side
 * (`apps-script/Code.gs`) owns the folder reference (configured once via
 * the `CLASS_RESOURCES_FOLDER_ID` Script Property) and is the only thing
 * that ever calls Drive — the frontend just renders the snapshot and
 * triggers a permission sync on demand.
 *
 * Flow:
 *   1. Dashboard mounts → `listClassResources()` returns folder metadata
 *      and the most recently modified files for the resource card.
 *   2. Teacher clicks "Sync student access" →
 *      `syncClassResourcesAccess()` runs the roster against the folder
 *      and reports which emails were granted, already had access, or
 *      errored.
 */
import { postToAppsScript, type AppsScriptPostInit } from "./appsScriptPost";

/** Drive folder metadata as the dashboard renders it. */
export type ClassResourcesFolder = {
  id: string;
  name: string;
  webViewLink: string;
};

/**
 * Single child of the Class Resources folder. Files and sub-folders
 * share this shape; `isFolder` discriminates them so the UI can label
 * them differently while still rendering one flat list.
 */
export type ClassResourcesFile = {
  id: string;
  name: string;
  mimeType: string;
  /** ISO timestamp from Drive (UTC). */
  modifiedTime: string;
  webViewLink: string;
  iconLink: string;
  isFolder: boolean;
};

export type ClassResourcesListing = {
  folder: ClassResourcesFolder;
  files: ClassResourcesFile[];
};

/**
 * Per-email outcome from one access-sync run. `granted` were newly
 * added as viewers; `alreadyHadAccess` were no-ops; `errors` are
 * addresses Drive rejected (typically malformed or non-Google-aware
 * emails). The dashboard renders all three so the teacher can act on
 * the errors.
 */
export type SyncAccessReport = {
  folder: { id: string; name: string };
  granted: string[];
  alreadyHadAccess: string[];
  errors: { email: string; message: string }[];
};

type ListResponse = {
  ok: true;
  folder: ClassResourcesFolder;
  files: ClassResourcesFile[];
};

type SyncResponse = {
  ok: true;
  folder: { id: string; name: string };
  granted: string[];
  alreadyHadAccess: string[];
  errors: { email: string; message: string }[];
};

/**
 * Fetches the Class Resources folder and its most-recently-modified
 * children. Pure read — never touches permissions.
 */
export async function listClassResources(
  init?: AppsScriptPostInit
): Promise<ClassResourcesListing> {
  const result = await postToAppsScript<ListResponse>(
    "list-class-resources",
    {},
    init
  );
  return { folder: result.folder, files: result.files };
}

/**
 * Grants viewer access to every roster email + the configured extra
 * viewers. Idempotent: emails that already have access are reported
 * separately and not re-added.
 */
export async function syncClassResourcesAccess(
  init?: AppsScriptPostInit
): Promise<SyncAccessReport> {
  const result = await postToAppsScript<SyncResponse>(
    "sync-class-resources-access",
    {},
    init
  );
  return {
    folder: result.folder,
    granted: result.granted,
    alreadyHadAccess: result.alreadyHadAccess,
    errors: result.errors,
  };
}
