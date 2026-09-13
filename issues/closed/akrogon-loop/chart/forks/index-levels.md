# Index Levels

Chart skill version: 4

Status: resolved
Type: grilling

## Question

The reference index is one file per repo, up to 25,000 tokens read whole on every pass. Do we split into a top index pointing to area files pointing to code, and are the levels index files the skill walks or nested instruction files the harness loads? Does the merge-time drift audit still make sense split?

Coverage pass 2026-09-08 adds, and it comes first: whether the grounding index and overview docs survive at all as vocabulary pointers or go away (intake 287). The docs duty at the end of every leaf, in the worktree, before a clean verdict, stays (203); who owns it.

From # Multi Chart Layout 2026-09-09: index files per container (EPIC.md, ISSUE.md) are written by the handoff and never read by the command; the reference index this decision is about is a different file, the repo's grounding index.

Retired 2026-09-09 by both slots: "does the index survive at all" (intake 203 keeps it); grounding footers (Handoff Location). The Multi Chart Layout carry holds: EPIC.md and ISSUE.md are work containers, not the code index.

Slot A (Claude, blind) 2026-09-09: two levels, top file of areas, area files of files; plain Markdown from `grounding.index`; plan reads top plus needed areas, implement reads the brief's areas, check reads touched areas; docs duty stays on the check pass as today; no drift script.

Slot B (Codex, blind) 2026-09-09: split only where an area is hard to scan; plain Markdown, not nested AGENTS.md; area files list entry points, not every file; workers start from the brief's read-first list; the implementer owns docs and index updates, the checker verifies; the drift audit becomes ordinary review. Rebuttal: harness loading is a cost, not impossibility; "one line per important file" is not an inventory; the checker follows affected contracts beyond touched folders; slot A's line 439 citation was the config file, not the merge skill; a ported parser breaks the no-prose lock.

Operator answers 2026-09-09: 1-A, asked for the shape and the standard (recorded below). 2-A. 3-A. 4-A. 5 asked "which is really better", explained (writer and separate reviewer), then 5-A. 6-A. Operator challenge: "What happens when the merges start happening? Every worker who updates his own documentation, we can have differences there." Answer recorded below.

Operator explanation, index shape. Two plain Markdown file shapes, judged by readers, never parsed. The top file is the one `grounding.index` points at and holds one line per area: `- [auth](reference/auth.md): login, sessions, tokens`. An area file holds one line per entry point: `- src/auth/session.ts: creates and validates sessions. Contract tests: tests/auth/`. Three rules live in the skills: the top file names areas only; an area file names entry points with one sentence each; an area splits when a reader cannot scan it. A repo with today's flat file gets one leaf that splits it. `akrogon init` proposes the top file when none exists.

Operator explanation, merges. Parallel leaves each update docs in their own worktree. Different areas are different files and merge clean, which is the main gain of the split. Same area, different lines merge clean because each entry is one line. The same line is a real conflict: merge-issue rebases the later leaf, keeps both entries when both are true, and rechecks that the pointers resolve, which is the integration step of 6-A. No new mechanism.

## Taken

The repo's reference index is two levels of plain Markdown: a top file, pointed at by the per-repo `grounding.index` config key, listing areas one line each with a link, and one area file per area listing entry points, purpose, contracts and doc links one line each. An area splits only when it is hard to scan; a small repo keeps a single file. No nested AGENTS.md or CLAUDE.md, so every harness reads the same files through the skills. Reading: plan reads the top file and the areas it needs and builds the brief's read-first list; the worker starts from that list and opens the index only on a gap; check follows the diff and the contracts it affects. Writing: the implementer updates affected docs and area lines in the same worktree before check; the checker verifies them against the diff; merge fixes only drift that integration exposes, keeping both entries on a same-line conflict when both are true. The drift audit script is retired; review does that check in prose, and a real defect goes through the normal fix round.

Why: the cost was whole-index reads on every pass; the split turns those into a top file plus the areas a pass needs, and turns most doc merge conflicts into different-file merges. Writer and separate reviewer is the reason two slots exist, so the implementer writes and the checker checks.

Forecloses: one flat index read whole, harness-loaded nested instruction files, an exhaustive per-file inventory, docs authored by the checker, any script that parses index rows.
