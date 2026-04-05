const tourStop = {
  name: 'tourStop',
  title: 'Tour Stop',
  type: 'document',
  fields: [
    {
      name: 'locationName',
      title: 'Location Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'locationName', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'heroPhoto',
      title: 'Hero Photo',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'quickSummary',
      title: 'Quick Summary',
      type: 'object',
      fields: [
        {
          name: 'en',
          title: 'English',
          type: 'text',
          rows: 3,
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: 'es',
          title: 'Spanish',
          type: 'text',
          rows: 3,
        },
      ],
    },
    {
      name: 'audioNarration',
      title: 'Audio Narration',
      type: 'object',
      fields: [
        {
          name: 'en',
          title: 'English Audio',
          type: 'file',
          options: { accept: 'audio/*' },
        },
        {
          name: 'es',
          title: 'Spanish Audio',
          type: 'file',
          options: { accept: 'audio/*' },
        },
      ],
    },
    {
      name: 'deepDiveContent',
      title: 'Deep Dive Content',
      type: 'object',
      fields: [
        {
          name: 'en',
          title: 'English',
          type: 'array',
          of: [
            { type: 'block' },
            { type: 'image', options: { hotspot: true } },
          ],
        },
        {
          name: 'es',
          title: 'Spanish',
          type: 'array',
          of: [
            { type: 'block' },
            { type: 'image', options: { hotspot: true } },
          ],
        },
      ],
    },
    {
      name: 'relatedTimelineEvents',
      title: 'Related Timeline Events',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'timelineEvent' }] }],
    },
    {
      name: 'relatedChapelVoices',
      title: 'Related Chapel Voices',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'chapelSpeaker' }] }],
    },
    {
      name: 'relatedProfiles',
      title: 'Related Profiles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'humanOfPomfret' }] }],
    },
    {
      name: 'gpsCoordinates',
      title: 'GPS Coordinates',
      type: 'geopoint',
    },
  ],
  preview: {
    select: {
      title: 'locationName',
      media: 'heroPhoto',
    },
  },
};

export default tourStop;
