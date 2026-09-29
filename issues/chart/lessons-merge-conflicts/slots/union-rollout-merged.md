# union-rollout, merged round (A,B)

Sources: slots/union-rollout-A.md, slots/union-rollout-B.md. B's evidence re-checked by A on 2026-09-29: src/status.ts:123-126 and 293-295, clinique-la-roya 0581a294 (a lesson line rewritten in a leaf commit).

## 1 · How should LESSONS.md stop conflicting?
- 1a (recommended) (A,B) Path-specific `learnings/LESSONS.md merge=union`, written by `akrogon init` idempotently, preserving unrelated `.gitattributes` entries (A,B). Evidence: two independent scratch tests on git 2.55.0 (A,B), git-scm gitattributes docs (A,B), Kosorukov 2026-07-04 first-hand changelog incident (B).
- 1b (A) One file per active lesson, as GitLab did for changelogs (Speicher 2018). Removes the shared file but changes 4 skills, init, docs and every repo's layout.
- 1c (B) Keep normal merging and resolve by hand. Keeps the interruptions.
- Dropped: gacp resolving the conflict itself (A), since sync and merge seat rebases still break.

## 2 · Does init also write the local `.git/info/attributes` rule?
Split. Both agree a tracked rule introduced only in the replayed commit does not apply to that rebase (A: framework report, B: measured exit 1).
- 2a (A) Tracked `.gitattributes` only. After the tracked line reaches origin/main, every later rebase onto it uses the rule. The first-push window is handled in the rollout (question 4). No hidden per-clone line that can mask a later policy change.
- 2b (B) Tracked plus local, via `git rev-parse --git-path info/attributes` so linked worktrees resolve the shared file. Covers the bootstrap window automatically, at the cost of a permanent untracked override.

## 3 · Should `issues/log.jsonl` get the rule?
- 3a (recommended) (A,B) No. One writer only: `logMove` at the main checkout (src/log.ts:17), and leaves cannot carry `issues/` (src/phase.ts:257-263) (A). Readers depend on line order: `findLast` for phase age (src/status.ts:123) and the last ten lines for history (src/status.ts:293), so union could mislead them (B).
- 3b (B) Union with a defined event order and updated readers. Separate work.
- 3c (B) Union now, accepting misleading age and history.

## 4 · How do the 8 repos without the rule get it?
Missing: akrogon, pi-extensions, mdcny-ghl-data-pulls, boulevard-automation, clinique-la-roya, lens, Himne, lingua-relay (A,B). Framework already has tracked and local (A,B).
- 4a (recommended) (A,B) One akrogon code leaf changes init, its tests and the docs that list what init writes (skills/init-akrogon/SKILL.md:76, docs/guide/setup.md:31) (A). A separate operator step on each main checkout commits only `.gitattributes` and pushes it, never via `gacp`'s `git add .` (A,B). Bootstrap: push that commit before any unpushed lesson commit is rebased, or add the local rule for that one rebase (A,B). Verify effective attributes with `git check-attr merge learnings/LESSONS.md` rather than grepping (B).
- 4b (A,B) rejected: rerunning `akrogon init` rewrites `issues/config.yaml` (A) and registers `basename(root)`, so pi-extensions would become a new repo named `extensions` (B).
- 4c (B) A leaf per consumer repo. Several reviews for a one-line change.

## 5 · What about pruning and correcting lessons? (new, B)
Lessons are not append-only: chart-issues offers pruning (skills/chart-issues/SKILL.md:29) and leaves rewrite lines (clinique-la-roya 0581a294) (B). Measured: union keeps both versions of two conflicting edits, and keeps the edited line when the other side deleted it (B).
- 5a (A) Accept it. A resurrected or duplicated line is visible and the next prune removes it. LESSONS.md is not pass input for implement, check or merge (skills/implement-issue/SKILL.md:29, check-issue:39, merge-issue:31), so a stale line only reaches chart and plan as a resource.
- 5b (B) Coordinate prunes and corrections on an up-to-date main while other writers pause, and switch the path to `merge=text` for a divergent maintenance merge.
- 5c (B) Make lessons immutable: corrections become new lines, no pruning.

## Challenge check
- B: the permanent local rule outlives its bootstrap need (B's own challenge to 2b).
- A: 5b is an operator agreement with no enforcement, which costs a pause for a harmless outcome.
- B: the code leaf can finish before rollout, so rollout completion must list every repo still missing the published rule.
