# Brief: away-pictures

## What

Give the sections of docs/guide/11 and 12 pictures in the style of docs/pictures/charting-session.svg and the shared "created by" mark group from charting-pictures-more, embedded under their sections with plain alt text. A section may share a picture when the report gives a reason slot B accepts; a series drawn from one base drawing is fine.
Must include `docs/pictures/watch-loop.svg` redrawn as the overnight watcher (page 11). Delete every old-style picture in docs/pictures/ and replace any shelf-page embed of a deleted picture with text or a table.

## Why

The operator: "I would like to have more images to explain every section." and "We need to rewrite everything like that." Rest shape R6 to R9 split the pictures by chapter.

## Done-criteria

1. Every `##` section of docs/guide/11 and 12 has a picture under it or shares one, each share named in the report with its reason and accepted by slot B. Alt text says in plain words what the picture shows; labels use only the approved words.
2. Every new picture holds the mark group with markup identical to charting-pictures-more's, apart from its translate. The report's search of every new SVG finds no `href`, no `<script`, no `@import`, no `@font-face`, no `animation` and no em dash, and finds "created by" and `<title>Tamdoma</title>` in each.
3. Slot B renders each new picture on a white page and one of them on a #0d1117 page, reads the screenshots, and answers "what does this picture show?" for each. A picture that does not show its section's content, or does not read, is a Fix.
4. docs/pictures/ holds only new-style pictures. No page in README.md or docs/ links a deleted picture, and every link resolves.
5. tests/watch-timer.test.ts still passes on the redrawn watch-loop.svg and page 11 (no "cron", "expir" or "akrogon status" in the watcher section, alt text included), and the destination's `checks` pass.

