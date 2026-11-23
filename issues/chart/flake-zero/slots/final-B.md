# Final B: flake-zero

Checked 'Taken' at main 814a2387. Three breaks. B1 is a mistake in my own map (A4). 1b, 1d, 1e, 1f, 2b and 4 are ok. (H) marks what I ran or counted on 2026-11-23.

## Breaks

- B1. Pick 1c waits zero time in the only case that fails.
  - The start-proof deadline is a local of `firstTask` (`src/seat.ts:182`). `firstTask` returns "unconfirmed" only when that deadline has run out (`src/seat.ts:196-203`).
  - The cgroup check runs after it (`src/seat.ts:310`, `:333-334`). A seat still outside its scope has not started its harness, so it has no proof and the outcome is always "unconfirmed". The deadline is already spent, so "or the start-proof deadline passes" ends the wait at once and the red stays.
  - Tests shrink that deadline to 3 s (`tests/hc-fixture.ts:185`), which is why only tests hit it.
  - Fix: the wait at `:333` takes a bound of its own, started there: until the cgroup matches, the seat ends, or `PANE_WAIT_MS` passes (`src/seat.ts:43`, 15 s, and 1d removes the test override). The next step, `place`, already uses that bound (`src/seat.ts:225`).
- B2. Pick 1a: `discard` and `sweepAbandoned` cannot use 71378d15's method.
  - 71378d15 asks the live core for its seats' labels and hashes them with the fixture home (`src/scope.ts:8-11`).
  - `discard` must not contact hc: a killed core's socket would start a new one (`tests/hc-fixture.ts:347`). It is synchronous, with four callers (`tests/session-routing.test.ts:123, :209, :515`, `tests/hc-identity.test.ts:153`).
  - `sweepAbandoned` knows only the runtime folder name of a dead worker (`tests/hc-fixture.ts:56-66`). It has no home, so it cannot compute a slice name even when the core still answers.
  - Fix: record the name where the slice is made. The test wrapper sees every `--slice=` argument and runs with the core's runtime folder (`tests/core-bin/systemd-run:5`). It appends the slice name to a file in that folder. `stop`, `discard` and `sweepAbandoned` read the file before they remove the folder (`tests/hc-fixture.ts:66, :353`) and stop those slices. One method for all three, and the label code from 71378d15 goes.
- B3. Pick 3 and 1g: the slice count cannot be flat while other branches verify.
  - Branches forked before the landing run the old fixture and keep leaking. Six chart branches ran 46 suites today. The count is 4,037 now with two verify passes running (H).
  - Fixture slices and the operator's real leaf slices share one name pattern (`src/scope.ts:10`). The cleanup in 1g finds "empty" and then stops, which can kill a seat that joins in between. That is the fault 8eef2d0b removed.
  - Fix: run 1g and the count in pick 3 while no `akrogon-verify-*` service is active. Count before and after the six runs.

## Not breaks

- Pick 2a runs the five repeats one after another in one worker (H: Bun 1.4.5 reloads the file per repeat, same pid, hooks run each time). A shared fixture in `beforeAll` works. The load is lower than in my three-at-once rounds, so the catch rates in my map are a ceiling.
- Pick 2a skips a change to a helper such as `tests/hc-fixture.ts`, where this chart's own fixes are. Rule 3 in 2b covers that by reading. The diff for the file list should leave out deleted files.
