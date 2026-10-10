# Shape

## Question
Q1. Unblock now: `akrogon hold-fix page-measure-full-id` plus `akrogon next`, and how the four failed leaves come back without reusing red evidence.
Q2. Mechanism: extend the existing merge hold (held.yaml) into the one main-health record with writers at every phase, readers before base runs, leaves held in place, release that invalidates red evidence (C, B constraints); or a periodic main verify (watch proposal); or per-leaf discovery with a better notice.
Q3. Record key: tree outside record folders plus command, environment facts in the evidence only (C); or plus declared execution inputs (B).
Q4. Silent drift sensor: none beyond seats' own runs (B,C reject post-merge verify; C rejects any reconciliation pass); or periodic main verify at its load cost.

### Carries
- slots/map-merged.md, map-rebuttal-B.md R1-R6, map-rebuttal-C.md R1-R5 and caveats 1-3.
- akrogon hold.ts:10-18,55-110; next.ts:1044-1076; phase.ts:797-877; check-issue SKILL.md:25,61,63; implement-issue SKILL.md:38,43; merge-issue SKILL.md:41-47,73,75.
- Live: held.yaml framework on 5cb74c3c6 since 14:02:42Z, fix unset; audit-errors, page-measure-full-id, selected-check in merge; cheap-checks, fail-fast, dist-capture-disk, spawn-deadlines failed red on base.

## Findings
- Neither red was introduced by a commit after a green gate: C8 came from a root install, motion-probe from hidden-tab timing (C E7). S1 inflow on 10-10 was environment and flakes.
- The base-red fact was produced 6 times and stored 0 times where the next seat looks (C S2). 7 failed moves, union 6 of 7 merge-gate leaves (C E4).
- held.yaml has one writer and one reader, both in mergeTurn (C E2, B E3). Pause blocks observation and repair (B, next.ts:659-667), so pause is not the actuator (A withdrew).
- Release of a hold is not proof of green: a moved tree or unhold must invalidate red evidence and resume leaves through normal checks (B R1). A second incident on another command must be representable (B R3). A later stale writer must not overwrite a newer record or its fix (B R6, C caveat 2).
- Path overlap must not auto-nominate a fix (B R5).
- hold-fix preconditions hold now; it writes fix only and starts no pass, so `akrogon next` follows; the fixHeld branch builds page-measure-full-id alone with no rebase; after it merges the next turn drops the hold (C R4, caveat 1). It does not release the four failed leaves (C caveat 3).
- Declared-input keys are only complete after each new failure; red-on-base is never reusable, so a release always reruns (C R1). A light reconciliation pass senses nothing about main unless it runs the command (B R2, C R2).

## Taken
2026-10-10, operator: "1a | 2a | 3a | 4a" (after the elid restatement).

1. 1a: run `akrogon hold-fix page-measure-full-id` then `akrogon next`; after it merges, move cheap-checks, fail-fast, dist-capture-disk and spawn-deadlines back to their active phase, first renaming their recorded base-red logs so reviewers rerun instead of reusing them.
2. 2a: the existing hold (held.yaml) becomes the one main-health record. Any seat at implement, check.review, check.fix or merge that completes both runs under the base-run rule writes it; every seat reads it before a base rerun; `akrogon phase … failed --reason "… red on base …"` refuses while a matching hold exists and points at it; blocked leaves stay in their phase marked held (status prints `held on <sha>`); release (tree moved outside record folders, or unhold) invalidates red evidence and resumes held leaves through normal dispatch with AKROGON_BASE refreshed and their checks rerun, never treating release as green. Publication re-reads under the lock and never overwrites a newer record or its fix (B R6, C caveat 2). Fix nomination stays deliberate (hold-fix) or a proven repair, never path overlap (B R5). Human pause stays separate (B R4). Foreclosed: 2b post-merge full verify, 2c per-leaf discovery plus notice.
3. 3a: a hold is keyed by tree outside record folders plus failing command, so distinct reds coexist; environment facts are recorded in the evidence only; red is never reusable evidence. Foreclosed: 3b declared-input key.
4. 4a: no scheduled main verify; the first seat that hits a red writes the shared hold. Foreclosed: 4b periodic verify, light reconciliation pass.

### 1a done 2026-10-10
- `akrogon hold-fix page-measure-full-id` and `akrogon next page-measure-full-id` at about 18:35; merged 16:50:04Z (4584cf7cb on origin/main); framework hold cleared.
- Stale base-red logs renamed with suffix `.stale-5cb74c3c6`: cheap-checks B base and leaf selftest logs, fail-fast implementation/ff-{base,leaf}-selftest.log, dist-capture-disk framework-verify.log, spawn-deadlines .temp verify-run.log and base-motion-probe.log.
- `akrogon phase` moves: cheap-checks and fail-fast to check.review, dist-capture-disk to check.fix, spawn-deadlines to implement.
