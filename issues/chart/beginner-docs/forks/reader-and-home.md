# Reader and home

## Question

Q1. Who is the first reader the docs promise to carry to a finished change: (a) someone who can open a terminal and has used one coding agent CLI, with a clean-machine install path; (b) someone handed an already prepared machine; (c) a true non-developer?

Q2. Where do the docs live on GitHub: (a) Markdown in the repo (README + docs/), rendered by GitHub, no build; (b) a GitHub Pages site (VitePress/MkDocs) built from docs/; (c) the GitHub wiki?

### Carries

- Intake: "very noob friendly", "not built for hardcore developers only. It's built for all people who want to build something", "A better readme file and the entire documentation on GitHub."
- Lock: implementation seat A for every leaf = claude, claude-opus-5-5, effort medium.
- Related: none yet; this fork reshapes architecture, examples and split.

## Findings

Merged notes: slots/reader-and-home-merged.md (A,B agree on 1a and 2a). Rebuttal: slots/reader-and-home-rebuttal-B.md (two wording corrections, applied). Research: install.md Prerequisites, src/install.ts, src/config.ts readGlobal, src/scope.ts (better-than-training, 2026-10-23); GitHub Docs Pages and wiki pages (better-than-training, 2026-10-23); Diátaxis diataxis.fr (practitioner, Daniele Procida, 2026-10-23).

## Taken

Operator 2026-10-23, verbatim: "1a | 2a |" (after an "elid" rewrite of the round).

- Q1 = 1a: first reader can open a terminal and has used one agent CLI; full clean-machine install path on a Linux desktop with systemd running; prepared machines skip ahead after a readiness check; concept pages written for anyone. Binding: a "what you need" box at the top of README and the first-run page; placeholders only, never real keys; no OS install, macOS or WSL workarounds. Foreclosed: prepared-machine-only (1b), non-terminal users (1c).
- Q2 = 2a: plain Markdown in the repo (README + docs/), no build, rendered by GitHub. Binding: every inbound link (README, docs/reference-index.md) updated in the same change as a page move. Foreclosed: GitHub Pages site (2b, can be added later), wiki (2c).
