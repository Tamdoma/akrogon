# Fact ownership

## Question

Q1. How much of each rule do the docs say: (a) docs say in plain words what the reader sees and does and why, and link the owning skill or source section for exact agent rules, never copying them; (b) docs restate every rule in plain words?

Q2. Existing tests read the docs: tests/docs-links.test.ts (links in README, docs/guide/*.md and skill files resolve), tests/command-reference.test.ts (README "## Command" table matches src/akrogon.ts), tests/rollback.test.ts (runs README manual rollback steps), and wording checks (tests/door-reset.test.ts needs "handover" in docs/guide/chart.md; tests/log-reader.test.ts needs "akrogon log" in README; tests/run-permit.test.ts and tests/hold-retired.test.ts ban retired words in docs). What happens to them in the restructure: (a) keep the ones that check function (links resolve, command table matches the code, rollback steps run, retired words banned), point them at the new homes and widen the link check to docs/** and image/SVG references; drop the ones that only demand a word appear on a page; (b) keep all of them and just change their paths; (c) leave tests as they are and keep the old pages for them?

Q3. How do future features keep the docs right: (a) one short "where things go" page in docs (which kind of fact lives in which folder) plus one line in the standing leaf design rules saying a leaf that changes what the operator sees or does updates the owning docs page in the same leaf; (b) only the "where things go" page; (c) nothing new, rely on reviewers?

Q4 (from the A/B difference). Old-word bans: tests/hold-retired.test.ts and tests/run-permit.test.ts fail if docs contain retired words (unhold, hold-fix, run permit...). (a) keep these docs bans — docs describe current state only, so they never need the old words; (b) drop the docs bans and keep only the code-side retirement tests, so docs may say "X was removed".

### Carries

- Taken: forks/reader-and-home.md (terminal user, full Linux install path, repo Markdown, inbound links updated with moves); forks/doc-architecture.md (start/ use/ reference/ examples/, each detail one authoritative home, short README front door, no tutorial).
- Lock: implementation seat A = claude, claude-opus-5-5, effort medium.
- Operator corrections: round 2 Q3 free text (no tutorial; documentation the beginner can follow, no tasks).

## Findings

Merged notes: slots/fact-ownership-merged.md. A,B agree on Q1 (a, with literal commands allowed), Q2 (a, rollback test described accurately: it checks words and runs its own steps, not the doc block), Q3 (b, no new standing-design line: implement-issue Shared context already requires stale-doc updates). Difference on retired-word docs bans became Q4 (A keep, B drop; rebuttal slots/fact-ownership-rebuttal-B.md). Research: tests named in Q2 (inspected 2026-10-23), commit 7efe3d67, standing-design.md, implement-issue SKILL.md Shared context, LESSONS.md stale-docs lines (better-than-training).

## Taken

Operator 2026-10-23, verbatim (after one "elid" rewrite): "1a | 2a | 3a | 4a - please fix those tests. Nothing old that doesn't exist anymore shouldn't survive. |" Read as: nothing about things that no longer exist survives. Option labels are the presented round's; in this file's Question, presented 3a = Question Q3(b). Shape checked by B (slots/fact-ownership-final-check-B.md: label fix only, applied here).

- Q1 = a: docs say in plain words what the reader sees, does and why; exact agent procedure stays in the owning skill and is linked; literal commands and short meaning a task or reference needs are written out. Foreclosed: restating every rule.
- Q2 = a: keep and retarget function tests — tests/docs-links.test.ts covers README, every docs/**/*.md and every image/SVG reference form used; tests/command-reference.test.ts table check moves with the command table and still reads src/akrogon.ts; tests/rollback.test.ts runtime recovery proof kept (it does not execute the doc block; moved steps are checked by review). Delete wording-only checks with their reason: tests/door-reset.test.ts "handover" in docs/guide/chart.md, tests/log-reader.test.ts "akrogon log" in README, tests/command-reference.test.ts substring checks on docs/guide/files.md and next.md. Each retargeted check shows one deliberate break turning red. Foreclosed: keep all with new paths; keep old pages for tests.
- Q3 = presented 3a: one short "where things go" page (folder purposes, one-home rule), linked from docs/reference-index.md and the docs home. No new standing-design line (implement-issue Shared context already requires stale-doc updates). Foreclosed: page plus standing-design line; nothing.
- Q4 = a, plus "fix those tests": keep the docs bans in tests/hold-retired.test.ts and tests/run-permit.test.ts and make both scan README.md and every docs/**/*.md so they keep working after the move; runtime retirement tests untouched. The rewrite removes every mention of commands, settings, files and behaviors that no longer exist (checked against current src and skills, not only banned words). Docs describe current state only; no "was removed" or migration notes. No new prose classifier or new banned-word list.
