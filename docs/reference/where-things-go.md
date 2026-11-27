# Where things go

This page is for people who change Akrogon. It says which folder each kind of page belongs in, and the rules that keep the docs true.

## Folders

- `docs/guide/`: numbered guide chapters (`01` through `12`) read in order, each ending with previous and next links.
- `docs/reference/`: pages to look facts up in, such as commands, settings, files, phases, and rollback steps.
- `docs/pictures/`: SVG pictures, drawn in the [picture style](#pictures).
- `docs/reference-index.md`: the code index agents read first. It links each code area.

The [docs home](../README.md) lists every page.

## One home per fact

Each fact has one page that owns it. Other pages link to that page instead of repeating the fact. When two pages state the same fact, keep it on the page that owns it and replace the other copy with a link.

Agent procedure lives in `skills/`. A page links the skill, such as [chart-issues](../../skills/chart-issues/SKILL.md), and does not copy its steps.

## Links

Link only to things that exist: pages, pictures, skills and source files. Never link a placeholder or a page that is not written yet. `tests/docs-links.test.ts` fails on a link to a missing file or heading.

## Pictures

Every SVG in `docs/pictures/` follows these rules.

- Card: an opaque `#f4f1e6` card with a 1.5 px `#c4c0b3` border and rounded corners, so one file reads on GitHub light and dark pages.
- Palette: ink `#0f0f0f`, ink-soft `#6e6a5c`, beige `#f0ede0` and `#e0dccf`, and the sage scale `#e7ede2`, `#b7c8ae`, `#90a985`, `#7a9b76`, `#5e7355`.
- Strokes: 1.5 px with round caps and joins, flat fills, and dashed sage connectors.
- Fonts: the system sans stack (`ui-sans-serif, system-ui, ...`) and the `ui-monospace` stack. Labels stay as text so a rename search finds them.
- Mark: one group, titled `<title>Tamdoma</title>`, holding the "created by" text and the Tamdoma logotype as inline paths, placed at the bottom right by its one translate. Every picture copies the group whole from `docs/pictures/mode-and-route.svg` and changes only that translate.
- Still: no animation, no script, no `href`, no web font and no `@import`.
- Layout: about 960 px wide, read left to right, with short labels in the guide's words. No screenshots of command output.

## When code changes

A change to `src/` or `skills/` updates the page that owns each fact it changes, in the same change.
