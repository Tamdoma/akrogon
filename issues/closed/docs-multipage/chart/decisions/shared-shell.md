# How are nav and CSS shared across pages with no build step?

## Question
Move the CSS to one `docs/style.css` and repeat only the head and nav markup in each page, or keep everything inline in every page?

### Carries
Reporter: plain HTML, no build step. Same design system as the current guide.

## Findings
- The inline CSS block is about 200 lines. Duplicating it in 17 files means 17 edits per style change. One stylesheet is still plain HTML with no build step.
- Nav markup (logotype SVG plus links) is short and must be repeated either way.

## Resolution
Operator answer (2026-09-11): `3-A`. One `docs/style.css`; each page repeats only head and nav markup. Reason: one place for style changes, still plain HTML with no build step. Foreclosed: inlining the CSS in every page.

