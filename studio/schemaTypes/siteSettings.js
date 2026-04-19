import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Browser title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Short line under your name on the HUD.",
    }),
    defineField({
      name: "statusLine",
      title: "Status line (HUD)",
      type: "string",
      description: 'e.g. "SYS / CONSTELLATION v1"',
    }),
    defineField({
      name: "availableForWork",
      title: "Available for work",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "defaultMetaDescription",
      title: "Default meta description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "resumeUrl",
      title: "Resume URL",
      type: "url",
    }),
    defineField({
      name: "cvUrl",
      title: "CV URL",
      type: "url",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "url", type: "url", title: "URL" },
          ],
        },
      ],
    }),
    defineField({
      name: "bootMessages",
      title: "Boot log lines",
      type: "array",
      of: [{ type: "string" }],
      description: "Optional override for boot sequence lines.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site settings" };
    },
  },
});
