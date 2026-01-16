import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const pageType = defineType({
  name: 'page',
  title: 'Pages',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'layout',
      title: 'Page Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Default', value: 'default'},
          {title: 'About', value: 'about'},
          {title: 'Contact', value: 'contact'},
        ],
        layout: 'radio',
      },
      initialValue: 'default',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      type: 'array',
      of: [
        {
          type: 'block',
        },
        {
          type: 'image',
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
          ],
        },
      ],
      hidden: ({document}) => document?.layout === 'contact',
    }),
    // Contact-specific fields (conditionally shown)
    defineField({
        name: 'heading',
        title: 'Heading',
        type: 'string',
        hidden: ({document}) => document?.layout !== 'contact',
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      hidden: ({document}) => document?.layout !== 'contact',
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      hidden: ({document}) => document?.layout !== 'contact',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      hidden: ({document}) => document?.layout !== 'contact',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      hidden: ({document}) => document?.layout !== 'contact',
      fields: [
        {name: 'twitter', type: 'url', title: 'Twitter'},
        {name: 'linkedin', type: 'url', title: 'LinkedIn'},
        {name: 'instagram', type: 'url', title: 'Instagram'},
      ],
    }),
    // About-specific fields
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      hidden: ({document}) => document?.layout !== 'about',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      hidden: ({document}) => document?.layout !== 'about',
    }),
    // SEO fields (for all pages)
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          type: 'string',
          title: 'Meta Title',
        },
        {
          name: 'metaDescription',
          type: 'text',
          title: 'Meta Description',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      layout: 'layout',
      slug: 'slug.current',
    },
    prepare({title, layout, slug}) {
      return {
        title: title,
        subtitle: `${layout} layout • /${slug}`,
      }
    },
  },
})