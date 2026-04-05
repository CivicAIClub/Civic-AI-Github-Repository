const chapelSpeaker = {
  name: 'chapelSpeaker',
  title: 'Chapel Speaker',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Student', value: 'Student' },
          { title: 'Alum', value: 'Alum' },
          { title: 'Guest Speaker', value: 'Guest Speaker' },
          { title: 'Faculty', value: 'Faculty' },
          { title: 'Staff', value: 'Staff' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'graduationYear',
      title: 'Graduation Year',
      type: 'number',
    },
    {
      name: 'bio',
      title: 'Bio (2-4 sentences)',
      type: 'text',
      rows: 4,
    },
    {
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'imageAuthenticityConfirmed',
          title: 'I confirm this image has not been digitally altered',
          type: 'boolean',
          description:
            'REQUIRED: You must confirm that this photograph has not been AI-enhanced, skin-tone adjusted, or otherwise digitally altered before publishing.',
          validation: (Rule: any) =>
            Rule.required().custom((value: boolean) =>
              value === true ? true : 'You must confirm image authenticity before publishing'
            ),
        },
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    },
    {
      name: 'youtubeUrl',
      title: 'YouTube Video URL',
      type: 'url',
      description: 'Paste the full YouTube URL for the chapel speech video',
    },
    {
      name: 'audioFile',
      title: 'Audio File (alternative to YouTube)',
      type: 'file',
      options: { accept: 'audio/*' },
    },
    {
      name: 'transcriptExcerpt',
      title: 'Transcript Excerpt',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Key excerpts from the speech',
    },
    {
      name: 'fullTranscript',
      title: 'Full Transcript',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'themes',
      title: 'Themes',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Identity', value: 'Identity' },
          { title: 'Belonging', value: 'Belonging' },
          { title: 'Justice', value: 'Justice' },
          { title: 'Heritage', value: 'Heritage' },
          { title: 'Growth', value: 'Growth' },
          { title: 'Community', value: 'Community' },
          { title: 'Change', value: 'Change' },
        ],
      },
    },
    {
      name: 'speechDate',
      title: 'Speech Date',
      type: 'date',
    },
    {
      name: 'featured',
      title: 'Featured Voice',
      type: 'boolean',
      initialValue: false,
      description: 'Show this speaker as the Featured Voice on the homepage',
    },
  ],
  preview: {
    select: {
      title: 'name',
      role: 'role',
      year: 'graduationYear',
      media: 'photo',
    },
    prepare({ title, role, year, media }: any) {
      return {
        title,
        subtitle: `${role}${year ? ` '${String(year).slice(2)}` : ''}`,
        media,
      };
    },
  },
};

export default chapelSpeaker;
