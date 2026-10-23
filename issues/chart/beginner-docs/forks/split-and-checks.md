# split-and-checks

## Question

Q1. How is the work split into leaves: (a) one issue with parallel leaves on fixed paths — the door writes the subject-to-page map (every page, its one subject, its source facts, which picture) into the issue design at handoff, then leaves run side by side: L-start (README front door, docs home, start/ incl. the narrated change), L-use (use/ task pages), L-reference (reference/ incl. command table and "where things go"), L-examples (examples/ cases), L-pictures (all SVGs); exactly one leaf owns README and the docs home, others only add their own pages; (b) one leaf does everything; (c) a chain: map leaf first, then the rest blocked-by it?

Q2. When do tests move with the files: (a) each leaf that moves or deletes a page retargets the tests that read it in the same leaf, so main stays green after every merge, with one deliberate break per retargeted check; old docs/guide/ is removed only by the last leaf that empties it; (b) one final leaf fixes all tests after the moves; (c) tests first, in a prerequisite leaf?

Q3. How are the pictures and scrubbing checked: (a) done-criteria with existing tools only — docs-links resolves every image ref; each animated SVG opened directly in a browser (blepsis) with reduced motion emulated shows the still final state, screenshots in the leaf report; a written scrub list reviewed by B for every example page; no new test files for pictures or privacy; (b) add an automated SVG/privacy test; (c) review only?

### Carries

- Taken: reader-and-home, doc-architecture, fact-ownership (tests: docs-links widened to README + all docs/**/*.md + image refs; command-reference moves with the table; rollback runtime proof kept; wording-only checks deleted; docs bans in hold-retired/run-permit scan all docs), svg-set, examples.
- Lock: implementation seat A = claude, claude-opus-5-5, effort medium.
- Operator words: "docs architecture that is easy to update".

## Findings

Merged notes: slots/split-and-checks-merged.md. B notes: slots/split-and-checks-B.md. Rebuttal applied. README + docs/guide = 19,156 words (B, wc -w, 2026-10-23). Test consumers: command-reference reads README/files.md/next.md, rollback reads README, door-reset reads chart.md, run-permit names setup.md/files.md, docs-links lists docs/guide only (B E4; A tests/docs-links.test.ts:77).

## Taken
- Operator 2026-10-23, verbatim: "1a | 2a | 3a | 4a | Don't forget to use Opus 5.5 in Claude Code Harness to rewrite this. The entire epic or all issues have to be using that odel for slot A."
- Q1 = a: one issue, five leaves: reference, pictures, use (how-to), examples, start (README, docs home, start/, reference-index link, old docs/guide deletion; lands last). The door writes the page map and picture list before handoff (path, subject, source/skill, picture, incoming links, owner leaf, old-page fate, affected tests). Order from real links in the map; reference and pictures run in parallel only if reference uses no new picture. Oversized leaves split by subject bundle at the door.
- Q2 = a: each leaf retargets the tests for pages it moves, one owner per test file (ownership in slots/split-and-checks-merged.md), main green after each merge, one deliberate break per retargeted check in a nested page. Existing source/skill/AREA scans and runtime retirement tests untouched.
- Q3 = a: existing tools only. Animated SVGs opened directly with reduced motion (screenshot at load and later), plus page width, narrow width, light and dark. B reviews picture meaning and every story page against the scrub list, links, alt text and images. Leaf re-checks case landing and the varhop failed/merged conflict.
- Q4 = a: old docs/guide stays on main until the start leaf deletes it.
- Seat lock restated: slot A for every leaf = harness claude, model claude-opus-5-5 (owner ISSUE.md slots front matter; effort medium as set at open).
