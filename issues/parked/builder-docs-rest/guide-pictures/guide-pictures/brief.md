# Brief: guide-pictures

## What

Draw the four remaining pictures in the style docs/reference/where-things-go.md now states. This leaf consumes that style from charting-pictures and the guide pages from guide-chapters, which it embeds pictures in.
- `docs/pictures/three-tabs.svg`: the t-, c- and w- tabs in one herdr space and what runs in each. It is the README hero and appears on page 03.
- `docs/pictures/one-akrogon-many-repos.svg`: one install serving a made-up upstream repo and two product repos, on page 02.
- `docs/pictures/slot-a-and-b.svg`: slot A building and slot B reviewing, repairing or sending back, on page 09.
- `docs/pictures/watch-loop.svg`, redrawn: the merge turn and the overnight watcher, on pages 10 and 11.

Embed each picture with plain alt text. Delete every other old picture in docs/pictures/ (all except the four above and the two from charting-pictures), and replace any shelf-page embed of a deleted picture with text or a table.

## Why

The operator asked for pictures that make the working pattern easy to follow, in the tamdoma.ai look (signposts 5). The old 19 pictures use another style and older words.

## Done-criteria

1. The four SVGs exist and are embedded where the What section says. Each embed's alt text says in plain words what the picture shows, and labels use only the approved words.
2. Each picture follows the where-things-go.md picture style. The report's search of the four files finds no outside `href`, no `<script`, no `@import`, no `@font-face` and no `animation`, and finds the text "created by" and `<title>Tamdoma</title>` in each.
3. docs/pictures/ holds exactly the six new pictures. No page in README.md or docs/ links a deleted picture, and every link resolves.
4. Slot B renders each new picture on a white page and on a #0d1117 page, reads the screenshots, and answers "what does this picture show?" in its review. A picture that does not show its What content, or does not read on either page, is a Fix.
5. tests/watch-timer.test.ts still passes on the redrawn watch-loop.svg, and the destination's `checks` pass.
