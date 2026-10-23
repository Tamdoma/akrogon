# Design: docs-start

## Binding decisions, verbatim

All six forks bind the content this leaf writes; this leaf delivers only the outputs it owns under Leaf architecture, and outputs owned by other leaves are their responsibility. Two copied lines are already done by the door and are excluded from every leaf: svg-set Q1 “The leaf writes the concept-to-picture list into the subject-to-page map before drawing” (the door wrote it in the page map), and examples Q3 “Provenance (repo, commit, record path) stays in chart and leaf notes only”, superseded by the privacy line under examples (provenance lives only in the gitignored provenance file). Seat lock: slot A = claude, claude-opus-5-5, effort medium (ISSUE.md front matter).

### Reader and home (issues/chart/beginner-docs/forks/reader-and-home.md)

Operator 2026-10-23, verbatim: "1a | 2a |" (after an "elid" rewrite of the round).

- Q1 = 1a: first reader can open a terminal and has used one agent CLI; full clean-machine install path on a Linux desktop with systemd running; prepared machines skip ahead after a readiness check; concept pages written for anyone. Binding: a "what you need" box at the top of README and the first-run page; placeholders only, never real keys; no OS install, macOS or WSL workarounds. Foreclosed: prepared-machine-only (1b), non-terminal users (1c).
- Q2 = 2a: plain Markdown in the repo (README + docs/), no build, rendered by GitHub. Binding: every inbound link (README, docs/reference-index.md) updated in the same change as a page move. Foreclosed: GitHub Pages site (2b, can be added later), wiki (2c).

### Doc architecture (issues/chart/beginner-docs/forks/doc-architecture.md)

Operator 2026-10-23, verbatim (after two "elid" rewrites): "1a | 2a | 3 - Don't make this a tutorial that the beginner has to follow. I don't want this to be like an interactive tutorial. Stick to the documentation. so there's no I made it per se. I still want the documentation to be digestible so that the beginner can follow it easily but don't ask them to do something specifically as a task."

- Q1 = 1a: docs/ holds start/ (read in order), use/ (one page per reader goal), reference/ (lookup), examples/ (real cases). Each detail has one authoritative home, linked from the paths that need it. docs/reference-index.md stays at its path as the agents' index and links the human docs home. Before moving, the contract maps each current subject to its owning page. Pages split only on distinct goals; each ends with its next step. Chart consultants and execution seats are named apart. Foreclosed: flat book (1b), Diátaxis folder names (1c).
- Q2 = 2a: README is a short front door — what it is, who it is for, what you need box, overview SVG, one start link, a few daily-job links; no command table, install chapter or rollback detail; no feature counts. Foreclosed: full manual with collapsed sections (2b).
- Q3 = no tutorial (operator free text, shape checked by B: none). start/ is an ordered explanation: what the factory is → why it works → what you need and install → set up a project → how one change flows from idea to merged code, told as a narrated example. No exercises, "now you try" steps, practice project or finish line. Install and setup give exact commands for the reader's own machine. use/ pages are how-to steps for a job the reader already wants. Foreclosed: 3a/3b/3c finish lines, any practice sandbox.

### Fact ownership (issues/chart/beginner-docs/forks/fact-ownership.md)

Operator 2026-10-23, verbatim (after one "elid" rewrite): "1a | 2a | 3a | 4a - please fix those tests. Nothing old that doesn't exist anymore shouldn't survive. |" Read as: nothing about things that no longer exist survives. Option labels are the presented round's; in this file's Question, presented 3a = Question Q3(b). Shape checked by B (slots/fact-ownership-final-check-B.md: label fix only, applied here).

- Q1 = a: docs say in plain words what the reader sees, does and why; exact agent procedure stays in the owning skill and is linked; literal commands and short meaning a task or reference needs are written out. Foreclosed: restating every rule.
- Q2 = a: keep and retarget function tests — tests/docs-links.test.ts covers README, every docs/**/*.md and every image/SVG reference form used; tests/command-reference.test.ts table check moves with the command table and still reads src/akrogon.ts; tests/rollback.test.ts runtime recovery proof kept (it does not execute the doc block; moved steps are checked by review). Delete wording-only checks with their reason: tests/door-reset.test.ts "handover" in docs/guide/chart.md, tests/log-reader.test.ts "akrogon log" in README, tests/command-reference.test.ts substring checks on docs/guide/files.md and next.md. Each retargeted check shows one deliberate break turning red. Foreclosed: keep all with new paths; keep old pages for tests.
- Q3 = presented 3a: one short "where things go" page (folder purposes, one-home rule), linked from docs/reference-index.md and the docs home. No new standing-design line (implement-issue Shared context already requires stale-doc updates). Foreclosed: page plus standing-design line; nothing.
- Q4 = a, plus "fix those tests": keep the docs bans in tests/hold-retired.test.ts and tests/run-permit.test.ts and make both scan README.md and every docs/**/*.md so they keep working after the move; runtime retirement tests untouched. The rewrite removes every mention of commands, settings, files and behaviors that no longer exist (checked against current src and skills, not only banned words). Docs describe current state only; no "was removed" or migration notes. No new prose classifier or new banned-word list.

### SVG set (issues/chart/beginner-docs/forks/svg-set.md)

- Q1 (operator, widened from 1a): a picture wherever the docs introduce a new concept, including the system overview and each subsystem overview. Motion only where the concept is a sequence or loop, still pictures otherwise, read with the intake "only to make them useful". Every picture is fully readable at rest. The leaf writes the concept-to-picture list into the subject-to-page map before drawing. "Ways to run" shows only allowed combinations. Final-shape check: slots/svg-set-final-check-B.md, no disagreement on Q1.
- Q2 = a: each SVG carries its own solid background card.
- Q4 = a: probe done with the limits in Findings. Still unproven, so carried into the leaf as a done-criterion: each animated SVG opened directly in a browser with reduced motion emulated shows the full still state (slots/svg-set-final-check-B.md).
- Q3 = a (operator 2026-10-23): hand-written SVG files with CSS keyframes inside, labels readable at rest, a prefers-reduced-motion rule showing the final state. Basis: the GitHub probe proved this form.
- Proof for the leaf's reduced-motion check (2026-10-23, blepsis v0.1.0, local only, no account): blepsis navigate refuses file:// URLs, so the SVG is served on loopback (`python3 -m http.server 8765 --bind 127.0.0.1 --directory <dir>`), then `blepsis emulate_media <tab> reduced-motion`, `blepsis navigate <tab> http://127.0.0.1:8765/<file>.svg`, `blepsis screenshot`; then `blepsis emulate_media <tab> none` and the same. Result: reduced shows the full still state (slots/svg-probe/direct-reduced.png), normal shows the animation's start (direct-normal.png). Cleanup: server killed, tab closed. Limits: proves the SVG's own reduced-motion rule in Chromium opened directly, not preference propagation into GitHub's embedded image.

### examples (issues/chart/beginner-docs/forks/examples.md)

- Operator 2026-10-23, verbatim: "1 - make it something more realistic based on some of the real projects, not akrogon iteself | 2 - make them from projects outside of akrogon | 3 - don't mention dates | 4a". Final-shape check: slots/examples-final-check-B.md (applied).
- Q1: the start/ narrated change is based on a real change in a real project outside akrogon (candidates: P1 autopilot batch, a P2 leaf, varhop overlay-rework). Private projects are described by what they are ("a company website", "a translation web app"), never by name. Steps use today's commands and files. Recorded output is quoted only where it matches today's tool, otherwise plain prose.
- Q2: examples/ cases come only from projects outside akrogon, each showing a different way of working. Verified on main 2026-10-23: direct route = P1 direct fix ((sha in provenance), private, unnamed); autopilot charting into lifecycle = P1 autopilot batch (private, unnamed); failed leaf carried forward = varhop overlay-rework (public, may be named and linked). Watch gets a case only with a record proving the watcher's effect; otherwise a how-to only. The leaf re-checks landing on main and the failed-then-merged record conflict in varhop before telling it.
- Q3: no dates on any page. Cases describe what happened using today's commands and link current reference pages. Provenance (repo, commit, record path) stays in chart and leaf notes only.
- Q4 = a: remove home paths, other people's names, client names, private repo names, session ids and secrets. Keep public names and links (varhop). One review per page of text, links and images.
- Privacy of this chart (2026-10-23): issues/chart is pushed to public main, so private project names, paths and SHAs were moved to scratch/provenance.md (gitignored, registered root) and replaced by P1/P2 in chart files (slots/page-map-B.md F1). Start story chosen: P2 two-step sign-in leaf (merged, landing checked by B).

### split-and-checks (issues/chart/beginner-docs/forks/split-and-checks.md)

- Operator 2026-10-23, verbatim: "1a | 2a | 3a | 4a | Don't forget to use Opus 5.5 in Claude Code Harness to rewrite this. The entire epic or all issues have to be using that odel for slot A."
- Q1 = a: one issue, five leaves: reference, pictures, use (how-to), examples, start (README, docs home, start/, reference-index link, old docs/guide deletion; lands last). The door writes the page map and picture list before handoff (path, subject, source/skill, picture, incoming links, owner leaf, old-page fate, affected tests). Order from real links in the map; reference and pictures run in parallel only if reference uses no new picture. Oversized leaves split by subject bundle at the door.
- Q2 = a: each leaf retargets the tests for pages it moves, one owner per test file (ownership in slots/split-and-checks-merged.md), main green after each merge, one deliberate break per retargeted check in a nested page. Existing source/skill/AREA scans and runtime retirement tests untouched.
- Q3 = a: existing tools only. Animated SVGs opened directly with reduced motion (screenshot at load and later), plus page width, narrow width, light and dark. B reviews picture meaning and every story page against the scrub list, links, alt text and images. Leaf re-checks case landing and the varhop failed/merged conflict.
- Q4 = a: old docs/guide stays on main until the start leaf deletes it.
- Seat lock restated: slot A for every leaf = harness claude, model claude-opus-5-5 (owner ISSUE.md slots front matter; effort medium as set at open).

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation for this leaf: no product code changes, so auth, backend and secret lines do not apply. Done-criteria are proven by the repo's existing `checks` (`bun test`, typecheck, prettier) plus the manual checks named in the brief, with screenshots or notes in the implementation report. A retargeted test shows one deliberate break turning red; a deleted wording-only check is deleted with its reason; no test keeps a hand-copied list of another file's entries. No machinery is built; blepsis and a loopback http server are existing tools.

## Leaf architecture

Full page map: `issues/chart/beginner-docs/PAGE-MAP.md` under the registered root printed by `akrogon config` (read it for other leaves' pages; this design copies the rows this leaf owns). Every fact is checked against current `src/` and `skills/` before writing; where an old docs/guide page disagrees, the code wins and the old claim is not carried. Pages say what the reader sees, does and why, and link the owning skill for agent procedure. Plain, short sentences for a beginner. No dates, no "was removed" notes, no names of retired commands or settings.

Link rule: a page links only to pages and pictures owned by this leaf or by a leaf in this leaf's `blocked-by`, plus skills and source files. New pages never link docs/guide; the old pages are authoring sources only until docs-start deletes them. No placeholders or links to pages not yet delivered.

The page map is a door-owned input: this leaf reads it and never edits it or anything under issues/. If the map is wrong, the leaf stops and reports it; the door fixes the map on main. The normal lifecycle checks (format, test, typecheck) run as usual on this leaf.

Excluded: every path under `issues/` (leaf branches carry code only); pages and pictures owned by other leaves (owners in the full map); runtime behavior of any command; new tests beyond the test rows named here; new tools, dependencies or a docs site generator.

Owned pages:

## Front door, home and start/ (leaf: docs-start, lands last)

| Path | Subject | Sources | Picture |
|---|---|---|---|
| README.md | What Akrogon is in one screen, a "what you need" box, a link to the docs home. No command table, install steps, rollback or counts. | README.md "How the pieces fit" | factory-overview |
| docs/README.md | Docs home: start/ in reading order, then use/, reference/, examples/. | README.md "Guide" | none |
| docs/reference-index.md | Stays the code grounding index. Its human-docs link points to docs/README.md. | itself | none |
| docs/start/what-it-is.md | The software factory: a request becomes a written contract, a seat builds it, it gets independent review and repair if needed, and the command lands it. Key words are introduced here. | guide/idea.md, guide/parts.md "The words" | factory-overview |
| docs/start/why-it-works.md | Why progress is kept in files the program reads (it survives a closed conversation), why build and review are separate seats with different jobs, and why a contract comes before code. | guide/idea.md, guide/state.md "Why the record survives…" | two-seats |
| docs/start/install.md | What you need (Linux with a running systemd user manager, Bun, Git, Herdr, one agent CLI, gh for GitHub work), the install, the first global config, and a readiness check that lets a prepared machine skip ahead. | guide/install.md, README.md "Install", guide/parts.md "Skills, commands and Herdr" | machine-parts |
| docs/start/set-up-a-project.md | Register a project with init-akrogon, the repo config fields a beginner touches, and grounding (how agents find the right code). | guide/setup.md, README.md "Initialize a repository", guide/parts.md "Folders…" | project-folders, grounding |
| docs/start/one-change.md | Narrated, not a task: one real change, optional two-step sign-in in a translation web app, from a note to merged, told with today's commands. | provenance.md, guide/phases.md, guide/merge.md | change-flow |
| docs/reference/words.md | Glossary, one line per term, each linking to where it is explained. | guide/parts.md "The words" | none |
| docs/reference/where-things-go.md | For maintainers: which page owns which fact, the link rule above, and that a code change updates its page. | this map | none |

## Old pages

All 17 `docs/guide/*.md` pages stay until docs-start deletes them in its final step, after listing every remaining reference to `docs/guide` in the repo and clearing it. Every old section's facts land in the row that names it as a source. guide/cheat.md and guide/gacp.md "Beginner walkthrough" get no page of their own.

Owned test: tests/log-reader.test.ts README wording check only. Start story provenance: `issues/chart/beginner-docs/scratch/provenance.md` under the registered root printed by `akrogon config` (gitignored, so absent from the worktree; never copy its identifying contents into the repo, the report or any public file) (gitignored, read from the registered root).
