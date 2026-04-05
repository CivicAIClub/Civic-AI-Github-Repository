// GROQ queries for all content types

// Timeline Events
export const timelineEventsQuery = `*[_type == "timelineEvent"] | order(date asc) {
  _id,
  title,
  date,
  endDate,
  description,
  category,
  media,
  "relatedChapelVoice": relatedChapelVoice->{name, slug, photo},
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

// Chapel Voices
export const chapelSpeakersQuery = `*[_type == "chapelSpeaker"] | order(speechDate desc) {
  _id, name, slug, role, graduationYear, bio, photo, youtubeUrl,
  transcriptExcerpt, themes, speechDate, featured
}`;

export const chapelSpeakerBySlugQuery = `*[_type == "chapelSpeaker" && slug.current == $slug][0] {
  _id, name, slug, role, graduationYear, bio, photo, youtubeUrl, audioFile,
  transcriptExcerpt, fullTranscript, themes, speechDate, featured,
  "relatedSpeakers": *[_type == "chapelSpeaker" && _id != ^._id && count(themes[@ in ^.themes[]]) > 0][0..3] {
    name, slug, photo, themes
  }
}`;

export const featuredChapelSpeakerQuery = `*[_type == "chapelSpeaker" && featured == true][0] {
  _id, name, slug, role, graduationYear, bio, photo, youtubeUrl,
  transcriptExcerpt, themes, speechDate
}`;

// Humans of Pomfret
export const profilesQuery = `*[_type == "humanOfPomfret"] | order(_createdAt desc) {
  _id, name, slug, photo, quote, bio, role, yearsAtPomfret, tags,
  "relatedChapelVoice": relatedChapelVoice->{name, slug}
}`;

export const profileBySlugQuery = `*[_type == "humanOfPomfret" && slug.current == $slug][0] {
  _id, name, slug, photo, quote, bio, role, yearsAtPomfret, tags,
  "relatedChapelVoice": relatedChapelVoice->{name, slug, photo, themes}
}`;

export const headsOfSchoolQuery = `*[_type == "humanOfPomfret" && role == "Head of School"] | order(yearsAtPomfret asc) {
  _id, name, slug, photo, quote, bio, yearsAtPomfret
}`;

// Tour Stops
export const tourStopsQuery = `*[_type == "tourStop"] | order(locationName asc) {
  _id, locationName, slug, quickSummary, heroPhoto, gpsCoordinates
}`;

export const tourStopBySlugQuery = `*[_type == "tourStop" && slug.current == $slug][0] {
  _id, locationName, slug, quickSummary, audioNarration, deepDiveContent,
  heroPhoto, gpsCoordinates,
  "relatedTimelineEvents": relatedTimelineEvents[]->{_id, title, date, category},
  "relatedChapelVoices": relatedChapelVoices[]->{name, slug, photo},
  "relatedProfiles": relatedProfiles[]->{name, slug, photo}
}`;

// Famous Figures
export const famousFiguresQuery = `*[_type == "famousFigure"] | order(name asc) {
  _id, name, era, fieldOfWork, narrative, videoUrl, videoFile
}`;
