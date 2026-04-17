export type Student = {
  id: string;
  name: string;
  /** Google Form "Date" when present */
  formDate: string;
  instrument: string;
  currentLevel: string;
  lastUpdated: string;
  goals: string;
  musicExperience: string;
  /** "What genre of music do you want to learn?" */
  genre: string;
  /** "Any specific song you want to learn?" */
  specificSong: string;
  /** "Any updates? Questions?" */
  studentUpdates: string;
  /** Parsed from "Lesson Availability/ Preferable Time" (e.g. block labels) */
  availabilityBlocks: string[];
  /** Local / session edits until a backend exists */
  teacherNotes: string;
  /** When set, the profile panel loads this row from Google Apps Script by email */
  sheetEmail?: string;
  theory?: string;
  /** From sheet column "Email Address" when loaded via Apps Script */
  contactEmail?: string;
};

/** One booked lesson row from the "Lesson Schedule" sheet (via Apps Script). */
export type ScheduledLesson = {
  studentEmail: string;
  studentName: string;
  lessonDate: string;
  lessonBlock: string;
  startTime: string;
  endTime: string;
  status: string;
  lessonFocus: string;
  /** From sheet column "Note" or "Notes" */
  note: string;
};

export type ResourceCategory =
  | "sheet-music"
  | "exercises"
  | "warmups"
  | "technique"
  | "theory"
  | "student-specific";

export type ResourceItem = {
  id: string;
  title: string;
  category: ResourceCategory;
  description: string;
  tags?: string[];
};
