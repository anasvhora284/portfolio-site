import { defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "One line for star / HUD preview.",
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Case study body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "liveUrl",
      title: "Live / demo / primary link",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "repoUrl",
      title: "Repository URL",
      type: "url",
    }),
    defineField({
      name: "articleUrl",
      title: "Article / post URL",
      type: "url",
    }),
    defineField({
      name: "starPosition",
      title: "Star position (optional)",
      type: "object",
      fields: [
        defineField({ name: "x", type: "number", title: "X (-1…1)" }),
        defineField({ name: "y", type: "number", title: "Y (-1…1)" }),
        defineField({ name: "z", type: "number", title: "Z (-1…1)" }),
      ],
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
    }),
    defineField({
      name: "roles",
      title: "Roles",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "stack",
      title: "Stack",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order (lower first)",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "title", media: "coverImage" },
  },
});
