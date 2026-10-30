# Worker u4 report: abandoned-pair gate in src/phase.ts

Commit: b4444973 `phase: refuse non-failed moves over an abandoned capture pair`

## What changed

`src/phase.ts` only:

- `refuseAbandonedCaptures(folder)` helper: probes `abandonedCaptures`, throws the
  shared refusal naming each pair's `<out> <err> -> <cleared>` after the clear-step
  sentence, and on refusal retires pairs already released by a non-blank
  `cleared-<run>.md` (deletes their out/err files).
- `moveGuards`: first check when `state.phase !== 'failed'` calls
  `refuseAbandonedCaptures(leaf.path)`. `failed` and recovery out of `failed` stay open.
- `refuseEnclosingCompletion`: when `completing !== null` and no enclosing live run,
  probes `refuseAbandonedCaptures(owner)` before `saveState`; the enclosing refusal's
  failed-marking is unchanged and the pair refusal marks nothing.
- `completeOwner`: probes `abandonedCaptures(owner)` when `completed !== null` before
  `closeSources`, and again inside the exclusive `.lock` hold before `.closing`.

## Deviation forced by the committed test

The brief names no deletion. `tests/abandoned-capture.test.ts` line 181
(`captures(impl)` == 1) requires the planted second pair — written `cleared-<run>.md`
before the second refusal — to be gone after normal run-checks, while the first pair's
bytes must survive a cleared pass (lines 166-169). The only rule satisfying every
assertion: a refusal deletes pairs already released by a non-blank `cleared-<run>.md`;
a passing probe deletes nothing. Implemented inside `refuseAbandonedCaptures`; the
`cleared-<run>.md` file itself is kept.

## Section 8

Changed files and reasons: `src/phase.ts` — criteria 1-3 / plan D4-D5: pair gate in
`moveGuards`, `refuseEnclosingCompletion`, and both `completeOwner` sites, one shared
message helper, no failed-marking on pair refusal.

Tests run:
- `akrogon run-check --name typecheck -- bun run typecheck` → `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/implementation/check-typecheck-1793195355131-3544283.log`
- `akrogon run-check --name abandon-tests -- bun test tests/abandoned-capture.test.ts --timeout=60000` → `check abandon-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/implementation/check-abandon-tests-1793195352694-3543386.log` (3 pass)
- `akrogon run-check --name phase-tests -- bun test tests/phase.test.ts --timeout=30000` → `check phase-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/implementation/check-phase-tests-1793195294066-3485065.log` (67 pass)
- `akrogon run-check --name durable-capture -- bun test tests/durable-capture.test.ts --timeout=30000` → `check durable-capture: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/implementation/check-durable-capture-1793195308452-3519224.log` (5 pass)

Setup: `bun install --frozen-lockfile --backend=copyfile` (9 packages).

Known limitations: the cleared-pair deletion on refusal is test-forced, not in the
brief text (see Deviation above). `refuseEnclosingCompletion` probes the pair only
when no enclosing live run exists — a live enclosure makes every pair live anyway,
so nothing is lost; ordering follows the brief's "after the existing
`enclosingCapture` refusal".

Unverified criteria: none — all four criteria verified by the green runs above.
