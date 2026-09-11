# Brief: docs-concepts

## What
Create `docs/parts.html`, `docs/state.html`, `docs/phases.html` and `docs/files.html` from the sections of the same ids in guide.html, using the shell from `docs/idea.html`.

## Why
The concept sections become their own pages so the guide is no longer one long scroll.

## Done-criteria
1. Each of the four pages exists, links `style.css`, has the sixteen-link nav with its own link marked `aria-current="page"`, and contains no inline `<style>`.
2. Each page's `<main>` holds the full section markup of its id from guide.html, with same-page anchors to other sections rewritten to the target page file.
3. `docs/guide.html`, `docs/idea.html`, `docs/index.html` and `docs/style.css` are unchanged.
4. A verification command renders each page headless and leaves screenshot paths as evidence.
