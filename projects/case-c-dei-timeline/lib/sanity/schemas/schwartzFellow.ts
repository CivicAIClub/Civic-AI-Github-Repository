// Schwartz Visiting Fellow schema — real public figures who visited campus
// as part of the speaker series founded by Michael '66 and Eric '69 Schwartz.
// All content is real (photos of actual people, real quotes, real biographies),
// so this schema enforces the same photo-authenticity constraint used across
// the site for images of real humans.

const schwartzFellow = {
  name: 'schwartzFellow',
  title: 'Schwartz Visiting Fellow',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'year',
      title: 'Year of Fellowship Visit',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(1989).max(2100),
    },
    {
      name: 'field',
      title: 'Field of Work',
      type: 'string',
      description: 'e.g., "Literature", "Planetary Science", "Broadcast Journalism"',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'bio',
      title: 'Biography',
      type: 'array',
      of: [{ type: 'block' }],
      description:
        '2–4 paragraphs of factual biography. Source must be public-record research. Do not generate with AI.',
    },
    {
      name: 'photo',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'imageAuthenticityConfirmed',
          title: 'I confirm this photograph has not been digitally altered',
          type: 'boolean',
          description:
            'REQUIRED: This photograph must not be AI-enhanced, skin-tone adjusted, or otherwise digitally altered before publishing.',
          validation: (Rule: any) =>
            Rule.required().custom((value: boolean) =>
              value === true ? true : 'You must confirm image authenticity before publishing'
            ),
        },
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the photograph for screen readers. Include the fellow\'s name.',
        },
        {
          name: 'credit',
          title: 'Photo Credit',
          type: 'string',
          description: 'Source attribution (photographer, publisher, or institution).',
        },
      ],
    },
    {
      name: 'note',
      title: 'Note',
      type: 'string',
      description: 'Optional marker text (e.g., "2nd visit").',
    },
    {
      name: 'secondVisit',
      title: 'Is this a second visit?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'featured',
      title: 'Featured Fellow',
      type: 'boolean',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'year',
      media: 'photo',
    },
  },
};

export default schwartzFellow;
