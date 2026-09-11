# Brief: docs-practice

## What
Create `docs/in-practice.html` from the `day` and `cases` sections, and `docs/limits.html`, `docs/problems.html`, `docs/learn.html`, `docs/cheat.html` from the sections of the same ids in guide.html, using the shell from `docs/idea.html`. The worked seed-to-merge example is excluded and comes later.

## Why
The practical and reference sections become their own pages so the guide is no longer one long scroll.

## Done-criteria
1. Each of the five pages exists, links `style.css`, has the sixteen-link nav with its own link marked `aria-current="page"`, and contains no inline `<style>`.
2. `in-practice.html` holds the full `day` section markup followed by the full `cases` section markup from guide.html; the other four pages hold the full section of their id. Same-page anchors to other sections are rewritten to the target page file.
3. `docs/guide.html`, `docs/idea.html`, `docs/index.html` and `docs/style.css` are unchanged.
4. A verification command renders each page headless and leaves screenshot paths as evidence.
