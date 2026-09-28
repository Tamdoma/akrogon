# Merged map and round 1: Tamdoma/akrogon#38

## Findings
- M1 (A,B) `pull --all` inside a registered repo or its worktree pulls only that repo: `src/pull.ts:81-87` takes `currentRepo` (`src/config.ts:106`) and returns early. Live: from akrogon root 1 repo, from `/tmp` all 7 (A); from akrogon root exit 0 with one line (B).
- M2 (A) The herdr startup hook hits this every time: herdr runs plugin commands with the plugin directory as cwd (https://herdr.dev/docs/plugins/, read 2026-09-28), and `plugin/` is inside the akrogon repo. `cd plugin && akrogon pull --all` pulled akrogon only. B had not established startup cwd (B F5); this closes that gap.
- M3 (A,B) The whole-registry behavior was the recorded contract: `pull-close/plan.md:18` D1 (A), `pull-close/design.md:11` and `brief.md:7` (B). The narrowing arrived in hand commit 373538a (A). Existing tests call `--all` only from outside a repo (`tests/pull.test.ts:201-235`).
- M4 (A,B) The door pulls and imports only its own repo at open and has no destination-intake checkpoint (`SKILL.md` Open, `shapes.md:62,166`), while handoff can target any registered repo.
- M5 (A,B) Cross-repo closure already works: completion closes each `sources` identity with `gh issue close -R` (`src/pull.ts:123`, `src/phase.ts:149-167`). The pi-extensions leaves carried #32 and #35 only (B read their state.yaml).
- M6 (B) pi-extensions#5 is already closed with `delivered by same-repo-worktree-cwd 3b478e9`. No cleanup left.
- M7 (B) One report has one completion owner (`shapes.md:162`); a destination identity already owned elsewhere cannot be silently reassigned.

## Settled by intake, no question
- L1 (A,B) `akrogon pull --all` pulls every registered repo from any cwd; plain `akrogon pull` stays current-repo. Intake Expected behavior states it and the recorded contract agrees. A had framed this as a question with the option to cd out in `plugin/pull.sh`; A withdraws that option because it keeps `--all` cwd-dependent.

## Split (A,B)
One issue `cross-repo-intake` in akrogon, owner of Tamdoma/akrogon#38, two parallel leaves, no blocked-by:
1. `pull-all-repos`: `src/pull.ts`, `tests/pull.test.ts` (inside root and inside worktree cases), README pull line.
2. `chart-destination-intake`: `skills/chart-issues/SKILL.md`, `assets/shapes.md`, guide text explaining it. Uses plain `akrogon pull` run in the destination root, so it does not depend on leaf 1.

## Round 1: fork destination-intake
- Q1 scope. A (A,B, rec): source repo plus each selected destination. B: every registered repo.
- Q2 timing. A (B, rec; A adopts): when the destination is chosen and again before the handoff review, one check if both fall together. B (A's first draft): once at handoff review. C: only when the destination is chosen.
- Q3 match handling. A (A,B, rec): a fully covered, unowned destination report is copied verbatim into intake and put in every leaf's `sources` under the completion owner, closing on delivery. B: close it as duplicate during charting.
