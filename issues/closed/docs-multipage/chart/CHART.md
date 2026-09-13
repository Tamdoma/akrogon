# Chart: docs become a small multi-page site

## Destination
`docs/` is a plain-HTML site with no build step: a short index page, one page per concept, one "in practice" page walking a worked example from seed to merge on the akrogon repo itself, and a shared nav on every page. Same design system as the current guide.

## Forks taken
- [Shared shell in plain HTML](forks/shared-shell.md): one `docs/style.css`, head and nav markup repeated per page.
- [Page set and fate of guide.html](forks/page-set.md): index, in-practice, one page per section id; guide.html deleted.
- [Leaf split](forks/leaf-split.md): shell leaf first, then parallel page leaves.

## Forks open
None.

## Fog
The worked example content: which real issue it follows. It can only be picked after the shell exists and one small issue has actually run through seed to merge.

## Off route
- Changing the design system (fonts, palette, logotype, SVG style).
- Adding a build step or a static site generator.

Handed off 2026-09-11 into `../../open/docs-multipage/`.
