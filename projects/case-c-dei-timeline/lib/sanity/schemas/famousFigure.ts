const famousFigure = {
  name: 'famousFigure',
  title: 'Famous Figure',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'era',
      title: 'Historical Era',
      type: 'string',
      description: 'e.g., "Renaissance", "20th Century", "Ancient Greece"',
    },
    {
      name: 'fieldOfWork',
      title: 'Field of Work',
      type: 'string',
      description: 'e.g., "Science", "Literature", "Civil Rights", "Art"',
    },
    {
      name: 'narrative',
      title: 'Contextual Narrative',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Why this figure matters to Pomfret\'s mission',
    },
    {
      name: 'videoUrl',
      title: 'AI-Generated Video URL',
      type: 'url',
      description: 'URL to hosted AI-generated portrait video (HeyGen, D-ID, Synthesia)',
    },
    {
      name: 'videoFile',
      title: 'AI-Generated Video File',
      type: 'file',
      options: { accept: 'video/*' },
      description: 'Alternative: upload video file directly',
    },
    {
      name: 'portrait',
      title: 'Portrait Image',
      type: 'image',
      options: { hotspot: true },
      description: 'AI-generated portrait image — will display AI Content Badge automatically',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'fieldOfWork',
      media: 'portrait',
    },
  },
};

export default famousFigure;
