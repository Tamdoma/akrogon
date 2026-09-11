# Brief: docs-shell

## What
Create `docs/style.css`, `docs/index.html` and `docs/idea.html` as the pattern every other page copies. The stylesheet is the CSS moved out of guide.html. Each page has the shared head, a sticky nav with a link per page, one section, and the footer. guide.html is not modified.

## Why
Every page leaf needs a fixed shell to copy. Only this shell is a real prerequisite for the parallel page leaves.

## Done-criteria
1. `docs/style.css` exists and `docs/idea.html` and `docs/index.html` render with the same fonts, palette and layout as the matching parts of guide.html when opened in a browser, with no inline `<style>` block.
2. Both pages contain the nav with sixteen links in the order index, idea, parts, state, install, setup, create, next, phases, files, merge, in-practice, limits, problems, learn, cheat, and the current page marked `aria-current="page"`.
3. `docs/idea.html` contains the full `idea` section markup from guide.html byte for byte inside `<main>`.
4. `docs/index.html` contains the hero section and one link with a one-line description per page.
5. `docs/guide.html` is unchanged.
6. A verification command renders `docs/idea.html` headless (the browser-core render or a Playwright screenshot) and leaves the screenshot path as evidence.
