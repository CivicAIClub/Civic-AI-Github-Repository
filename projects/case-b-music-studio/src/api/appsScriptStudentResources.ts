/**
 * Phase 4 — Student Resources client.
 *
 * Each enrolled student has their own Drive folder with editor access.
 * Folders live as direct children of a single parent folder configured
 * once via the `STUDENT_RESOURCES_PARENT_FOLDER_ID` Script Property and
 * are auto-created on demand — the frontend never has to know whether
 * a folder exists yet.
 *
 * Flow:
 *   1. Profile panel opens for a student → `listStudentFolder(email)`
 *      ensures the folder exists, grants editor access, returns folder
 *      metadata + files for the section.
 *   2. Teacher can also click "Sync all student folders" on the
 *      Dashboard → `syncStudentFolders()` runs ensure for the whole
 *      roster in one shot and reports created / existed / errors.
 */
import { postToAppsScript, type AppsScriptPostInit } from "./appsScriptPost";
import type {
  ClassResourcesFile,
  ClassResourcesFolder,
} from "./appsScriptResources";

/**
 * Per-student Drive folder metadata, identical shape to Class
 * Resources plus a `created` flag that's `true` only when this call
 * actually created the folder (so the UI can show a one-time "Created
 * a fresh folder" affordance if desired).
 */
export type StudentFolder = ClassResourcesFolder & { created: boolean };

/** Single child of a per-student folder — same shape as Class Resources. */
export type StudentFolderFile = ClassResourcesFile;

export type StudentFolderListing = {
  folder: StudentFolder;
  student: { email: string; name: string };
  files: StudentFolderFile[];
};

/**
 * Per-student outcome from one bulk-sync run. `created` were
 * newly-made folders; `existed` already had one; `errors` are
 * addresses Drive rejected (typically malformed test addresses).
 */
export type SyncStudentFoldersReport = {
  parent: { id: string; name: string };
  created: string[];
  existed: string[];
  errors: { email: string; message: string }[];
};

type ListResponse = {
  ok: true;
  folder: StudentFolder;
  student: { email: string; name: string };
  files: StudentFolderFile[];
};

type SyncResponse = {
  ok: true;
  parent: { id: string; name: string };
  created: string[];
  existed: string[];
  errors: { email: string; message: string }[];
};

/**
 * Ensures the per-student folder exists (creating + granting editor
 * access if needed) and returns its current contents. Idempotent.
 */
export async function listStudentFolder(
  studentEmail: string,
  init?: AppsScriptPostInit
): Promise<StudentFolderListing> {
  const result = await postToAppsScript<ListResponse>(
    "list-student-folder",
    { studentEmail: studentEmail.trim().toLowerCase() },
    init
  );
  return {
    folder: result.folder,
    student: result.student,
    files: result.files,
  };
}

/**
 * Bulk-ensure folders for every roster student. Used by the Dashboard
 * admin action; per-student `listStudentFolder` already covers the
 * common case.
 */
export async function syncStudentFolders(
  init?: AppsScriptPostInit
): Promise<SyncStudentFoldersReport> {
  const result = await postToAppsScript<SyncResponse>(
    "sync-student-folders",
    {},
    init
  );
  return {
    parent: result.parent,
    created: result.created,
    existed: result.existed,
    errors: result.errors,
  };
}
