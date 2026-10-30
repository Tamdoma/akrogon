# Report: abandoned-capture-stop

Base: `76a1da50` (`AKROGON_BASE`; the check.fix refresh rebased the stack onto the moved main —
one docs-table conflict, resolved by keeping main's formatting plus the leaf's rows).
Committed head: `dedbc381`. Pre-rebase SHAs named below keep their original ids; the rebased
equivalents are in `git log 76a1da50..HEAD`.

## Changed files and reasons

- `tests/abandoned-capture.test.ts` (planning `b79e5884`→`125a287c`, A-owned): the three planned
  criterion tests; strengthened in `a3e303f6`→`d19ccff5` (criterion 3's "names and bytes keep"
  needed `existsSync` + `captures == 2` so a deleting gate could not pass; same criterion, same
  test, `Test-Change` trailer). B's check.repair added two reproduction cases in the same file
  (`342364f6` startup race, `5bc73701` publication race, each with `Test-Change`).
- `src/run-check.ts` (`bba81a7b`→`43f8b69f`, worker u1; B's repair `8916d5cb`, `ddb4bb03`,
  `83f9f325`): `checkedRun` opens capture-out and locks that open description (`flock -s 0` with
  the fd mapped to the helper's stdin — Bun maps no extra parent fds into children; verified
  deviation from the plan's `flock -s <fd>` spelling, same mechanism) before the `capture` line
  and `check_start`; the fd becomes the child's stdout so the lock lives until the last writer
  exits. B's repair staged the open under an unmatched hidden name and renamed after the lock so a
  probe never sees an unlocked pair (A F1), and revalidates capture-out's pathname after the
  probe so an already-unlinked inode does not refuse (B F1). Exported `abandonedCaptures(folder)`
  scans `**/capture-*-<uuid>-out.log`, skips pairs with a non-blank `cleared-<uuid>.md`, opens
  read-only and probes `flock -n -x 0` — ENOENT/vanished pairs are skipped, probe failures return
  `[]` (fail-open).
- `src/phase.ts` (`dd3b60b4`→`4a3b18bb`, worker u4): `refuseAbandonedCaptures` helper called from
  `moveGuards` (skipped when `state.phase === 'failed'`), `refuseEnclosingCompletion` and
  `completeOwner` before any state write — refusal is a plain `Error`, names each pair's out/err
  paths and the `cleared-<run>.md` to write. `a3e303f6`→`d19ccff5` removed u4's unrequested
  deletion of cleared pairs' files; names and bytes keep.
- Two SKILL.md (`38344045`→`884200e8`, u2): the discovery/cleanup/absence-read recovery rule in
  the four named sections; a later green run clears nothing.
- Three docs (`8fdbb5d3`→`a6c4bc79`, u3): `checks.md` behavior contract + refusal-table row,
  `commands.md` phase-row clause, `files.md` capture/`cleared` rows; `src/AREA.md`,
  `tests/AREA.md` describe the changed code and tests.
- `tests/run-units.test.ts` + `tests/AREA.md` (`5079b06e`, A, check.fix): the real-systemd case
  B F2 required — see criterion proofs.

## Commands run

- `check abandon-tests: 1 …/check-abandon-tests-1793194131307-2045472.log` (planning red:
  `expect(0).not.toBe(0)` — no gate on base).
- `check changed-tests: 0 …/check-changed-tests-1793194660921-2581104.log` (durable-capture +
  docs-links after wave 1 landed).
- Deliberate breaks (standing design A,B for criteria 2 and 4):
  `check break-fdshare: 1 …/check-break-fdshare-1793195447792-3567946.log` —
  `stdout: Bun.file(capture.out)` in place of the fd turned the wrapper-dead/descendant-alive pair
  abandoned and T2 red; reverted.
  `check break-probe: 1 …/check-break-probe-1793195452316-3569967.log` —
  `openSync(out, 'a')` in the probe recreated the vanished pair's file and turned T3 red;
  reverted.
- `check gate-fix: 0 …/check-gate-fix-1793195440260-3563491.log` — typecheck + all three planned
  tests green after the `a3e303f6` fix.
- `check abandon-final: 0 …/check-abandon-final-1793195465169-3572684.log` — planned tests +
  durable-capture on committed head.
- `akrogon verify` on `a3e303f6`: `verify leaf a3e303f62a5937d2d68aa491fffae0556ca625c0: green`
  (1231 pass, 0 fail).
- B's check.repair verify on `9425fac3` (pre-rebase): `verify leaf 9425fac3…: green`
  (1233 pass, 0 fail).
- check.fix (this pass): `check gatekill-test7: 0 …/check-gatekill-test7-1793196812789-565057.log`
  — the new real-unit test green alone; `check run-units-full: 0
  …/check-run-units-full-1793196838114-565483.log` — all 21 run-units tests green
  (22.3 s, real units). Earlier iterations `gatekill-test`..`test6` failed on test-side gaps
  (wrong capture dir, `--leaf` not a phase option, empty branch, missing receipt) and were fixed
  in the test before landing; the product gate was never touched.
- check.fix round 2 (B's re-check of F2): the case was rebuilt to observe the intermediate
  interval — a TERM-ignoring payload keeps the inherited stdout fd alive after the wrapper's
  SIGKILL until the real scope drains. Deliberate break `outFd: openSync(captureOut, 'a')` on the
  non-nested path turned it red: `check gatekill-break: 1
  …/check-gatekill-break-1793197536959-1142720.log` (no live-holder interval seen, refused at
  ~0.4 s); product restored byte-for-byte. Restored green:
  `check gatekill-green: 0 …/check-gatekill-green-1793197548455-1157321.log`.
- `akrogon verify` on `5079b06e` (before the round-2 test): green — 1242 pass, 0 fail; logs
  `…/check-test-1793196985108-607691.log`, `…/check-typecheck-1793196987561-607691.log`.
- `akrogon verify` on `dedbc381`: `verify leaf dedbc3812409b47bac579d4cd0112caed05103b2: green`
  (1242 pass, 0 fail, 72 files; typecheck 0; logs
  `…/check-test-1793197677988-1197615.log`, `…/check-typecheck-1793197681043-1197615.log`).

## Criterion proofs

- C1: T1 `an abandoned capture pair refuses non-failed moves…` — refusal on `--check` and
  single-slot, both pairs named, `state.yaml`/`log.jsonl` unchanged, `failed` + recovery open.
  Real seam: the new run-units test SIGKILLs the wrapper inside its real `akrogon-run-*.scope`,
  waits for the real guard to stop the unit and drain the cgroup, then `phase --check` refuses
  naming both capture paths and `cleared-<run>.md` — the production kill→drain→abandon path, not
  the fake-systemd fixture.
- C2: T2 `a live capture pair never refuses…` — command-alive, wrapper-dead/descendant-alive,
  nested; catching power shown by `break-fdshare`. Real seam: the same run-units test probes
  `phase --check` while the real unit is live with the stdout holder alive — exit 0, no refusal.
- C3: T1's clear sequence — whitespace refuses, non-blank passes, bytes and `akrogon log` kept.
  Real seam: the run-units test writes a non-blank `cleared-<run>.md` after the refusal and
  `phase --check` passes.
- C4: T3 `the liveness probe creates no file…` — err-only remnant and dangling-symlink ENOENT;
  catching power shown by `break-probe`.
- C5: T1's tail — green and exit-3 run-checks leave no pair and no refusal; durable-capture's
  normal-exit test stays green. B's repair added `5bc73701` proving a pair published and unlinked
  during a probe does not refuse.
- C6: diff of the two SKILL.md files carries the rule in the four named sections (review-judged).
- C7: `learnings/history/2026-10-28-killed-run-fixture-leak.md` absent on base; recorded, no
  lesson file changed.

## Repair history

- A F1 (startup visibility gap): staged-open + rename repair by B, `342364f6` test-red,
  `8916d5cb` fix, `83f9f325` hidden staging name.
- B F1 (publication race): pathname revalidation by B, `5bc73701` test-red, `ddb4bb03` fix.
- B F2 (missing real-systemd criterion-1/2 proof): A's `5079b06e` adds the non-nested
  `spawnReal`/`realFixture` case in `tests/run-units.test.ts` on the existing machinery; B's
  re-check found its criterion-2 proof insufficient (the pre-kill probe was satisfied by the
  wrapper's own fd). A's `dedbc381` rebuilds it to assert the live-holder interval after wrapper
  death and before drain, proven by the `gatekill-break` red / `gatekill-green` pair. Proof
  mapping updated here; no new runner, grant or product change.

## Worker returns

u1 (`bba81a7b`), u2 (`38344045`), u3 (`8fdbb5d3`), u4 (`dd3b60b4`) — reports in
`worker-u1..u4-report.md`. u4's "forced rule deletes cleared pairs" was a real defect u4
introduced and A removed it in `a3e303f6`; u4's other limitation note (no fixed stderr prefix)
is by design — the refusal names paths, not a prefix.

## Known limitations and unverified criteria

- `flock -s 0`/`flock -n -x 0` reach the target description through the helper's stdin slot
  because Bun children inherit no extra parent fds; the description locked is identical.
  Verified live by T2 (surviving descendant keeps the pair live) and T1 (dead writer frees it).
- The merged-completion probes (`refuseEnclosingCompletion`, `completeOwner`) are traced, not
  CLI-tested: a `merged` move needs the batch-record path, outside the leaf's reachable test
  forms; both sit before `saveState`/`closeSources`/`.closing`.
- The "surviving stdout holder outlives a dead wrapper" form of criterion 2 is proven by T2
  (nested, fake systemd), `5bc73701`, and the run-units gatekill case under the real unit: a
  TERM-ignoring payload survives the wrapper's SIGKILL inside the scope until the guard's
  `TimeoutStopSec=5` drain, and `phase --check` stays open for that whole interval.
- No unverified criteria.
