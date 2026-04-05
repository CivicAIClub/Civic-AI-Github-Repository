import type { Student } from "../types";

export const mockStudents: Student[] = [
  {
    id: "s1",
    name: "Avery Chen",
    instrument: "Piano",
    currentLevel: "Intermediate",
    lastUpdated: "2026-04-02T15:30:00.000Z",
    goals: "Learn chord voicings for jazz standards; perform at spring recital.",
    musicExperience: "7 years of classical study; started jazz in 2025.",
    pastInstruments: ["Recorder"],
    musicInterests: ["Bill Evans", "Lo-fi study playlists", "Film scores"],
    teacherNotes:
      "Strong sight-reading. Assign ii–V–I patterns in B♭ and F for next lesson.",
  },
  {
    id: "s2",
    name: "Jordan Malik",
    instrument: "Saxophone",
    currentLevel: "Advanced",
    lastUpdated: "2026-04-04T10:00:00.000Z",
    goals: "All-state audition prep; tighten altissimo tuning on technical etudes.",
    musicExperience: "9 years; marching band + jazz combo.",
    pastInstruments: ["Clarinet"],
    musicInterests: ["John Coltrane", "Big band charts", "Studio One ska"],
    teacherNotes:
      "Bring tenor for doubling excerpt; long-tone routine 5 min daily.",
  },
  {
    id: "s3",
    name: "Riley Park",
    instrument: "Violin",
    currentLevel: "Beginner",
    lastUpdated: "2026-03-30T14:20:00.000Z",
    goals: "Consistent bow hold; learn first-position major scales.",
    musicExperience: "First year on strings; prior choir experience.",
    pastInstruments: [],
    musicInterests: ["Taylor Swift string covers", "Celtic fiddle"],
    teacherNotes:
      "Use mirror for bow angle; short Folk Song book assignments only.",
  },
  {
    id: "s4",
    name: "Sam Rivera",
    instrument: "Guitar",
    currentLevel: "Intermediate",
    lastUpdated: "2026-04-03T16:00:00.000Z",
    goals: "Fingerstyle arrangement of a pop song; tighten barre chord changes.",
    musicExperience: "4 years self-taught; formal lessons since 2025.",
    pastInstruments: ["Ukulele"],
    musicInterests: ["Bossa nova", "Fingerstyle YouTube", "Indie rock"],
    teacherNotes: "Capo at 2 for “Blackbird” section; metronome at 72.",
  },
  {
    id: "s5",
    name: "Taylor Brooks",
    instrument: "Voice",
    currentLevel: "Intermediate",
    lastUpdated: "2026-04-01T19:45:00.000Z",
    goals: "Musical theatre audition packet; breath support for belt transitions.",
    musicExperience: "Church choir 3 years; school musical lead once.",
    pastInstruments: ["Piano (basic)"],
    musicInterests: ["Hamilton", "Jazz vocal standards", "A cappella"],
    teacherNotes:
      "Lip trills before belt drills; hydrate; recording rough takes OK.",
  },
  {
    id: "s6",
    name: "Morgan Ellis",
    instrument: "Drums",
    currentLevel: "Beginner",
    lastUpdated: "2026-03-26T12:10:00.000Z",
    goals: "Rock beats with fills; read simple drum notation.",
    musicExperience: "New to kit; played piano for 2 years.",
    pastInstruments: ["Piano"],
    musicInterests: ["Indie rock", "Funk playlists", "Marching cadences"],
    teacherNotes:
      "Hi-hat 8ths at 80 BPM before adding kick/snare variations.",
  },
  {
    id: "s7",
    name: "Casey Nguyen",
    instrument: "Cello",
    currentLevel: "Advanced",
    lastUpdated: "2026-04-05T09:15:00.000Z",
    goals: "College portfolio recording; polish Bach Suite prelude.",
    musicExperience: "10 years; youth orchestra principal.",
    pastInstruments: ["Piano"],
    musicInterests: ["Yo-Yo Ma", "Contemporary cello rep", "Film scoring"],
    teacherNotes:
      "Recording date April 20 — intonation check open strings daily.",
  },
  {
    id: "s8",
    name: "Jamie Foster",
    instrument: "Piano",
    currentLevel: "Beginner",
    lastUpdated: "2026-03-21T17:00:00.000Z",
    goals: "Hands-together “Ode to Joy”; steady quarter-note pulse.",
    musicExperience: "6 months of lessons; no prior instruments.",
    pastInstruments: [],
    musicInterests: ["Video game music", "Disney songs"],
    teacherNotes: "Count aloud; RH only études if fatigue — short sessions.",
  },
];

export function getStudentById(id: string): Student | undefined {
  return mockStudents.find((s) => s.id === id);
}

export function getDistinctInstruments(): string[] {
  return [...new Set(mockStudents.map((s) => s.instrument))].sort();
}

export function getDistinctLevels(): string[] {
  return [...new Set(mockStudents.map((s) => s.currentLevel))].sort();
}
