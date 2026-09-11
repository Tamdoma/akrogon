# Intake: docs-multipage

## Scope
One issue, likely a shell leaf then parallel page leaves, all under docs/.

## Provenance
- GitHub: Tamdoma/akrogon#3

## Source: Tamdoma/akrogon#3

Unverified intake.

## Observation
`docs/guide.html` has become one long page that explains every concept, every use case, the limits, and troubleshooting at once. The reporter finds it too cluttered to read.

## Location
Project: akrogon. Surface: documentation site, `docs/guide.html`.

## Reproduction
Open `docs/guide.html`. Frequency: constant, it is the current state of the file.

## Expected behavior
Docs become a small multi-page site with a shared nav:

- One page per concept: the idea, moving parts, state file, install, repo setup, creating work, how `next` picks work, phases, where files live, merge and broadcast, limits, troubleshooting, leftovers, cheat sheet.
- One "in practice" page that walks a worked example from seed to merge using the akrogon repo itself.
- A short index page.

Same design system as the current guide: Spectral body, Bricolage Grotesque headings, Martian Mono labels, Tamdoma logotype, sage and parchment palette, the same SVG style. Plain HTML, no build step.

## Urgency
Impact: the guide is hard to read in its current form. Workaround: Not provided.
## Agent findings
- docs/guide.html is 969 lines, 87 KB, one file with inline CSS (design tokens, fonts, nav, sections) and 7 inline SVGs.
- Its 17 sections by id: hero, idea, parts, state, install, setup, create, next, phases, files, merge, day, cases, limits, problems, learn, cheat. The requested page list maps one to one except: "day" and "cases" have no requested page and are the natural material for the "in practice" page; "learn" is the requested "leftovers".
- Existing nav is a sticky header with logotype and a meta row, no page links. A multi-page site needs a nav with links, repeated on every page.
- With no build step, the shared nav and head are either duplicated in every file or the CSS is moved to docs/style.css and only the nav markup is duplicated.
