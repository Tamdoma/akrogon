# Intake: land-own-reds

## Scope

A home stops only the leaf slices and run units it owns, and a red land reruns its failing units once with the repo's own rerun command before exiting, each save recorded and visible in akrogon flaky.

Covers: #151 and #149 P1 (seed-149 lock: P1 first). #149 closes from lean-akrogon after the session. Opening map and picks: issues/chart/lean-akrogon/slots/map-merged.md (with map-B.md, map-C.md, rebuttal-B.md, rebuttal-C.md, history-reversals.md).

## Provenance

- GitHub: Tamdoma/akrogon#151
- Operator: /chart-issues 2026-11-22T17:54Z, verbatim in issues/chart/lean-akrogon/INTAKE.md

## Source: Tamdoma/akrogon#151

# Host reconcile stops other akrogon homes' empty leaf slices on a shared user systemd, killing seats that just joined them (seen as a seat cgroup ENOENT in verify)

Source: Tamdoma/akrogon#151
URL: https://github.com/Tamdoma/akrogon/issues/151

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

During the 2026-11-22 repo-caps landing verify, the test "a wake after tab loss re-dispatches seats into the same slice and the next pass keeps it" failed with a dispatch error for leaf `lost-tab`: `ENOENT: no such file or directory, open '/proc/<pid>/cgroup'`, read at `src/seat.ts:333` right after the seat started. It passes alone.

The user journal from that run shows the wake seat for `lost-tab` (slice `akrogon-l715c9dae38b1`) started at 17:46:37.106, stopped at .109, and its slice removed at .118. Around it were runs of slice removals in sorted hash order, the order the host step walks.

The test's stand-in seat never exits on its own (`tests/stand-in.sh:62` loops on stdin), so something outside the test stopped the slice.

A second, unexplained failure in the same suite fits the same pattern, though unproven: in `tests/door-reset.test.ts` "agy: the reset helper runs its stages in order …", the helper was killed by a signal right after logging `started`. A SIGKILL after `started` reproduces that exact failure. No sender was found in 60+ loaded runs.

## Location

akrogon host reconcile in a `next` pass: `src/reconcile.ts` around 1297-1368 (the loop over loaded `akrogon-l*.slice` units). Seen through `akrogon verify` (full suite, `bun test --parallel=4 --no-isolate`) on a host where the operator's live akrogon also runs.

## Reproduction

Intermittent. One failure in today's verify runs (land-reds/repo-caps). Reproduced on purpose, 3 of 10 runs: during the wake, a temporary loop stopped the lost-tab slice as soon as it was empty, 0-0.3 s in. Another reproduction: a real `leaf-slices` pass with an empty foreign slice loaded stopped that slice 3 of 3 times.

## Expected behavior

A `next` pass's host step stops only the leaf slices of its own akrogon home. Seats of other homes on the same user systemd (test homes, a second install) are never stopped.

## Urgency

High for landings. Any verify running while the operator's live akrogon wakes (every agent turn end) can lose a seat mid-test, and that red costs a retry or a repair round. The same applies between test files: `tests/leaf-slices.test.ts` runs 4 real `next --all` passes against the real systemctl.

Partial workaround on branch test-races (not yet landed): a test-only systemctl wrapper limits `leaf-slices` passes to their own case's slices. It cannot stop the live install from doing the same thing.

Related ordering risk: Tamdoma/akrogon#149 P12 proposes letting host reconcile stop dead `akrogon-test-*` slices too, which widens what one home stops on the shared manager.

## Suspected cause

The slice names are global, so ownership is decided only by matching this home's own leaves. `leafSlice` (`src/scope.ts:7-8`) names a slice `akrogon-l` plus `sha256("<repo name>/<slug>")[:12]`, with nothing identifying the akrogon home. The host step (`src/reconcile.ts:1322-1368`) walks every loaded `akrogon-l*.slice` on the user manager. A slice that matches none of its own home's leaves is kept only when it is in `badSlices`, is the process's own slice (`ownSlices`, `src/scope.ts:105`), the leaf inventory had errors, there is a live run record of this home (`liveRuns`), or the slice holds a process (`sliceHasProcess`, `src/reconcile.ts:181`). Otherwise `stopSlice` (`src/reconcile.ts:222-227`) stops it.

The process check and the stop are separate steps. `stopSlice` holds `withAdmissionLock`, which is per `AKROGON_HOME` (`src/admission.ts:51`), so another home starting a seat into that slice between check and stop is not excluded. Contributing condition: a slice is briefly empty when a seat is replaced (closeTab empties it, then the wake seat joins), which is exactly the window seen in the journal.

The other home in today's failure was another test file's home (`tests/leaf-slices.test.ts`, real `next --all` at lines 352, 373, 410, 885). The live install doing the same thing is inferred from the same code path, not observed in a log.

Whose view: agent (A of the test-races direct chart, from a subagent's journal reading and reproductions).

Files read: `src/reconcile.ts` 181-228 and 1297-1368, `src/scope.ts` 7-8 and 105-109, `src/admission.ts:51`, `src/seat.ts:333`, `tests/leaf-slices.test.ts`, `tests/stand-in.sh:62`.

Not inspected / would disprove: no journal capture of the live install stopping a test slice. A journal showing the live install's `next` stopping an `akrogon-l*` slice of a running verify home would confirm the live case. The door-reset helper's slice membership was not checked, so its link to this is unverified.

Related reports: Tamdoma/akrogon#149 (P12 widens host stops to `akrogon-test-*`; same host step), Tamdoma/akrogon#137 (closed, different: repeated seat starts after reboot). Searched Tamdoma/akrogon, all states, "slice stop seat" and "leaf slice reconcile" (limit 10), plus own reports since 2026-11-20.


## Agent findings (A, 2026-11-22)

F-temp. A test home deletes the live home's leaf temps. Evidence: k1-compile-cache verify on 788d0d19 (log issues/chart/k1-compile-cache/direct/check-test-1795372717098-3246263.log) failed 1194 tests with `ENOENT mkdtemp /var/tmp/akr-1000/5d20/07a5c53f/run-DHhlzu/akrogon-suite-…` 20 s in, right after green-merge land tests. No other run used that folder in the window (journal 19:38:16–19:38:37). During the next verify, four repo-hash dirs (19a8, 5313, 86c3, a05d) matching no registered repo appeared under the real /var/tmp/akr-1000.
Mechanism (code-read, the deletion itself not caught in a log): `launchLand` (src/land.ts:28-50) forwards HOME and AKROGON_HOME but not AKROGON_LEAF_TEMP_ROOT/AKROGON_RETIRED_TEMP_ROOT, and `constructedEnv` (src/run-check.ts) copies neither. A nested akrogon under a test home therefore uses the real default root. Its `reconcileHost` stray sweep (src/reconcile.ts ~1456-1470) drops every repo-hash dir not registered in its own home, which includes the live home's 5d20, and it also drops the shared retired root /tmp/akr-<uid>.
Same class as #151: shared names across homes. The #151 key (`leafSlice`, home compared with `homedir()/.akrogon`) also reads a test home with HOME changed as default.
