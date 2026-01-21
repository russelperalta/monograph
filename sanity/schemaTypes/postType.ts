import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  orderings: [
    {
      title: 'Order, Ascending',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}]
    },
    {
      title: 'Order, Descending',
      name: 'orderDesc',
      by: [{field: 'order', direction: 'desc'}]
    },
    {
      title: 'Title, A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }]
    },
    {
      title: 'Title, Z-A',
      name: 'titleDesc',
      by: [{ field: 'title', direction: 'desc' }]
    },
  ],
  fieldsets: [
    {
      name: 'left',
      title: 'Left Side',
      options: { collapsible: true, collapsed: false }
    },
    {
      name: 'right',
      title: 'Right Side',
      options: { collapsible: true, collapsed: false }
    },
  ],
  fields: [
    defineField({
      name: 'contentType',
      title: 'Content Type',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Custom', value: 'custom' },
          { title: 'Contact', value: 'contact'},
        ],
        layout: 'radio'
      },
      initialValue: 'default',
    }),
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first',
    }),
    defineField({
      name: 'leftImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        })
      ],
      hidden: ({document}) => document?.contentType === 'default',
      fieldset: 'left',
    }),
    defineField({
      name: 'leftPreviewImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        })
      ],
      hidden: ({document}) => document?.contentType === 'custom' || document?.contentType === 'contact',
      fieldset: 'left',
    }),
    defineField({
      name: 'leftBody',
      title: 'Left Content',
      type: 'blockContent',
      fieldset: 'left',
      hidden: ({document}) => document?.contentType === 'contact',
    }),
    defineField({
      name: 'rightImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        })
      ],
      hidden: ({document}) => document?.contentType === 'contact',
      fieldset: 'right',
    }),
    defineField({
      name: 'rightBody',
      title: 'Right Content',
      type: 'blockContent',
      hidden: ({document}) => document?.contentType === 'default',
      fieldset: 'right',
    }),
    defineField({
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text'
            }
          ],
        }
      ],
      options: {
        layout: 'grid',
      },
      hidden: ({document}) => document?.contentType === 'custom' || document?.contentType === 'contact',
    }),
    // defineField({
    //   name: 'categories',
    //   type: 'array',
    //   of: [defineArrayMember({type: 'reference', to: {type: 'category'}})],
    // }),
    defineField({
      name: 'projectYear',
      title: 'Project Year',
      type: 'number',
      validation: Rule => Rule.max(9999),
      hidden: ({document}) => document?.contentType === 'custom' || document?.contentType === 'contact' ,
      fieldset: 'left',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
})
