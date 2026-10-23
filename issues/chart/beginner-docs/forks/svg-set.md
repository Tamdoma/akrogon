# SVG set

## Question

Q1. Which pictures do the docs get, and which of them move: (a) a small set where motion shows a sequence — the factory overview (idea → chart → contract → seats build and review → merged), the life of one change (plan → build → review ⇄ fix → merge), the chart door (you, consultants, questions, contract) — plus static pictures where order does not matter (the four ways to run work: attended, direct, autopilot, watch; the folder map); (b) every concept page gets an animated picture; (c) one overview picture only?

Q2. How do pictures look right in GitHub light and dark themes: (a) each SVG carries its own solid background card, so one file reads the same on both; (b) each SVG switches colors with prefers-color-scheme inside the file; (c) two files per picture switched with <picture> and GitHub's theme media queries?

Q3. How are they made: (a) hand-written SVG files with CSS keyframe animation, all labels readable when motion is off, a prefers-reduced-motion rule showing the full final state; (b) SMIL animation; (c) a generator script or diagram tool?

Q4. How do we prove they work on GitHub before the leaf builds them all: (a) a charting probe — push one small animated test SVG and a Markdown page to a throwaway branch of Tamdoma/akrogon, view it on github.com in light and dark theme and with reduced motion, then delete the branch (a write to GitHub; needs operator approval); (b) rely on practitioner evidence (animated SVG READMEs in wide use) plus a local headless-browser check in the leaf; (c) check after merge by looking at the README?

### Carries

- Taken: forks/reader-and-home.md, forks/doc-architecture.md, forks/fact-ownership.md (see Taken sections). README front door holds one overview SVG; docs-links test will check every image/SVG reference resolves; autopilot shown as charting and hand-off only, not execution or deploy.
- Lock: implementation seat A = claude, claude-opus-5-5, effort medium.
- Operator words: "We need SVG animations, but only to make them useful for individual users, not just for the sake of having them. These SVGs will also explain the concepts better."

## Findings

Merged notes: slots/svg-set-merged.md (A,B agree on 1a with the "ways to run" picture redrawn as allowed combinations, 2a, 3a with finite emphasis, 4a with operator approval). Rebuttal: slots/svg-set-rebuttal-B.md (applied). Research: MDN SVG-as-image, prefers-color-scheme, prefers-reduced-motion; GitHub changelog theme images; GitHub anonymized URLs (Camo); DenverCoder1 readme-typing-svg and Platane snk (practitioner); gh api repo visibility public, push true for ivanjuras (2026-10-23).

Probe (Q4 = 4a, operator approval 2026-10-23 for one throwaway branch svg-probe-2026-10-23 on Tamdoma/akrogon, never main):
- Command: `git push origin <detached probe commit>:refs/heads/svg-probe-2026-10-23` from a scratch worktree off origin/main, then view on github.com with blepsis (headless Chromium), then `git push origin --delete svg-probe-2026-10-23`.
- Inputs: svg-probe/probe.svg (480x140 card #f6f8fa, three boxes Chart/Build/Merge, `@keyframes pulse` run once with 0/1/2s delays, `@media (prefers-reduced-motion: reduce)` rule) and svg-probe/README.md embedding it as `![Probe](probe.svg)` and `<img src="probe.svg" width="480">`.
- Identity: ivanjuras via gh keyring (no secret value recorded). Date 2026-10-23. Commit 2f93d4097d58251413619ba88d05c82270fb0333.
- Result: both embed forms render and animate (slots/svg-probe/light-early.png shows only Chart highlighted, light-late.png all three). Served as image/svg+xml with CSP `default-src 'none'; style-src 'unsafe-inline'; sandbox`, so inline CSS inside the SVG runs. Card stays readable in GitHub dark mode (dark.png).
- Cleanup: branch deleted, `git ls-remote origin svg-probe-2026-10-23` empty, scratch worktree removed, browser tab stopped.
- Limits: logged-out view only. Dark mode forced via `data-color-mode="dark"`, not a real account setting. Reduced motion unproven: emulation did not reach the image document (reduced.png mid-run, reduced2.png end state). Headless Chromium only, no Firefox/Safari/mobile app. Design answer: every picture is fully readable at rest, so motion is never needed to understand it.

## Taken
- Q1 (operator, widened from 1a): a picture wherever the docs introduce a new concept, including the system overview and each subsystem overview. Motion only where the concept is a sequence or loop, still pictures otherwise, read with the intake "only to make them useful". Every picture is fully readable at rest. The leaf writes the concept-to-picture list into the subject-to-page map before drawing. "Ways to run" shows only allowed combinations. Final-shape check: slots/svg-set-final-check-B.md, no disagreement on Q1.
- Q2 = a: each SVG carries its own solid background card.
- Q4 = a: probe done with the limits in Findings. Still unproven, so carried into the leaf as a done-criterion: each animated SVG opened directly in a browser with reduced motion emulated shows the full still state (slots/svg-set-final-check-B.md).
- Q3 = a (operator 2026-10-23): hand-written SVG files with CSS keyframes inside, labels readable at rest, a prefers-reduced-motion rule showing the final state. Basis: the GitHub probe proved this form.
- Proof for the leaf's reduced-motion check (2026-10-23, blepsis v0.1.0, local only, no account): blepsis navigate refuses file:// URLs, so the SVG is served on loopback (`python3 -m http.server 8765 --bind 127.0.0.1 --directory <dir>`), then `blepsis emulate_media <tab> reduced-motion`, `blepsis navigate <tab> http://127.0.0.1:8765/<file>.svg`, `blepsis screenshot`; then `blepsis emulate_media <tab> none` and the same. Result: reduced shows the full still state (slots/svg-probe/direct-reduced.png), normal shows the animation's start (direct-normal.png). Cleanup: server killed, tab closed. Limits: proves the SVG's own reduced-motion rule in Chromium opened directly, not preference propagation into GitHub's embedded image.
