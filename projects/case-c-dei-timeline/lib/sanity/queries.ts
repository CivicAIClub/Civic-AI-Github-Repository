// GROQ queries for all content types.
// These are reference queries for when the Sanity CMS is wired up;
// the site currently reads content from static TS files in `lib/data/`.

// ─────────────────────────────────────────────────────────────────
// Timeline Events
// ─────────────────────────────────────────────────────────────────
export const timelineEventsQuery = `*[_type == "timelineEvent"] | order(date asc) {
  _id,
  title,
  date,
  endDate,
  description,
  category,
  media,
  "relatedProfile": relatedProfile->{name, slug, photo},
  sourceAttribution,
  featured
}`;

export const timelineEventsByCategoryQuery = `*[_type == "timelineEvent" && category == $category] | order(date asc) {
  _id, title, date, endDate, description, category, media, sourceAttribution, featured
}`;

export const timelineEventsInRangeQuery = `*[_type == "timelineEvent" && date >= $startDate && date <= $endDate] | order(date asc) {
  _id, title, date, endDate, description, category, media, sourceAttribution, featured
}`;

// ─────────────────────────────────────────────────────────────────
// Humans of Pomfret
// ─────────────────────────────────────────────────────────────────
export const profilesQuery = `*[_type == "humanOfPomfret"] | order(_createdAt desc) {
  _id, name, slug, photo, quote, bio, role, yearsAtPomfret, tags
}`;

export const profileBySlugQuery = `*[_type == "humanOfPomfret" && slug.current == $slug][0] {
  _id, name, slug, photo, quote, bio, role, yearsAtPomfret, tags
}`;

export const headsOfSchoolQuery = `*[_type == "humanOfPomfret" && role == "Head of School"] | order(yearsAtPomfret asc) {
  _id, name, slug, photo, quote, bio, yearsAtPomfret
}`;

// ─────────────────────────────────────────────────────────────────
// Tour Stops
// ─────────────────────────────────────────────────────────────────
export const tourStopsQuery = `*[_type == "tourStop"] | order(locationName asc) {
  _id, locationName, slug, quickSummary, heroPhoto, gpsCoordinates
}`;

export const tourStopBySlugQuery = `*[_type == "tourStop" && slug.current == $slug][0] {
  _id, locationName, slug, quickSummary, audioNarration, deepDiveContent,
  heroPhoto, gpsCoordinates,
  "relatedTimelineEvents": relatedTimelineEvents[]->{_id, title, date, category},
  "relatedProfiles": relatedProfiles[]->{name, slug, photo}
}`;

// ─────────────────────────────────────────────────────────────────
// Schwartz Visiting Fellows (formerly famousFigure — now real people)
// ─────────────────────────────────────────────────────────────────
export const schwartzFellowsQuery = `*[_type == "schwartzFellow"] | order(year desc) {
  _id, name, year, field, bio, photo, note, secondVisit, featured
}`;

export const schwartzFellowByYearQuery = `*[_type == "schwartzFellow" && year == $year][0] {
  _id, name, year, field, bio, photo, note, secondVisit, featured
}`;
