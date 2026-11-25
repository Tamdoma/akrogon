# leaf-review — slot B

Reviewed as the implementer. Checked every named function against the code
(base a118b2ff); what follows is disagreements only.

## D1 — Criterion 1's proof can be met without ever exercising the `commitMove` hookup

Brief criterion 1 sentences the behavior to "after a committed phase move,"
but its proof line reads only "own test with real processes in a throwaway
user scope at the real cgroup boundary." That test can pass while the
integration the criterion is actually about is broken or absent: nothing in
it forces the sweep to be driven through `commitMove` (`src/phase.ts:199`)
with its enumeration keyed on the *moved leaf* (`sliceCgroup(leafSlice(repo,
slug, homePath()))`, design kill-module bullet). The failure modes that live
exactly in that seam — enumerating the wrong slice because `leafSlice` was
called with the wrong arguments, the kill running before rather than after
`saveState`, a `MoveCommittedError` escaping because the sweep threw inside
the try that wraps follow-up work — are invisible to a test that drives the
kill module directly. The fixture support exists: the repo's tests already
run inside a real user scope (`package.json` test script:
`systemd-run --user --slice=akrogon-test.slice …`) and exercise commit and
dispatch paths (`tests/batch-dispatch.test.ts`).

Concrete change: criterion 1's proof must drive a real commit — `commitMove`
or `akrogon phase` in the fixture with the leaf slice populated — so the
enumeration key, ordering after `saveState`, and the never-fail-the-move
property are what the test proves, not just the kill primitive, which the
charting proofs already cover.

## D2 — Criterion 2's writer bullet cannot happen through the design's own mechanism, and the test has no stated way to construct it

"A run-check writer whose tool shell is killed while it runs" — under the
new design there is no natural way for that shell to be killed while the
writer runs: the shell's `t-` is deferred precisely because the writer
keeps `akrogon/<t-name>` populated, and the deferred helper fires only
after the shell ends, at which point nothing is left to test. The scenario
the bullet protects (Taken [R] on `checkedRun`: publish before echo,
ignore `EPIPE`) is real — I confirmed the current order in
`src/run-check.ts:checkedRun` echoes `result.stdout`/`result.stderr`
*before* writing the kept file, the `check_end` row and the capture unlink
(exactly the order the design reverses) — but the shell dies by the
harness reaping a dead pipe or by external kill, not by the sweep. As
written, an implementer must guess how the shell is killed in the test:
SIGKILL the shell process directly? Close the read end of the writer's
stdout to simulate harness teardown? Those test different halves of the
EPIPE problem (shell death vs. pipe closure; note `EPIPE` comes from the
pipe being closed, which shell death only causes indirectly through the
harness).

Concrete change: the criterion or its proof line should name the
construction — e.g. "the writer's stdout pipe closed as the harness does
when its tool shell dies" — so the test exercises the pipe-closure half,
which is where `EPIPE` actually originates.

## D3 — `runCheck`'s final summary sits outside the reorder, and the design's claim about it is inaccurate

Design: "ignore `EPIPE` on both, including `runCheck`'s final summary
write." But `src/run-check.ts:runCheck` writes that summary line
(`check <name>: <code> <log>`) *after* `checkedRun` returns, hence after
the publish it protects. Ordering-wise nothing needs fixing there — the
state is already durable at that point — so the line misleads the
implementer into hunting for a reorder in `runCheck` that does not exist.
The only true content is the `EPIPE` ignore on the summary (cosmetic
robustness: the process should still exit with the run's code rather than
dying on the write).

Concrete change: narrow the design line to "ignore `EPIPE` on the echo
writes in `checkedRun` and on `runCheck`'s summary; no reorder in
`runCheck` is needed because it runs after publish."

## D4 — Criterion 5 leaves the hc-version dependency implicit

The spawned-shape predicate needs `foreground.name`, launch `argv`, and
`reason` in terminal records. I verified all three exist in the installed
hc's schema (`hc schema`: `Terminal.properties.argv`,
`Terminal.properties.reason`, `Foreground.properties.name`, hc 0.1.22),
so it is buildable today — but the draft does not pin or even mention the
hc version this depends on, while the proof criterion speaks only of "hc
terminal records shaped like the charting proofs P2," which are fixtures.
If the fields are younger than some hc version the seats run against, the
predicate silently never matches (zod `.default(null)` on missing keys —
`src/hc.ts:terminalSchema` uses non-strict `z.object` with defaults, so an
older hc yields records with `argv` undefined-as-stripped rather than an
error).

Concrete change: one line in the design or the criterion naming the
minimum hc version (or "hc ≥ the version that exposes these fields"),
plus the predicate treating absent `argv` as no-match rather than as a
match — which the design already implies but should state, since
`foreground.name in {…}` with a stripped field evaluates false anyway and
only the parked shape (which needs neither argv nor foreground) is
version-independent.

## Not disagreements (verified while checking)

- `sliceCgroup`, `procRoot`, `cgroupRoot`, `unitPopulated`
  (`src/scope.ts`) exist with the shapes the design assumes; the
  slice-nesting math matches the live tree.
- `scopeEntry`'s `cgroup.endsWith(scope)` (`src/seat.ts`) is a full-path
  suffix match, so `tools/` children do not disturb it — the design's
  first Open-for-plan question answers itself; the second one
  (`busy_since` clearing) likewise: `observeBusy` clears `busy_since` on
  the first non-working observe (`src/next.ts`), so a false notice cannot
  post after the seat flips.
- `commitMove` is the single choke point for every move (`transition`,
  `land.ts`, `next.ts` failure paths all reach it), so hooking the sweep
  there covers operator, merge, batch and failure moves as Taken requires.
- The bare-shell ordering premise checks out: `prompted.turn` records the
  delivery turn (`src/next.ts:dispatchSlot`), a recovered terminal resets
  `turn` to 0 (P2 records), so `prompted.turn < seat.turn` is false and
  the flow reaches the lost branch as the design says.
- `tests/` already run inside a real user scope with real cgroup
  writability and a fake-systemd-run fixture, so every "own test at the
  real cgroup boundary" is feasible without new machinery, matching
  signpost 2a.
- The `helpers/`-vs-`akrogon/` split in the design matches Taken [R2]
  verbatim, including the helper relocation exemption and the scrubbed
  marker.
