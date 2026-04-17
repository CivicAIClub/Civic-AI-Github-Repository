import type { ResourceCategory, ResourceItem } from "../types";

export const RESOURCE_CATEGORY_LABEL: Record<ResourceCategory, string> = {
  "sheet-music": "Sheet music",
  exercises: "Exercises",
  warmups: "Warmups",
  technique: "Technique guides",
  theory: "Theory materials",
  "student-specific": "Student-specific",
};

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  "sheet-music",
  "exercises",
  "warmups",
  "technique",
  "theory",
  "student-specific",
];

export const mockResources: ResourceItem[] = [
  {
    id: "r1",
    title: "Autumn Leaves — lead sheet (concert B♭)",
    category: "sheet-music",
    description: "Lead sheet with melody and chords; use for ii–V practice.",
    tags: ["jazz", "intermediate"],
  },
  {
    id: "r2",
    title: "Major scales — one octave (all instruments)",
    category: "exercises",
    description: "Circle of fifths worksheet; circle targets for the week.",
    tags: ["fundamentals"],
  },
  {
    id: "r3",
    title: "Breathing gym — 5-minute routine",
    category: "warmups",
    description: "Lip trills, sirens, and easy onset patterns for singers and winds.",
    tags: ["voice", "woodwinds"],
  },
  {
    id: "r4",
    title: "Left-hand stride — shell voicings",
    category: "technique",
    description: "Shell voicings chart + metronome markings by week.",
    tags: ["piano", "jazz"],
  },
  {
    id: "r5",
    title: "Intervals & chord quality — ear drills",
    category: "theory",
    description: "Short MP3 cues (mock); answer key in teacher folder.",
    tags: ["theory", "ear training"],
  },
  {
    id: "r6",
    title: "Bow distribution — open strings",
    category: "technique",
    description: "Mirror work + quarter-note pulses at 60–72 BPM.",
    tags: ["strings", "beginner"],
  },
  {
    id: "r7",
    title: "Rock beats — eighth-note hats",
    category: "exercises",
    description: "Four-bar patterns with one fill per lesson.",
    tags: ["drums"],
  },
  {
    id: "r8",
    title: "Circle of fifths — blank worksheet",
    category: "theory",
    description: "Fill-in worksheet; pair with keyboard visualization.",
    tags: ["keys", "worksheet"],
  },
  {
    id: "r9",
    title: "Cello — thumb position introduction",
    category: "technique",
    description: "Harmonics map + first shifting exercises.",
    tags: ["cello", "advanced"],
  },
  {
    id: "r10",
    title: "Student packs (placeholder)",
    category: "student-specific",
    description:
      "Per-student PDF bundles and shared Drive links will appear here after accounts are connected.",
    tags: ["placeholder"],
  },
  {
    id: "r11",
    title: "Long tones — saxophone tuning",
    category: "warmups",
    description: "Concert F, D, and B♭ with drone track (mock).",
    tags: ["saxophone"],
  },
  {
    id: "r12",
    title: "Folk Songs — Suzuki Book 1 excerpts",
    category: "sheet-music",
    description: "Scanned excerpts for early violin lessons.",
    tags: ["violin", "beginner"],
  },
];
