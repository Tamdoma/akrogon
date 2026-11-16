# Review B: blocked-seat-notice

2026-11-16, initial check.review. Verdict: **fix**.

- Base: `7cee541d9d9aedabd3c00e069d5c890ec2f2e6a3`.
- Reviewed head: `1ba11ba5041eb13ba9c405fe121dbe6023c8910b`.
- Worktree clean. Reviewed independently without reading A's review.

## Fixes

### F1: the required replacement deliberate break has no evidence

Brief criterion 3 explicitly requires the replacement case to turn red when replacement clearing is omitted. `implementation/report.md:75` instead cites the pre-implementation replacement run. Read-back of `implementation/check-c3-replaced-1794844785680-776549.log` shows it fails at `tests/next.test.ts:510`, before killing or replacing the original seat: `blocked_notified` does not exist. That is not a run of the requested break with the rest of the feature present.

Consequence: the required proof that the replacement test detects missing replacement clearing is unverified. This blocks the brief's explicit proof requirement, independently of whether the current clearing code is correct. The implementation directory and timing records contain no completed run of that deliberate break.

Required repair: use the existing replacement test and runner, temporarily omit only the replacement clearing in `dispatchSlot`, keep its red result at the post-replacement assertion, restore the code, and keep the green result. Correct the report's deliberate-break claim. No new machinery or test case is needed.

### F2: the phase-move proof does not assert that the field was cleared

The sole phase-move test seeds `{ A: 'pending' }`, then uses `toMatchObject({ phase: 'implement', blocked_notified: {} })` at `tests/phase.test.ts:1295`. An empty partial object accepts both `{ A: 'pending' }` and `{ A: 'shown' }`. The following assertions check notice files, not the field.

Source and consequence: the planned real CLI move `akrogon phase move implement --slot A` is criterion 3's phase-move proof. It can accept a retained episode marker after its file is removed, even though that marker would suppress the next blocked episode. No other test checks field clearing on a phase move. Thus one explicitly required done outcome has no assertion that catches its failure.

Evidence: `check b-phase-empty-matcher: 0 implementation/check-b-phase-empty-matcher-1794845587903-2392804.log`, read back with `akrogon log`. The installed Bun matcher accepts the exact nested assertion with both stale values. This is a missing check of the required result, not a preferred assertion style.

Required repair: assert exact emptiness of `readState(path).blocked_notified` separately and rerun the planned phase-move proof after the assertion change. This corrects a test expectation and therefore belongs to A under the check.repair exceptions.

## Verification and scope

Read the brief, design, plan, implementation report, installed review references, standing design, affected source and tests, reference index, and the state/phase and dispatch documentation. Traced blocked observation, notice consumption, unblock, replacement, phase moves, session routing, and the no-input path. No product defect found in those paths.

The new `blocked_notified` documentation row matches the implementation. No AREA.md or lesson file changed. No documented behavior discrepancy found.

The current-head verify receipt is `a10de6ab-5bbe-4707-be62-5a3c1bb307a0`, tree `2f64e4f2fee8b093b82fe1178258d222a36d1cde`. Read back its logs:

- `implementation/check-format-1794845395049-1871335.log`: format passed.
- `implementation/check-typecheck-1794845397451-1871335.log`: typecheck passed.
- `implementation/check-test-1794845454283-1871335.log`: 1193 passed, 0 failed, 83 files. Includes all five new criterion tests, the working-seat busy test, and session routing.

The earlier targeted green logs `check-proofs-blocked-1794845247946-1272446.log`, `check-c3-move-green-1794845250709-1290589.log`, and `check-busy-regress-1794845254538-1292538.log` were also read back. The later full configured command executes the planned cases on the latest test revisions, with no skipped or disabled planned cases or runner configuration changes. The grouped targeted filters do not omit a planned case. No proof-command correction changes the observed result. Earlier format and test failures have causes in this diff and are superseded by the current-head green receipt.

No full-suite rerun was needed. The only review run is the narrow installed-matcher proof for F2. No covered live or paid operation occurred, and grants are empty. The local test logs and timing entries agree with the report's zero covered launches. No abandoned capture pair remains in the implementation directory.

## Test-Change trailers

Listed from `7cee541d..HEAD`; all changed test paths match `src/test-files.ts`.

- `1a1c2a2a`: `Test-Change: tests/next.test.ts added four blocked-notice cases; the blocked-wait test's busy_since expectation flips to undefined, source design.md 'it sets no busy clock'` — source supports the changed old expectation.
- `1a1c2a2a`: `Test-Change: tests/phase.test.ts added the phase-move blocked-notice clearing case, no existing expectation changed` — additions match criterion 3, subject to F2.
- `521c8c65`: `Test-Change: tests/phase.test.ts corrected the blocked-clearing case's stdout assertion to toContain, source real CLI output 'moved implement\nt1'` — `phaseWake`/`startSeat` trace supports the extra address output and the correction preserves the move assertion.
- `1ba11ba5`: `Test-Change: tests/next.test.ts updated two blocked-seat expectations, source design.md 'it sets no busy clock' and brief criterion 4` — source supports both changed expectations.
- `1ba11ba5`: `Test-Change: tests/session-routing.test.ts updated the routed notice expectation, source brief criterion 1 (a blocked seat gets the Blocked leaf notice)` — source supports the replacement of the old busy-notice expectation while retaining the session-routing check.

## Nits and operator actions

None. Both Fixes use existing local proof tools and need no operator permission.

## 2026-11-16 check.repair

Read both initial reviews against unchanged head `1ba11ba5041eb13ba9c405fe121dbe6023c8910b` and base `7cee541d9d9aedabd3c00e069d5c890ec2f2e6a3`. A recorded nits only. B's F1 and F2 remain open and both meet the handoff exceptions below. No product repair belongs to B, no operator action is open, and no proof machinery is missing.

No code or test changes, commits, or proof runs in this pass. Earlier green evidence remains applicable to the unchanged inputs, subject to the two recorded proof gaps. No covered launches or new fixtures.

### Handed to A

- F1: criterion 3's required no-clear-on-replacement deliberate-break capture is missing. Exception: a criterion's proof lacks only a capture the existing runner and helpers can produce. Use `bun test tests/next.test.ts -t 'replaced blocked seat'` through `akrogon run-check`, capture red with only the replacement clearing omitted, restore it and capture green, then correct `implementation/report.md`.
- F2: criterion 3's phase-move field-clearing assertion accepts stale entries. Exception: correction of a test expectation. Assert `readState(path).blocked_notified` equals `{}` independently, cite criterion 3 in the changed test's `Test-Change` trailer, and rerun `bun test tests/phase.test.ts -t 'blocked notice'` after the edit through `akrogon run-check`.

Requested destination: `check.fix`, with both Fixes handed to A.

## 2026-11-16 check.review after check.fix

Verdict: **ready**. F1 and F2 are resolved. No new findings or operator actions.

Prior reviewed base/head: `7cee541d9d9aedabd3c00e069d5c890ec2f2e6a3` / `1ba11ba5041eb13ba9c405fe121dbe6023c8910b`. Handed-off base/reviewed head: `7cee541d9d9aedabd3c00e069d5c890ec2f2e6a3` / `f7084a24130620a5a0279834c6ee053e9d5cae55`. Worktree clean.

Computed the required range-diff independently: `check b-repair-range: 0 implementation/check-b-repair-range-1794845892737-2685408.log`, read back with `akrogon log`. All seven original commits are unchanged; only `f7084a24` is added. Reviewed that repair and the report's new check.fix evidence. No product, runner, helper, fixture, or configuration change occurred. No documented behavior changed and no AREA.md or lesson file changed.

- F1 resolved: `check f1-break-red: 1 implementation/check-f1-break-red-1794845770714-2425558.log` fails at the post-replacement field assertion (`tests/next.test.ts:517`), receiving `{ A: 'pending' }` instead of `{}`. The report records only the replacement clearing call omitted, then restored byte-identically. `check f1-restore-green: 0 implementation/check-f1-restore-green-1794845775317-2427199.log` passes the same replacement test after restoration. Both logs were read back. This satisfies the explicit deliberate-break requirement and supersedes the earlier missing-field red claim.
- F2 resolved: `f7084a24` keeps the phase assertion and independently asserts `readState(path).blocked_notified` equals `{}`. `check f2-move-proof: 0 implementation/check-f2-move-proof-1794845764885-2424657.log`, read back, passes the planned phase-move test after the assertion edit (six assertions).

New trailer: `Test-Change: tests/phase.test.ts strengthened the phase-move clearing assertion to toEqual({}), source brief criterion 3 (a phase move clears the field)` — the cited outcome requires exact emptiness and supports this correction. Earlier trailers remain as reviewed above. No planned case is skipped or disabled and no proof command requires correction.

Current-head receipt `524cf378-4b4a-4ca6-864e-7e6cac115dcc`, tree `d0a6c6de0e3607989d34e9abea776e0175f0a9b3`, records all configured checks green. Read back `implementation/check-format-1794845787877-2428785.log`, `implementation/check-typecheck-1794845790414-2428785.log`, and `implementation/check-test-1794845847580-2428785.log`: format and typecheck pass, 1193 tests pass with zero failures, including the corrected phase-move test and every blocked-notice criterion test. This full run is after the latest test change and restoration, so no repeat suite was needed.

No covered operations or paid launches occurred. Proof timing entries match the three new proof logs, with no abandoned captures present. B holds no reusable Nit requiring a lesson record. Requested destination: `merge`.
