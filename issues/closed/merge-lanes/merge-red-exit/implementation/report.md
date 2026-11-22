# implementation/report.md

Leaf: merge-red-exit. Base: 852ddb91 (origin/main). Head: 28479b75.
Serial-solo run: one seat, four waves, no workers (plan D4).

## What changed and why

- `src/state.ts` — `merge_exit` strict schema (reason red|gate|conflict|dirty; optional top, run, refusal, base, base_verdict); `failure.slot` made optional so merge exits carry no seat.
- `src/routing.ts` — merge phase: `skill: null`, `slots: []`, `next: [merged, check.repair, failed]`.
- `src/phase.ts` — merge leaves refuse `--slot`/`--attempt` and `merged --check` (seat protocol); non-holder `merged`/`check.fix` refused; `check.fix` on a merge leaf refused; `commitMove` records `merge_exit` and clears `batch` on merge→check.repair; check.repair→merge skips the leaf receipt only for the recorded red top at HEAD; `merge_stamp` kept for the first return (≤1 prior merge log entry); `landPush` gained `coverRun` and `pressureDir` params.
- `src/land.ts` — rewritten: claims applied batch, runs `akrogon verify --attempt`, the land gates (all `merged --check` refusals plus `recordTested` stamp), then one push; first non-ff refusal restacks and retries inside the run, second keeps the leaf's queue place; non-refusal push error fails the leaf; red verify takes main-red cover, else the base pass when the previous red merge run sits on the same holder head with named failures overlapping; exits write `merge_exit` and move to check.repair; PSI end snapshots recorded.
- `src/next.ts` — merge turn builds/applies the batch and launches `akrogon-land-<id>` (no seat, no prompt); live land units shield the batch from relaunch and from rebuild; turn-side exits write `merge_exit` {conflict|dirty, base} into check.repair; repair prompts carry `merge-exit=` fields.
- `src/reconcile.ts` — `merge batch` keep reason; dead-owner reason removed.
- `src/status.ts`, `src/stop.ts`, `src/timing-report.ts`, `src/akrogon.ts` — `land`/`landAttempt` surface on the batch shape; `stop --all` selects `batch !== undefined`; seatless merged/check.repair closes count seatless; retired hold errors point at check-issue.
- `tests/` — new `merge-red-exit.test.ts` (18 tests: refusals, exits, keep-place, base-pass verdict, stamp keep); rewrites in the seat-merge suites to land-run fixtures; obsolete seat-protocol tests deleted (each deletion cited in the leaf commit's `Test-Change:` trailers).
- skills + docs — merge-issue rewritten as the command-owned turn and land run reference; check-issue `check.repair` gained the merge-exit endings incl. the retired-lesson one-liner; lifecycle-rules, implement-issue, watch-issues, seed-issue, AREA files, commands.md, run-work.md, state-and-phases.md, checks.md, skills.md, merge-and-announce.md and phases.svg updated to the seatless merge.

## Commands run

- `bun test tests/merge-red-exit.test.ts` — 18/18 pass on head 28479b75 (was 18 red before the product code landed).
- `bun test` on every touched suite (next, phase, batch-merge, batch-dispatch, green-merge, merge-attempts, pause-next, reconcile, receipt-gates, hold-retired, release-any-phase, status-json, timing, flaky-merge, leaf-stop, lessons, docs-links) — all green solo.
- `bun typecheck` — clean.
- `akrogon verify` on committed head `28479b75` — green (run `test: 0`, receipt written). Log: `implementation/check-test-1795302102322-1440497.log`.

## Proof results

- D1–D14 plan decisions: implemented as planned; the full verify run (1288 tests, 0 fail on the committed head) covers them.
- The full-suite run under parallel load shows occasional 5 s timeouts in hc/timer tests unrelated to this leaf; each was confirmed green solo and one (`silent stops…`, `a working seat…`) was confirmed failing identically on base `852ddb91` — pre-existing flake, not a regression.

## Known limitations

- `skills/merge-issue/lifecycle-rules.md` symlink kept: `docs-links.test.ts` asserts it stays a symlink.
- Two earlier verify runs went red on flakes that pass solo; the receipt on the head is the third run, green.

## check.fix round 1 (slot A)

Reviewed head `28479b75`; repair base `88d40095`; repair head `b9c59076`.

Refresh: prior base/head `852ddb91`/`28479b75` → handed-off base/head `88d40095`/`fb956cf2` (B's repairs), then A's commit `b9c59076`. `AKROGON_BASE` refreshed to `88d40095`; rebase clean, no conflicts.

### Repairs (Handed to A items)

- B F2 (same-tree regression): restored in `tests/green-merge.test.ts` as 'an older covered run does not hide a new failure on the same tree' — the same scenario at the land boundary with the seat assertions replaced by the repair-exit, run-id and unchanged-remote checks.
- B F6 (criterion 2 sibling): 'a dirty holder worktree exits to check.repair keeping the edit' now queues leaf `bb` and asserts its land unit launches in the same pass.
- B F6 (criterion 4 capacity): new 'a dead B seat restarts only when capacity has room' — a live `plan.synthesis` filler leaf holds the whole `max_active: 1` cap, no `check-issue` prompt is delivered, `bb`'s land unit still launches, then `max_active: 5` restarts B.

### Per-criterion deliberate-break evidence

Each new/changed case was shown red once on head by one deliberate break, reverted after the run:

| Case | Deliberate break | Result |
|---|---|---|
| green-merge 'older covered…same tree' | `land.ts`: treat any non-undefined uncovered set as covered (`uncovered !== undefined` → coverRun) | red: the leaf took a gate exit instead of `check.repair` — under the break every unit reads covered so no receipt lands on the candidate and `recordTested` refuses |
| merge-red-exit 'dirty holder…sibling' | `next.ts` `mergePass`: `return` after the first `mergeTurn` | red: `bb`'s land launch missing |
| merge-red-exit 'dead B…capacity has room' | `next.ts` `allocate`: capacity guard disabled | red: `check-issue aa` prompt delivered at `max_active 1` |

### Criterion-4 base/head runs

- Base `852ddb91` (scratch worktree `/tmp/akrogon-base-mre`, removed after): `bun test tests/merge-red-exit.test.ts -t "second non-fast-forward|dead B seat|capacity"` → 3/3 red on the seat path (`phase` stays `merge` — the seat hand-off exists there), as the plan's D1/D2 proof requires.
- Base `852ddb91`: `bun test tests/green-merge.test.ts -t "preserves a live command attempt"` → pass (the live-unit preserve already held at base; the new-file failures above are the criterion's actual fail-before).
- Head `b9c59076`: `check fix-proof: 0 implementation/check-fix-proof-1795303581795-3597400.log` — 35/35 green across both touched files.

### Criterion-4 wake-replacement proof (same craft, both revisions)

One probe test, one state craft on each revision: `claimed` batch, live `akrogon-land-<attempt>` unit, then `batch` rewritten to the post-push-refusal record a seat-owned merge carried on the old path (`owner: 'seat'`, `candidate: <top>`, `applied: false`, tested/decision cleared), then one `akrogon next --wake`.

- Base `852ddb91`, scratch worktree `tests/probe.test.ts`: wake minted a new attempt `9d29faec…` → `49e8246e…` and launched a second land unit (`landLaunches` length 2). The seat-owned unapplied attempt is replaced mid-flight — the D1 race the command path closes.
- Head `b9c59076`, scratch worktree `tests/probe.test.ts`: same craft, wake leaves `attempt c10e4b5e…` intact and `landLaunches` stays 1. The live land unit shields the batch regardless of the recorded owner.
- Scratch probe file kept out of the suite; removed after capture.

### Remaining planned deliberate breaks (head `b9c59076`)

| Case | Deliberate break | Result |
|---|---|---|
| criterion 5, 'skips the leaf receipt…' | `phase.ts`: require the leaf receipt unconditionally (`if (true)`) | red: the `phase exit merge` move is refused (code 1) on its first assertion |
| criterion 6, 'keeps its stamp…' | `phase.ts`: keep condition `<= 1` → `<= 0` | red: the first return mints a new stamp |
| criterion 7, 'keeps its slice…' | `reconcile.ts`: delete the `merge batch` keep line | red: the slice is stopped with both seats gone |

All three reverted after capture; `git status` clean.

### Proof

- `akrogon verify` on `b9c59076` green: 1309 tests, 0 fail (`implementation/check-test-1795303733193-3637995.log`).
- `bun prettier --check` on touched files clean.
