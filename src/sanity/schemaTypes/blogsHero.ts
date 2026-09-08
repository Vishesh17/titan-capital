import { defineField, defineType } from "sanity";

/**
 * Blogs — Hero. Its own document, separate from the listing below it, so the
 * headline can be edited without opening the page that holds every post.
 */
export const blogsHero = defineType({
  name: "blogsHero",
  title: "Blogs — Hero",
  type: "document",

  fields: [
    /* ONE FIELD, and the line breaks are the ones you type.
     *
     * It was two — "first line" and "second line" — which forced exactly two
     * lines whatever the copy was: a one-line headline had to leave a field
     * empty, and a three-line one could not be written at all. A single `text`
     * field lets the editor decide, and the page renders the breaks verbatim.
     *
     * The old pair is no longer declared here, but any value still sitting in
     * those fields is read as a fallback by blogsHeroQuery, so a document that
     * has not been migrated keeps rendering exactly as it did. */
    defineField({
      name: "heading",
      title: "Heading",
      description:
        "One line per line. Press Enter where you want the headline to break — e.g. \"Blogs And News\" then \"Titan Capital\" gives two lines; a single line stays a single line.",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      description:
        "Optional. Leave it empty and the heading sits centred in the hero on its own.",
      type: "richText",
    }),
  ],

  preview: { prepare: () => ({ title: "Blogs — Hero" }) },
});
