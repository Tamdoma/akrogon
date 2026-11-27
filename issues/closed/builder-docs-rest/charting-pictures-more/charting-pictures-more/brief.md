# Brief: charting-pictures-more

## What

- Make the "created by" mark one group holding the text and the Tamdoma logotype, placed by one translate, with the logo centred on the text line. Use that same group in docs/pictures/charting-session.svg and mode-and-route.svg (only charting-session.svg is visibly off today, about 4 px high), and say in docs/reference/where-things-go.md that every picture copies this group whole.
- Give the sections of docs/guide/04 to 08 pictures in the same style, embedded under their sections with plain alt text. A section may share a picture when the report gives a reason slot B accepts, and a series drawn from one base drawing is fine. A picture above a page's first `##` counts for its opener. Page 04's `## Where you chart: the c- tab` gets no picture: guide-chapters shrinks it to a link to page 03, which three-tabs.svg illustrates.

## Why

The operator: "I would like to have more images to explain every section. The images look really, really good. The only thing is that the logo is not correctly positioned on the vertical axis." The rest of the guide copies this chapter's pictures (rest shape R6 to R9).

## Done-criteria

1. The mark group's markup is identical in every picture this leaf touches or adds, apart from its translate. Slot B confirms on a rendered screenshot that the logo sits on the "created by" line.
2. Every `##` section of docs/guide/04 to 08 except 04's c- tab section has a picture under it or shares one, each share named in the report with its reason and accepted by slot B. Alt text says in plain words what the picture shows; labels use only the approved words.
3. The report's search of every new or changed SVG finds no `href`, no `<script`, no `@import`, no `@font-face`, no `animation` and no em dash, and finds the text "created by" and `<title>Tamdoma</title>` in each.
4. Slot B renders each new or changed picture on a white page and one of them on a #0d1117 page, reads the screenshots, and answers "what does this picture show?" for each. A picture that does not show its section's content, or does not read, is a Fix.
5. The destination's `checks` pass, including tests/docs-links.test.ts and the dash guard.
