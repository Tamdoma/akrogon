# Where things go

This page is for people who change Akrogon. It says which folder each kind of page belongs in, and the rules that keep the docs true.

## Folders

- `docs/start/`: pages a new reader reads in order, each ending with a link to the next one.
- `docs/use/`: one page per reader goal, such as planning work or recovering a failed leaf.
- `docs/reference/`: pages to look facts up in, such as commands, settings and phases.
- `docs/examples/`: real cases told in order, with links to the pages behind each step.
- `docs/pictures/`: SVG pictures. Each one draws its own background card, so it reads the same on a light or dark page.
- `docs/reference-index.md`: the code index agents read first. It links each code area.

The [docs home](../README.md) lists every page.

## One home per fact

Each fact has one page that owns it. Other pages link to that page instead of repeating the fact. When two pages state the same fact, keep it on the page that owns it and replace the other copy with a link.

Agent procedure lives in `skills/`. A page links the skill, such as [chart-issues](../../skills/chart-issues/SKILL.md), and does not copy its steps.

## Links

Link only to things that exist: pages, pictures, skills and source files. Never link a placeholder or a page that is not written yet. `tests/docs-links.test.ts` fails on a link to a missing file or heading.

## When code changes

A change to `src/` or `skills/` updates the page that owns each fact it changes, in the same change.
