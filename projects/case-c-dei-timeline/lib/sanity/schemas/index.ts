import timelineEvent from './timelineEvent';
import schwartzFellow from './schwartzFellow';
import humanOfPomfret from './humanOfPomfret';
import tourStop from './tourStop';

// Active Sanity schemas. Note: the original `chapelSpeaker` schema was deleted
// when the Chapel Voices feature was cancelled. The original `famousFigure`
// schema (which modeled AI-generated video content) was replaced by
// `schwartzFellow` when the feature switched to documenting real Pomfret
// visiting fellows.
export const schemaTypes = [
  timelineEvent,
  schwartzFellow,
  humanOfPomfret,
  tourStop,
];
