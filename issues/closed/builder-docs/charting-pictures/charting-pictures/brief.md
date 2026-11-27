# Brief: charting-pictures

## What

Draw two pictures for the charting chapter and set the picture style every later picture follows:
- `docs/pictures/mode-and-route.svg`: Charting mode and Build route as two separate choices. It shows the three modes and the two routes, and that Direct is available only with No autopilot.
- `docs/pictures/charting-session.svg`: one charting session in the c- tab. It shows the signposts, the map with consultants, the decisions, and the hand-off.

Embed them in docs/guide/04-a-charting-session.md, 06-charting-mode.md and 07-build-route.md, with plain alt text. Rewrite the picture rules in docs/reference/where-things-go.md to the new style.

This leaf consumes the charting pages charting-guide writes, which the pictures are embedded in.

## Why

The operator finds today's pictures hard to follow (intake) and asked for the tamdoma.ai look with a small "created by Tamdoma" mark (signposts 5). The operator reads the charting chapter with these pictures before the rest is written (signposts 7a), so they also test the style.

## Done-criteria

1. Both SVGs exist and are embedded in the named pages. Each embed's alt text says in plain words what the picture shows. The pictures show what the What section says, and their labels use only the approved words.
2. Style: an opaque parchment card (#f4f1e6) with a #c4c0b3 border, ink #0f0f0f, sage accents from the Tamdoma scale, 1.5 px rounded strokes with flat fills, system sans and mono font stacks with labels kept as text, and in a bottom corner the attribution as the text "created by" followed by the Tamdoma logotype drawn as inline paths in a group titled `<title>Tamdoma</title>`. No `href` to an outside resource, no script, no web font, no animation. Proof: the report shows a search of both files for `href=`, `<script`, `@import`, `@font-face` and `animation` with no outside hits, and finds the text "created by" and `<title>Tamdoma</title>` in each.
3. docs/reference/where-things-go.md states the new picture style (card, palette, strokes, fonts, mark, still), so later pictures follow it.
4. Slot B renders each picture (rsvg-convert or headless Chromium) on a white page and on a #0d1117 page, reads the screenshots, and answers "what does this picture show?" in its review. A picture that does not show the What content, or does not read on either page, is a Fix.
5. The destination's `checks` pass, including tests/docs-links.test.ts.
