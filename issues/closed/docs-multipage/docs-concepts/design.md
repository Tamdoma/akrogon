# Design: docs-concepts

## Binding decisions, verbatim

# How are nav and CSS shared across pages with no build step?
## Question
Move the CSS to one `docs/style.css` and repeat only the head and nav markup in each page, or keep everything inline in every page?

## Resolution
Operator answer (2026-09-11): `3-A`. One `docs/style.css`; each page repeats only head and nav markup. Reason: one place for style changes, still plain HTML with no build step. Foreclosed: inlining the CSS in every page.


# What pages exist and what happens to guide.html?
## Question
Confirm the file set (index.html plus one file per requested concept plus in-practice.html), that the existing "A working day" and "Use cases" sections fold into "in practice", and whether guide.html is deleted or kept as a redirect to index.html.

## Resolution
Operator answer (2026-09-11): `4-A`. Files: `index.html`, `in-practice.html`, and one page per section id: idea, parts, state, install, setup, create, next, phases, files, merge, limits, problems, learn, cheat. The existing "A working day" and "Use cases" sections fold into in-practice. `guide.html` is deleted. Reason: nothing in the repo links to guide.html and section ids keep anchors stable. Foreclosed: keeping guide.html as a redirect.


# One leaf or several?
## Question
One leaf writes the whole site, or a shell leaf (stylesheet, nav, index, one migrated page as the pattern) is a prerequisite for parallel page leaves that each migrate a group of sections?

## Resolution
Operator answer (2026-09-11): `5-A`. A shell leaf (stylesheet, nav, index, one migrated page as the pattern) is the prerequisite for parallel page leaves that each migrate a group of sections. Reason: pages are independently checkable once the shell exists, and only the shell is an actual prerequisite. Foreclosed: one leaf writing the whole site.


Reporter constraints carried: plain HTML, no build step, same design system as the current guide (Spectral body, Bricolage Grotesque headings, Martian Mono labels, Tamdoma logotype, sage and parchment palette, same SVG style).

### Standing creation-locked design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any chunk touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first chunk needing it. Non-browser flows use a real request or invocation. The gate judges the exit code and the completion half records the artifact path as evidence.
- Chunk ownership defaults to agent-owned. Only a step physically requiring the operator makes its chunk operator-owned, which parks at dispatch before any seat spawns. Credential access alone never qualifies.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

## Current interpretation

Carry the creation-locked block above verbatim into each leaf design, together with this interpretation. Its chunk terminology refers to the leaf's owned work. User-visible flows retain an end-to-end command and artifact; verification uses the checker's verdict and blocking `checks` commands. Known human-only prerequisites are named and completed before opening a leaf, with completion recorded at the door. The historical dispatch sentence does not authorize opening a leaf with an unfinished human prerequisite or introduce a hold state. An unforeseen physical blocker ends the attempt and informs the operator. Credential access alone does not create a human-only prerequisite, and `hand_built` remains a separate explicit operator choice.

## Leaf architecture
The nav on every page is a sticky header with the Tamdoma logotype SVG, the Akrogon name, and one link per page in this order: index, idea, parts, state, install, setup, create, next, phases, files, merge, in-practice, limits, problems, learn, cheat. The current page link carries `aria-current="page"`. Links are relative file names such as `state.html`.

Owned: `docs/parts.html`, `docs/state.html`, `docs/phases.html`, `docs/files.html`. Each copies the head, nav and footer from `docs/idea.html` verbatim, sets its title and `aria-current`, and holds the section of the same id copied from guide.html. In-page anchors that pointed at other sections become cross-page links (`#state` becomes `state.html`). Exclusions: no CSS edits, no changes to idea.html or guide.html.
