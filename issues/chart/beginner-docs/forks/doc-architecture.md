# Doc architecture

## Question

Q1. How are the pages organized: (a) a few purpose folders under docs/ — "start" (what the factory is, why it works, install, first finished change), "use" (one task page each: chart, direct, autopilot, run and watch, stop and recover, merge and land), "reference" (commands, config, files, phases, glossary), "examples" (real cases) — each page one purpose, read in order inside "start"; (b) keep today's flat 17-page docs/guide/ book, fix order and prose; (c) full Diátaxis four quadrants (tutorials, how-to, reference, explanation) as folders?

Q2. What does README.md hold: (a) a short front door — what it is, who it is for, what you need, one overview SVG, "start here" link, task links — with no command table, install chapter or rollback detail; (b) README stays a full manual with collapsed sections?

Q3. What counts as finished at the end of the start/ path: (a) one small change reaching checked, merged code; (b) a handed-off contract; (c) a successful install and project setup?

### Carries

- Taken: forks/reader-and-home.md — first reader can open a terminal and has used one agent CLI; full Linux install path; prepared machines skip ahead after a readiness check; concept pages for anyone; "what you need" box at top of README and first-run page; plain repo Markdown, no build; inbound links (README, docs/reference-index.md) updated with any page move.
- Lock: implementation seat A = claude, claude-opus-5-5, effort medium.
- Operator corrections: none.

## Findings

Merged notes: slots/doc-architecture-merged.md (A,B agree on 1a, 2a; Q3 raised by B, A agrees on 3a). Rebuttal: slots/doc-architecture-rebuttal-B.md (two wording corrections, applied). Research: README.md and docs/guide headings (better-than-training, 2026-10-23); Diátaxis start-here and how-to-use (practitioner, Daniele Procida, 2026-10-23); GitHub Docs collapsed sections; Docker get-started as a routing example (better-than-training, 2026-10-23); operator transcripts Oct 13-21 (operator).

## Taken

Operator 2026-10-23, verbatim (after two "elid" rewrites): "1a | 2a | 3 - Don't make this a tutorial that the beginner has to follow. I don't want this to be like an interactive tutorial. Stick to the documentation. so there's no I made it per se. I still want the documentation to be digestible so that the beginner can follow it easily but don't ask them to do something specifically as a task."

- Q1 = 1a: docs/ holds start/ (read in order), use/ (one page per reader goal), reference/ (lookup), examples/ (real cases). Each detail has one authoritative home, linked from the paths that need it. docs/reference-index.md stays at its path as the agents' index and links the human docs home. Before moving, the contract maps each current subject to its owning page. Pages split only on distinct goals; each ends with its next step. Chart consultants and execution seats are named apart. Foreclosed: flat book (1b), Diátaxis folder names (1c).
- Q2 = 2a: README is a short front door — what it is, who it is for, what you need box, overview SVG, one start link, a few daily-job links; no command table, install chapter or rollback detail; no feature counts. Foreclosed: full manual with collapsed sections (2b).
- Q3 = no tutorial (operator free text, shape checked by B: none). start/ is an ordered explanation: what the factory is → why it works → what you need and install → set up a project → how one change flows from idea to merged code, told as a narrated example. No exercises, "now you try" steps, practice project or finish line. Install and setup give exact commands for the reader's own machine. use/ pages are how-to steps for a job the reader already wants. Foreclosed: 3a/3b/3c finish lines, any practice sandbox.
