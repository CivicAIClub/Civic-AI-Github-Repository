const timelineEvent = {
  name: 'timelineEvent',
  title: 'Timeline Event',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'endDate',
      title: 'End Date (for spanning events)',
      type: 'date',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Milestones', value: 'Milestones' },
          { title: 'People', value: 'People' },
          { title: 'Policy Changes', value: 'Policy Changes' },
          { title: 'Student Voices', value: 'Student Voices' },
          { title: 'Cultural Events', value: 'Cultural Events' },
          { title: 'Leadership', value: 'Leadership' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [
        { type: 'image', options: { hotspot: true } },
        {
          type: 'file',
          title: 'Audio File',
          options: { accept: 'audio/*' },
        },
        {
          type: 'object',
          name: 'videoUrl',
          title: 'Video URL',
          fields: [
            {
              name: 'url',
              title: 'YouTube or Video URL',
              type: 'url',
            },
          ],
        },
      ],
    },
    {
      name: 'relatedChapelVoice',
      title: 'Related Chapel Voice',
      type: 'reference',
      to: [{ type: 'chapelSpeaker' }],
    },
    {
      name: 'relatedProfile',
      title: 'Related Profile',
      type: 'reference',
      to: [{ type: 'humanOfPomfret' }],
    },
    {
      name: 'sourceAttribution',
      title: 'Source / Attribution',
      type: 'string',
    },
    {
      name: 'featured',
      title: 'Featured Event',
      type: 'boolean',
      initialValue: false,
    },
  ],
  orderings: [
    {
      title: 'Date, Oldest First',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      category: 'category',
    },
    prepare({ title, date, category }: any) {
      return {
        title,
        subtitle: `${date || 'No date'} — ${category || 'Uncategorized'}`,
      };
    },
  },
};

export default timelineEvent;
