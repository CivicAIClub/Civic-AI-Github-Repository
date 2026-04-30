/**
 * Centralised Google Workspace links rendered in the top header and the
 * Dashboard "Quick links" card. Update these here and both surfaces follow.
 *
 *  - sheet:       master spreadsheet (roster + Lesson Schedule).
 *  - studentForm: public viewform link the teacher shares with students.
 *  - editForm:    teacher-only form editor for managing questions.
 */
export type ExternalLink = {
  label: string;
  description: string;
  href: string;
};

export const EXTERNAL_LINKS = {
  sheet: {
    label: "Open Google Sheet",
    description: "Roster and Lesson Schedule data",
    href: "https://docs.google.com/spreadsheets/d/1T36WhgNIuOk1S0b0OsLMTdLe1wO1eOB8OorMDLJYxLI/edit?resourcekey=&gid=876117829#gid=876117829",
  },
  studentForm: {
    label: "Student sign-up form",
    description: "Public link to share with students",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSfoJXjw5W8hH4grRfy9rUFVPmafU-_GH3Z4K8vBIN2ayz1fXw/viewform",
  },
  editForm: {
    label: "Edit form questions",
    description: "Teacher-only Google Forms editor",
    href: "https://docs.google.com/forms/d/17D6ohIyOseo9Y5bkypZ7qvoThLaDqxNOEyskwZy5OYw/edit",
  },
} as const satisfies Record<string, ExternalLink>;

/** Order used for both the header pills and the Dashboard list. */
export const EXTERNAL_LINK_ORDER: (keyof typeof EXTERNAL_LINKS)[] = [
  "sheet",
  "studentForm",
  "editForm",
];

/** Compact label used on space-constrained surfaces like the top nav. */
export const EXTERNAL_LINK_SHORT_LABEL: Record<keyof typeof EXTERNAL_LINKS, string> = {
  sheet: "Sheet",
  studentForm: "Form",
  editForm: "Edit form",
};
