# Brief: build-pictures

## What

Give the sections of docs/guide/09 and 10 pictures in the style of docs/pictures/charting-session.svg and the shared "created by" mark group from charting-pictures-more, embedded under their sections with plain alt text. A section may share a picture when the report gives a reason slot B accepts; a series drawn from one base drawing is fine.
Must include `docs/pictures/slot-a-and-b.svg` (page 09) and a merge picture of its own (page 10).

## Why

The operator: "I would like to have more images to explain every section." and "We need to rewrite everything like that." Rest shape R6 to R9 split the pictures by chapter.

## Done-criteria

1. Every `##` section of docs/guide/09 and 10 has a picture under it or shares one, each share named in the report with its reason and accepted by slot B. Alt text says in plain words what the picture shows; labels use only the approved words.
2. Every new picture holds the mark group with markup identical to charting-pictures-more's, apart from its translate. The report's search of every new SVG finds no `href`, no `<script`, no `@import`, no `@font-face`, no `animation` and no em dash, and finds "created by" and `<title>Tamdoma</title>` in each.
3. Slot B renders each new picture on a white page and one of them on a #0d1117 page, reads the screenshots, and answers "what does this picture show?" for each. A picture that does not show its section's content, or does not read, is a Fix.
4. The destination's `checks` pass.

