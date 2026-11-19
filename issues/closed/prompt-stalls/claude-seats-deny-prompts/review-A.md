# Review A: claude-seats-deny-prompts

Base: f10a5647fd8223a3355cf01979d9e20256f2d3d9 (AKROGON_BASE, = origin/main)
Reviewed head: 994e2f99

## Diff audited

- src/seat.ts: `settingsSchema` (z.looseObject, keeps unknown keys) + claude-only merge/refuse
  block in `harnessArgv`. Matches plan D1/D2 element-for-element: count detection covers both
  spellings, bare `--` refused, missing value refused with operand `--settings`, unusable value
  names the value element, equals write-back keeps the `=` spelling, append goes before
  `--disallowedTools`. Non-claude argv untouched.
- tests/seat.test.ts: committed criteria (a7e928f5) + prettier rewrap (035a2848, no expectation
  change).
- tests/stand-in.sh: consumes the `--settings` pair; real source is the red hc-start run in
  implementation/report.md — the stand-in logged the JSON as the task.
- docs/reference/config.md: `harnesses` row documents merge + refused shapes (D4).

## Criteria vs evidence

- C1-C3 (merge, equals, append): three pair-form cases + equals + no-settings tests; green runs
  check-seat-tests-1794861594638 and -1601934 on the post-code head; merged values asserted via
  JSON.parse + toEqual (keys and values, not byte form, per standing design).
- C4 (refusals): 10 cases cover missing value, path, malformed JSON, array, scalar, non-object
  and null `permissions`, two flags, mixed spellings, bare `--`. Each asserts the message names
  `claude` and the quoted operand. Verified live: zod v4 `z.looseObject` refuses arrays, scalars,
  null and non-object `permissions` (probed 2026-11-16).
- C5: in-test element comparisons against `filled(line)` (real template parsed through the same
  shell-quote path) plus the two pre-existing template tests; launch order re-proven by hc-start
  after the stand-in fix (check-hc-start-1794861769932).

Checks: `akrogon verify` green receipt 55e160d5 on head 994e2f99 (format/typecheck/test 0). The
one non-causal red ("new tab keeps existing scratch") retried green in isolation and inside the
full suite rerun on the same head — inconsistent per the shared rule, matching report.md.

## Doc check

The `harnesses` row is the doc page describing the changed surface; its new clause is accurate.
No other page documents harness argv construction; nothing stale. No AREA.md changed; the paths
tests/AREA.md and src/AREA.md name exist (spot-checked stand-in.sh, hc-fixture.ts references).

## Findings

None. No Fixes, no Nits, no operator actions. Lessons: none applicable.

## Verdict

ready
