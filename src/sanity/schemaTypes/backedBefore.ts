import { defineField, defineType } from "sanity";

/**
 * Home — "Backed Before Anyone Else Did" marquee section.
 *
 * Singleton document. Mirrors BackedBeforeClient.tsx:
 *   - Two-line heading ("Backed Before" highlighted + "Anyone Else Did")
 *   - Two draggable marquee rows of brand logos (rows scroll opposite directions)
 *
 * Logo objects intentionally carry a `scaleClass` Tailwind helper because
 * many source logos are different sizes — `scale-[1.3]` etc. lets editors
 * normalise visual weight per-logo without re-exporting images.
 */

/** Shared logo object — used by both marquee rows. Lives at the top so we
 *  can't accidentally desync the two arrays' shapes. */
const logoItem = {
  type: "object" as const,
  name: "backedBeforeLogo",
  fields: [
    defineField({
      name: "name",
      title: "Brand name (alt text)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Logo image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "scaleClass",
      title: "Scale helper (Tailwind)",
      description:
        'Optional. Used to normalise visual size. e.g. "scale-[1.3]", "scale-[0.7]", or leave blank for native size.',
      type: "string",
      initialValue: "",
    }),
  ],
  preview: {
    select: { title: "name", media: "image" },
  },
};

export const backedBefore = defineType({
  name: "backedBefore",
  title: "Home — Backed Before Section",
  type: "document",

  fields: [
    defineField({
      name: "heading1",
      title: "Heading — line 1 (italic + highlighted)",
      description: 'e.g. "Backed Before"',
      type: "string",
    }),
    defineField({
      name: "heading2",
      title: "Heading — line 2 (plain)",
      description: 'e.g. "Anyone Else Did"',
      type: "string",
    }),
    defineField({
      name: "marquet1",
      title: "Marquee row 1 (scrolls left → right)",
      type: "array",
      of: [logoItem],
    }),
    defineField({
      name: "marquet2",
      title: "Marquee row 2 (scrolls right → left)",
      type: "array",
      of: [logoItem],
    }),
  ],

  preview: { prepare: () => ({ title: "Home — Backed Before Section" }) },
});
