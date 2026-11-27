# review-A — direct-leaf, initial check.review

Base: 4325f9ce. Reviewed head: 1d546a7d. Diff: 52 files, +3366/−408. Blind review: no contact with
B, no reading of review-B.md.

## Verification evidence read

- `implementation/report.md`: all nine criterion proofs exit 0 on the final head with fresh
  `check-direct-*` logs in `implementation/`; the logs exist (31 files) and spot-reads match the
  claimed pass counts (direct-create 12 passes / 0 fails, direct-land 0 fails).
- `akrogon verify` green receipt on head: `verify leaf ecd49c02...: green` recorded in the report
  with `check-test-1795632680325-204888.log` present; format/typecheck/test all exit 0. The two
  citation-only trailer commits after it change no code.
- The three deliberate breaks are recorded with the reverting edits; I re-read the reverted lines
  in the diff and they match the claim.
- The hc-boot bug fix (`probeTerminal`) carries fail-before/pass-after evidence in the report, and
  I re-ran the reproduction logic mentally against the committed tests: the integration test in
  direct-seats exercises the real pass at the CLI boundary with real cores.

## What I reviewed

- `src/direct.ts` whole: create/rerun/drop flows against D3-D5 — refusal ordering before any write,
  worktree/branch/state rollback trio, `slugLeafFolders` depth-2 semantics matching the owner's
  direct-child shape, rerun byte-shape.
- `src/next.ts`: `observeDirectSeats`, `dispatchLeaf` skip ordering, `activeCount` fallback
  exclusion, `broadcastDirect` settle semantics against dispatchSlot's.
- `src/phase.ts`/`src/routing.ts`: slot threading, repair-to-merge D7 guard (verified the lifecycle
  branch is textually unchanged), `commandMerged` D8 gate.
- `src/status.ts`/`src/timing-report.ts`: `leafStart` consumers, closed broadcast-pending JSON
  inclusion with text-table filtering, `visitGaps` suppression by kind.
- `src/reconcile.ts`: `broadcastInProgress` session-scoped probe, temp-sweep keep for unfinished
  direct leaves, `sliceKeepReason` structural reasoning (tab absent means the unfinished-direct
  keep fires).
- `src/stop.ts`: `stopLeafWork` factoring, D18 `stop --all` selection.
- Test files direct-seats busy recording and direct-land broadcast settle in full: they drive real
  hc cores and the real CLI, no mocking of the units under test.
- Skills and docs rewrite for the direct route (chart-issues SKILL.md, shapes.md, implement/check
  skills) against the design's flow.

## AREA.md path listing

One command listing the paths the four AREA.md files name: every path this diff introduces into
`tests/AREA.md` exists (direct-active/create/drop/seats, receipt-gates, verify). `src/AREA.md`'s
direct/hc additions resolve. Two pre-existing dead pointers in `tests/AREA.md` exist identically on
main (`tests/budget.test.ts`, the `tests/hc-*.test.ts` glob form) — not this diff, recorded below.

## Docs judgment

No documented behavior beyond this leaf's own changed: the route rewrite in chart-issues,
implement-issue, check-issue, broadcast-issue, plan-issue, watch-issues and the prose docs matches
the implemented verbs and flow. The deleted direct-route asset and guards script match their
deleted mechanisms (the removed run-units assertions pinned exactly those deleted strings).

## Findings

### Fixes

None.

### Nits

- N1: `observeDirectSeats` leaves a required slot's `busy_since` in place forever when its seat
  terminal dies unobserved (probe failure is neither write nor clear). Consequence today: the
  `waits_on` display drops a slot the operator is actually waiting on, though a dead direct seat is
  exactly the unobservable case D10 defines and the display recovers the moment the seat is
  re-probed or re-created. Deferred: fixing it needs a semantics decision (clear-on-unobservable vs
  hold) the design does not make, and `akrogon direct` rerun is the documented recovery. Promoted
  to a Fix if a real operator flow shows the stale display misleading the merge tail.
- N2: `tests/AREA.md` names `tests/budget.test.ts` and the glob form `tests/hc-*.test.ts`, neither
  resolving to a file. Pre-existing on main (verified: the same lines are in the base tree), so no
  criterion of this leaf is hit. Deferred to a docs-cleanup pass; promote if the file acquires more
  dead pointers.
- N3: `rewriteSeatRefs` documents itself as byte-preserving but round-trips the whole file through
  `writeYaml`. For machine-written akrogon states the output is semantically identical and the
  tests' loose comparisons pass, so nothing is wrong today; the comment overclaims. Deferred:
  states are chmod 444 and never hand-authored, so formatting drift has no realistic source.
  Promote if hand-edited states ever enter the flow.

## Test-Change trailers

Not B's duty, noted for symmetry: the trailers I checked while reading (e01743a6, 5abe6870,
62aaa5b6, the prettier sweep, the probe reproduction pair, both citation-only empty commits) each
cite a real source — deleted mechanism lines, real-systemd behavior, verified git refspec behavior,
the hc-boot evidence. The one judgment call: the two empty trailer-only commits are the sanctioned
exception the rule itself names.

## Verdict

ready
