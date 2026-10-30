# Intake: merge-slow-alarm

## Scope

Destination repo akrogon. After each completed merge verify, compare its wall time with the repo's recent normal, flag a large jump and name the leaf whose merge first showed it where the operator and merge seats see it; never fail a merge on duration. One issue, one leaf expected.

## Provenance

- GitHub: Tamdoma/akrogon#123
- Operator: 2026-10-28 chart-akrogon door message (autopilot switch-on)

## Source: Tamdoma/akrogon#123

# Merge verify wall time is recorded per run but never compared with the recent normal, so a 4x jump from one leaf ran ~45 merges before a human noticed

Source: Tamdoma/akrogon#123
URL: https://github.com/Tamdoma/akrogon/issues/123

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

In the framework repo (registered key `framework`), merge-scope `akrogon verify` runs went from a 5.95 min median (41 green merge runs, 2026-10-24 to 2026-10-26, `issues/verify-runs.jsonl`) to 20.5-21.3 min on every run from 2026-10-27T02:28Z, about 45 runs. The first slow run was the `renderer-package-cutover` merge attempt itself (2026-10-27T00:10Z, 15.9 min). Nothing flagged the jump. It surfaced only when a human filed Tamdoma/tamdoma-framework#456 the next morning.

Impact recorded in that report: the merge lane was busy 654 of 657 minutes overnight (19:56Z to 06:53Z), 24 reviewed leaves waited a median 4.3 h to merge, and 8 of 27 attempts were red at a full 21 min each.

Leaf `checks` in that repo run only the cheap stage (14.5 s), so the leaf that added the cost never ran the full verify; the cost landed only on the serial merge lane, paid by every later leaf. The framework repo has had six earlier speed charts (verify-speed, test-cost, suite-reshape, merge-speed, check-speedups, verify-core-waves); each removed cost once and the time rose again with the next costly leaf.

## Location

- `src/verify.ts`: `recordsPath` (`issues/verify-runs.jsonl`) and the receipt append and locked rewrite that set each run's `start` and `end`.
- The readers of that record in `src/verify.ts` (receipt reuse, `--known-red` base runs, `requireGreenReceipt`) use exits and trees, not durations.
- Merge lane: `merge_checks.verify` (`akrogon verify --attempt <id>`).

## Reproduction

Read `issues/verify-runs.jsonl` in the framework repo for scope `merge` from 2026-10-24 to 2026-10-28 and compute `end - start` per run. Every merge verify since 2026-10-27T02:28Z reproduces the plateau.

## Expected behavior

Operator decision, 2026-10-28 (framework chart `issues/chart/verify-time-tradeoffs/forks/tradeoffs.md`, D3): after each merge verify, compare its wall time with the recent normal for that repo and scope, flag a large jump (for example +50%), and name the leaf whose merge first showed it, somewhere the operator and merge slots see (merge output or broadcast). It must not fail merges on a wall-clock cap, since load on a shared host would turn into red merges.

## Urgency

Without it, a leaf can multiply merge time for every later leaf for hours or days before anyone notices; this time the cost was about 15 extra minutes per merge across ~45 merges. Known workaround: a human reads `verify-runs.jsonl` or the queue and files a report, as happened with #456. The framework-side cause is being removed under framework `issues/open/merge-verify-time/`; that fix does not prevent the next one.

## Suspected cause

Supported hypothesis: the run record is a sensor with no reader for time. `src/verify.ts` writes `start` and `end` for every run, and its readers act only on exits, trees and test names (reuse, known-red, green-receipt gate). The existing `main red` herdr notification (`src/AREA.md`, verify section) shows a notice channel exists for base reds, but nothing equivalent exists for duration. Contributing condition: leaf `checks` cover only the cheap stage in this repo, so the merge lane is the first place the full cost appears.

Whose view: both. The reporter asked for the alarm; the agent read the code and the record.

Files read: installed release `~/.akrogon/releases/3e49c3d5ddc7a178a9c5ff448015e525b85fb345/src/verify.ts` (record path, append and rewrite, record readers) and `src/AREA.md` (verify section). This is the installed release, not the Tamdoma/akrogon source checkout; the source at the matching revision is assumed equivalent and was not opened. Framework `issues/verify-runs.jsonl`.

Not inspected: whether a duration summary exists elsewhere in akrogon (status, watch-issues, broadcast); finding one that compares against recent runs would disprove this.

Related reports: Tamdoma/akrogon#75 (closed, plan-time wall-time budget for live sessions, a different stage); Tamdoma/akrogon#121 (closed, transient herdr notice pattern for base reds). Searched Tamdoma/akrogon, states all: "verify duration slowdown" (limit 10, none), "verify-runs wall time" (limit 10), and the filing account's reports since 2026-10-26 (limit 30).

## Source: operator 2026-10-28T12:31Z

Look at the two new pulled issues. Consult with slot b (codex, active in this tab) and chart it on autopilot mode. Nudge the watch-akrogon tab watcher to start the lifecylce.

## Agent findings

- Current main equals the reported release 3e49c3d5 (B, F1); `main..origin/main` is 0 at 2026-10-28T12:35Z.
- `src/verify.ts` `runOnce` sets `start` at receipt append and `end` once every member settled; no reader uses time (A,B). `sendMainRedNotice` is the existing herdr notice channel, reserved `pending` under the receipt lock and resolved after delivery (A,B).
- Framework merge-scope records: first slow run `renderer-package-cutover` 52382dbb, 2026-10-27T00:10:35Z, 15.95 min, red; 45 completed green runs before 2026-10-27 have median 5.86 min; latest runs 20.96-21.41 min (B, F3). Intake counts are a snapshot, not a contract.
- `akrogon land` runs a green merge as a user unit with no seat, so verify stdout alone is not seen by the operator or a merge seat (B, F6).
