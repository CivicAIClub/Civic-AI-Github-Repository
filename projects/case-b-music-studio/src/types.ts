export type Student = {
  id: string;
  name: string;
  instrument: string;
  currentLevel: string;
  lastUpdated: string;
  goals: string;
  musicExperience: string;
  pastInstruments: string[];
  musicInterests: string[];
  teacherNotes: string;
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
