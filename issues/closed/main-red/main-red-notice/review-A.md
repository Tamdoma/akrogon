# Review A: main-red-notice

Base reviewed: `c9f658b` (`AKROGON_BASE`). Head reviewed: `7e08d2b`.

Evidence: `akrogon verify` green on `7e08d2b` (format, 1010 tests, typecheck); planned criterion logs `implementation/check-notice-c{1..5}-*`; live reproduction below.

## Fix

- F1 — The notice scan runs for every `compares` record, not only completed base runs. In `runOnce`'s finalize the scan is gated on `compares !== undefined` alone. A base run whose setup fails (`setupExit !== 0`, `end` set) still pushes every configured command with the setup log and a nonzero exit, so `failedTests` yields `(no test name)` and the run sends `1 new red on main: (no test name)`. A run dying between commands (`PublishRefusedError` from `checkedRun`, or any throw after a red command) finalizes with `end` unset and partial `ran` and can likewise send for an incomplete run.
  - Realistic source: `akrogon verify --known-red` in a leaf whose base checkout fails `setup` (`bun install` failure, missing own `node_modules` — a real operational event; the fixture already reproduces it: a `--known-red` run with `setup: 'exit 7'` exited 1 and still ran `herdr notification show "repo main red" --body "1 new red on main: (no test name); ..."`).
  - Consequence today: an operator notification claiming main is red with a phantom `(no test name)` incident, prompting a repair charted against a nonexistent failing test; the bogus reservation also `notice`-covers the placeholder unit for later real base runs.
  - Criterion hit: brief criterion 1 — the notice fires only on a *completed* `--known-red` base run; the design repeats "Fires on any completed fresh base run". Fix: gate the scan on the finalized record being completed (`end !== undefined && setup === 0`), one-line guard beside the `compares` check.

## Nits

- N1 — The body count is deduplicated test names, not unit count: two different commands failing a same-named test print `1 new red` while `n` means units. Cosmetic; identity granularity is per design and names carry the payload. Promote if a criterion ever asserts the count.
- N2 — `src/AREA.md` line says the notification is sent "under the receipt lock"; the herdr call actually runs after the lock, and only the reservation write is locked (the second AREA line states it correctly). Doc wording only, no behavior. Would be a Fix under the doc rule only if it misleads a caller; the same file already carries the accurate sentence.
- N3 — `verify.ts` now imports `isAncestor` from `batch.ts`, creating a module cycle (verify → batch → next → phase → verify). Works today (hoisted function, all tests green); a local `merge-base --is-ancestor` call would avoid it but duplicates an existing helper. Deferred unless a loader regression appears.
- N4 — Criterion 3's equal-sha sub-case (green on the exact red revision resolves) is implemented via `is-ancestor` self-ancestry but no test exercises it; the criterion overall has direct tests. A test gap only under the weakest reading of the criterion.

## Verdict

fix (F1)
