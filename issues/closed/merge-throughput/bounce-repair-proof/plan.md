# Plan: bounce-repair-proof

Scope: skill-text only (design, standing design). A leaf bounced to `check.fix` by a red merge ending reruns the exact rejected command on its rebased head before re-review. No code or test changes. `debate: no`, so this synthesis derives directly from the brief and locked design.

## Decisions

- D1 (recording at the red ending): `merge-issue/SKILL.md:65` records, per red command, the exact command, its arguments, the rebase target commit and the tested head. The sentence today already requires the failing output, rebase target and tested head; the edit adds the exact command and arguments to that record. Two or more red commands each get their own entry. This leaf edits only the recording sentence: the red-ending order (`--red-on-base`, `--culprit`) belongs to red-main-hold and red-batch-culprit, and red-batch-culprit owns the final order of that paragraph.
- D2 (the replay): a `check.fix` pass entered from a red merge ending replays the bounced run: fetch the remote, rebase the repaired head onto the current `<remote>/<default_branch>`, rerun the exact recorded command with the same arguments and scope in the leaf's own worktree, and record command, arguments, the rejected run's base and head, the rerun's base and head and the result in `implementation/report.md` before `check.review`. A red rerun is repaired and replayed again in the same `check.fix` pass; it is never handed to re-review red. Rebase conflicts resolve keeping both true sides under the merge-issue solo rule, and the resolved head is the rerun's recorded head. The replay happens only in the repair seat, never on the merge turn, and is not the base-run rule (implement-issue:38), which is unchanged.
- D3 (the one exception): each existing "merge_checks only at merge" statement gains one sentence: after a red merge ending, the `check.fix` repair reruns the exact rejected command once the repaired head is rebased onto the current default branch. Everything else stays merge-only. Placed at `plan-issue/SKILL.md:63`, `implement-issue/SKILL.md:63` and `:84`, `check-issue/SKILL.md:85`. Red on base and criterion-named whole runs are unchanged.
- D4 (re-review gate): `check-issue/SKILL.md:63`'s re-check gains: after a merge bounce, missing replay evidence (command, arguments, both rejected and rerun base/head, result) is a Fix. The evidence lives in `implementation/report.md` because the repair seat never writes `review-B.md`.
- D5 (surface sweep): `skills/AREA.md:23` and `docs/guide/phases.md:94` restate the merge-only rule and gain the same one exception; `docs/guide/setup.md:54` ("slow commands that run only at merge") gains the same exception clause so no page contradicts it.

## Read-first list

- `issues/open/merge-throughput/bounce-repair-proof/brief.md` and `design.md` (Q1 1a verbatim; exclusions list)
- `skills/merge-issue/SKILL.md` (:61-65 Shared endings and the red ending; :51-53 solo rebase evidence shape)
- `skills/implement-issue/SKILL.md` (:63 implement-end proof sentence, :72-84 check.fix section, :78 merge-repair input, :38 base-run rule unchanged)
- `skills/check-issue/SKILL.md` (:63 re-check paragraph, :85 repair proof line)
- `skills/plan-issue/SKILL.md` (:63 proof-mapping line)
- `skills/AREA.md` (:23, :26 merge-only restatements) and `docs/guide/phases.md:94`, `docs/guide/setup.md:54` (same rule in operator docs)

## Needed interfaces

None. No command, phase or routing change; the replay is repair-seat behavior over artifacts that already exist (`review-B.md`, `implementation/report.md`).

## Checklist

### Wave 1

- U1 `skills/merge-issue/SKILL.md` (criterion 1)
  - :65 red ending: require the exact command and arguments alongside the existing failing output, rebase target commit and tested head recorded in `review-B.md`, one record per red command. No change to ending order, `--attempt`, split or check.fix call.
  - Shared test resource: none. Lands first: none.
- U2 `skills/implement-issue/SKILL.md` (criteria 2, 3)
  - :78: expand the merge-repair line into the replay rule (D2): read the recorded command from `review-B.md`, rebase onto the current `<remote>/<default_branch>` after the repair commits, rerun it verbatim in the leaf worktree, record both runs' base and head plus result in `report.md`, repair a red rerun in the same pass.
  - :80: the "red merge checks" input sentence names the recorded command as what the rerun replays.
  - :63 and :84: append the D3 exception sentence to each "merge_checks only at merge" clause.
  - Shared test resource: none. Lands first: none.
- U3 `skills/check-issue/SKILL.md`, `skills/plan-issue/SKILL.md` (criteria 3, 4)
  - check-issue :63 re-check: after a merge bounce, missing replay evidence in `report.md` is a Fix (D4).
  - check-issue :85: append the D3 exception sentence, scoped to A's repair pass (B's check.repair still never runs `merge_checks`).
  - plan-issue :63: append the D3 exception sentence so a plan's proof set never contradicts the bounce rerun.
  - Shared test resource: none. Lands first: none.

### Wave 2

- U4 `skills/AREA.md`, `docs/guide/phases.md`, `docs/guide/setup.md` (criterion 3 support: no contradicting restatement)
  - AREA.md:23 and phases.md:94: append the same exception clause.
  - setup.md:54: qualify "run only at merge" with the bounce replay.
  - Shared test resource: none. Lands first: U1-U3 (docs mirror landed wording).

Doc checklist: agent-facing docs edited — the four SKILL.md files and `skills/AREA.md`. Human docs edited — `docs/guide/phases.md`, `docs/guide/setup.md`. `docs/guide/merge.md` and `src/AREA.md` describe only merge-time behavior and stay unchanged; README has no statement of the rule (verified by grep). No `tests/AREA.md` change: no test file is touched.

## Verification

Each done-criterion maps to a proof command, the failure it catches, a size and a rerun trigger. All are read/grep proofs over the diff: seconds each, rerun on any commit touching the same file. No slow runs; no restart boundaries.

- Criterion 1: `git --no-pager diff skills/merge-issue/SKILL.md` shows the red ending requiring the exact command, arguments, rebase target and tested head in `review-B.md`. Catches: a repair left guessing the rejected invocation. Size: seconds. Rerun: any diff in the file.
- Criterion 2: `git --no-pager diff skills/implement-issue/SKILL.md` shows check.fix's merge-repair rule requiring rebase onto current `<remote>/<default_branch>`, verbatim rerun, the five evidence fields in `report.md`, and a red rerun repaired in-pass with no red handoff. Catches: repair proven by leaf tests only — the 42% repeat bounce. Size: seconds. Rerun: any diff in the file.
- Criterion 3: `grep -n "merge_checks" skills/plan-issue/SKILL.md skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/AREA.md docs/guide/phases.md docs/guide/setup.md` shows every merge-only statement carries the single bounce exception and no wording denies it. Catches: a contradicting restatement or a missed site. Size: seconds. Rerun: any diff in the files.
- Criterion 4: `git --no-pager diff skills/check-issue/SKILL.md` shows the re-check treating missing replay evidence after a merge bounce as a Fix. Catches: re-review green-lighting a repair that never reran the rejected command. Size: seconds. Rerun: any diff in the file.
- Criterion 5: all `checks` commands pass in the worktree before handoff: `bun run format`, `bun test --timeout=30000`, `bun run typecheck`, and `test_changed` against `AKROGON_BASE` (no test files change; the run must exit green). Catches: format or typecheck drift, an unexpected red suite. Size: minutes. Rerun: any commit.

`merge_checks` is empty for this repo and the brief names no whole-run criterion, so no merge-tier run is added. B's check.review judges the wording against design Q1 1a; semantic fit is review work, not a grep assertion. No edited path matches the `src/test-files.ts` rule, so no `Test-Change:` trailer is required.

## Exclusions held

No red-ending order or `--red-on-base`/`--culprit` work (red-main-hold, red-batch-culprit); no bounce counting (merge-bounce-rounds); no attempt records (merge-attempt-records); no queue or sizing changes; no rerun on the merge turn; no change to the implement-issue:38 or check-issue:61 base-run rules; no code or test edits.
