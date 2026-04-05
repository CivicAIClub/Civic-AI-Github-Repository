const humanOfPomfret = {
  name: 'humanOfPomfret',
  title: 'Human of Pomfret',
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
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required(),
      fields: [
        {
          name: 'imageAuthenticityConfirmed',
          title: 'I confirm this image has not been digitally altered',
          type: 'boolean',
          description:
            'REQUIRED: Confirm this photograph has not been AI-enhanced or digitally altered.',
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
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Student', value: 'Student' },
          { title: 'Alum', value: 'Alum' },
          { title: 'Faculty', value: 'Faculty' },
          { title: 'Head of School', value: 'Head of School' },
          { title: 'Staff', value: 'Staff' },
          { title: 'Guest', value: 'Guest' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'yearsAtPomfret',
      title: 'Years at Pomfret',
      type: 'string',
      description: 'e.g., "2005-2009" or "1998-present"',
    },
    {
      name: 'relatedChapelVoice',
      title: 'Related Chapel Voice',
      type: 'reference',
      to: [{ type: 'chapelSpeaker' }],
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    },
  ],
  preview: {
    select: {
      title: 'name',
      role: 'role',
      media: 'photo',
    },
    prepare({ title, role, media }: any) {
      return { title, subtitle: role, media };
    },
  },
};

export default humanOfPomfret;
