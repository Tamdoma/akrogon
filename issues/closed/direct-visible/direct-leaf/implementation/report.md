# implement report — direct-leaf

base: 4325f9ce (freshly refreshed at implement start, no upstream moves during the pass)
head: ecd49c02
branch commits: 16 (one test commit from planning + 15 implement commits)

## Implementation notes (missing constraints)

None surfaced: every construction question was answered by the plan's research, and the three
mismatch returns were test-construction bugs corrected under the correction rule, not missing
implementation constraints. The one architecture adaptation — direct.ts's state access moving into
src/state.ts (be39d36a) — refines no decision: D1-D4 never named a file layout, and the move is the
state-inventory structural rule's own demand. Model-choice reading: the brief and design are
mechanical throughout (state shapes, prompts, probe orders); no recorded model choice needed a
reading.

## Wave execution

### Wave 1

U1 (worker): commit f0d3cc71. `src/state.ts` schema `direct` field; `src/direct.ts` with both verbs;
`src/usage.ts` rows, dispatch, commands.md rows; `writeLeafEnv` exported in `src/next.ts`;
`stopLeafWork` factored in `src/stop.ts` with D18's `stop --all` direct selection; the sanctioned
contracts-map edit in `tests/command-reference.test.ts` (trailer present). Targeted: direct-create
12/12, direct-drop 6/6 green.

U6 (worker): commit a4f26790. Skills rewritten (chart-issues skill + shapes.md, implement-issue,
check-issue, broadcast-issue, plan-issue, watch-issues), prose docs rewritten, old route deleted
(asset, guards script, guards test). receipt-gates and docs-links green; both trailers present.

Mismatch A (returned by U6, corrected by me): `tests/run-units.test.ts` pinned the deleted door
route in two assertions. Corrected in e01743a6 — the assertions named the deleted mechanism itself;
the surviving checks (standalone leaf holder, receipt-gates regex still green) cover the contract.
30/30 pass. Trailer cites the deleted files.

### Wave 2

U2 (worker): commit fed5304c. `direct` threading on `requiredSlots`/`historicalSlots`, phase.ts
threads including `waitsOn`'s and next.ts's, the repair-to-merge guard (direct accepted only when
`merge_exit.reason` is red and top is the branch head), the D8 target gate in `commandMerged`, and
`visitGaps` direct suppression in `timing-report.ts` (both prompt gaps and the round-0 seat_done
gap; check_end pairing untouched).

U3 (worker): commit 5a5fa8af. `observeBusy` probes recorded seat refs through each ref's own session
with `busy_since` only on required slots; `dispatchLeaf` skips allocation for direct; the
`activeCount` fallback excludes direct leaves. routing.ts cherry-pick conflict with U2 resolved in
favor of U2's lookup-table form (semantically identical, both D6).

U4 (worker): commit aec44d83. `leafStart` exported from `src/status.ts` and consumed by status text,
JSON and `timing-report.ts` merge-time computation; direct TIME starts at creation.

Two honest mismatch returns from U3, corrected by me in 5abe6870 (trailers cite the sources):
- M1: `stop --all` re-selects the already-stopped direct leaf (D18) and the fake systemctl models
  stop as delete where real systemd exits 0 — re-seeded the consumed slice before the sweep.
- M2: `tests/leaf-stop.test.ts` pins a non-zero bare `next` while any leaf is stopped — unstopped
  the control before the pass assertions. Also scoped `adopt()` to the whole test since the endgame
  passes re-dispatch the control's seat.
direct-seats 3/3 green after the corrections. All three corrections were verified construction bugs
(U3 reproduced each against the real implementation), so no product revert was needed.

Structural catch found on the lane between waves: `tests/state-inventory.test.ts` was red from wave
1 — `src/direct.ts` parsed leaf state and reached for the schema, which the structural test pins to
`src/state.ts`. U1's worker regression sweep missed it. Corrected in be39d36a: the scan-by-slug
(`slugLeafFolders`), the direct-marker read (`hasDirectMarker`), the byte-preserving seat rewrite
(`rewriteSeatRefs`) and the validating parse (`parseLeafState`) moved into `src/state.ts`; direct.ts
keeps only the verb flow. The structural test was not edited — the primitives belong where it wants
them. direct-create/direct-drop/state-inventory all green, no behavior change.

### Wave 3

U5 (worker): commit 0682f51b. `broadcastPass` direct branch: probes `terminal(seat.B.session,
seat.B.address)` (cross-session safe), sends only when idle/done, records `prompted.B` /
`delivery_error.B` under the existing settle rules, never allocates; closed broadcast-pending leaves
join the status JSON leaves array while text tables stay open-only; the D8 sweep adds `webhook_env`
to the broadcast-positive fixtures in green-merge/batch-dispatch (negative controls unchanged, both
trailers present).

One honest mismatch return from U5, corrected by me in 62aaa5b6: direct-land T3's lifecycle control
branches off the landed tip and rewrites `direct-file` with identical bytes — nothing to commit,
impossible for any implementation. Verified independently (the land's push updates the local
tracking ref, so origin/main IS fix-alpha's head after the land). Corrected with unique per-slug
content; trailer cites the verified git behavior. direct-land 6/6 green after the correction.

## Worker budgets

No paid sessions: every worker command ran locally (bun test, hc-fixture cores). Budget line in each
brief: "commands run through akrogon run-check only when long"; no API cost stages in this leaf.

## Criterion proofs (all `check <label>: <exit>` lines, logs under implementation/)

| criterion | proof | result |
|---|---|---|
| 1 create | `akrogon run-check --name direct-create -- bun test tests/direct-create.test.ts --timeout=120000` | exit 0, 12/12 |
| 2 drop | `akrogon run-check --name direct-drop -- bun test tests/direct-drop.test.ts --timeout=120000` | exit 0, 6/6 |
| 3 seats | `akrogon run-check --name direct-seats -- bun test tests/direct-seats.test.ts --timeout=120000` | exit 0, 3/3 |
| 4 active | `akrogon run-check --name direct-active -- bun test tests/direct-active.test.ts --timeout=120000` | exit 0, 2/2 |
| 5 timing | `akrogon run-check --name direct-timing -- bun test tests/direct-timing.test.ts --timeout=120000` | exit 0, 3/3 |
| 6 runs | `akrogon run-check --name direct-runs -- bun test tests/direct-runs.test.ts --timeout=120000` | exit 0, 3/3 |
| 7 phases | `akrogon run-check --name direct-phases -- bun test tests/direct-phases.test.ts --timeout=120000` | exit 0, 6/6 |
| 8 land/broadcast | `akrogon run-check --name direct-land -- bun test tests/direct-land.test.ts --timeout=120000` | exit 0, 6/6 |
| 9 docs/skills | `akrogon run-check --name direct-cmdref -- bun test tests/command-reference.test.ts tests/cli-help.test.ts --timeout=120000` | exit 0, 11/11 |

Criterion 9's grep leg (no live direct-guards references): `grep -rn "direct-guards\|direct-route"
src/ skills/ docs/ tests/ README.md` outside deleted-file history matches nothing (the route is
gone; skills describe the leaf flow).

The rerun criterion (criterion 1's rerun leg) rides inside direct-create's rerun cases (12 tests
include both reruns and the closed-merged rerun).

## Deliberate breaks (all three confirmed red, then reverted)

1. `activeCount` fallback without the direct exclusion: `an unfinished direct leaf in a repo whose
   session is unreadable never counts toward max_active` fails — the exclusion is load-bearing.
2. `commandMerged` with the target gate forced on: both no-target direct-land tests fail — the gate
   is load-bearing.
3. `visitGaps` without the direct kind filter: the direct-timing gaps test fails — suppression is
   load-bearing.

## Regression evidence

- implement-regression (green-merge 33, batch-dispatch, dispatch-repair 30, session-routing,
  merge-epic, merge-batch, merge-red-exit, status 51, timing-report): `check implement-regression: 0`
  (exit 0).
- leaf-stop/timing-report/phase/receipt-gates/docs-links: 115 tests, 0 fail.
- next/reconcile/state-inventory/run-units: 288 tests, 0 fail.
- typecheck clean at every pick; prettier applied to the two state-centralization files.

## Wall time

Implement pass: about 100 minutes total (worker waves ~30/25/35 minutes of wall each with overlap;
hc-fixture-heavy tests run in tens of seconds each).

## Changed files (product)

- src/state.ts — schema `direct` field; slugLeafFolders/hasDirectMarker/rewriteSeatRefs/parseLeafState
- src/direct.ts — new, the two verbs
- src/usage.ts — verb rows/usage
- src/akrogon.ts — dispatch
- src/next.ts — writeLeafEnv export; observeBusy/dispatchLeaf/activeCount direct handling;
  broadcastPass direct branch
- src/stop.ts — stopLeafWork factored/exported; `stop --all` direct selection
- src/routing.ts — direct threading
- src/phase.ts — threads, repair-to-merge guard, D8 gate
- src/status.ts — leafStart export, direct start times, closed-pending JSON inclusion
- src/timing-report.ts — leafStart consumption, visitGaps suppression
- src/reconcile.ts — broadcastInProgress session-scoped probe; temp sweep keeps unfinished direct
- skills + docs — the leaf flow rewrite, old route deleted
- docs/reference/commands.md — verb rows

## akrogon verify

`verify leaf ecd49c02...: green` — format 0, typecheck 0, test 0 (1530+ tests incl. the leaf's).
Full log: check-test-1795632680325-204888.log.

## Real bug found and fixed during verification (fail-before/pass-after shown)

The first full verifies red on one of two rotating hc-side failures. Investigation found a real
product bug in this leaf's diff, not flake: `observeDirectSeats` (and the broadcast probes) reached
the recorded direct seat refs through `terminal()`, and `hc` boots a core for any session it is
asked about — the booted core binds nothing useful in the fixture runtime and is orphaned when the
test ends, and its `core.lock` (under the real user state dir, which hc does not take from XDG) then
wedges every later probe of the same session name across the host: the 120-second timeout of the
direct-phases end-to-end test and the mis-cased verify.test failure in full runs.

Fail-before: with the pre-fix probe restored, the new integration test fails because the booted
core's state dir appears. Pass-after with the fix. Two-level reproduction committed first
(db186390): `probeTerminal` unit contract in hc-identity plus the integration pass-over in
direct-seats. Fix in ecd49c02: `probeTerminal` in src/hc.ts checks the session socket before any
hc call (absent/dead is null, never booting); observeDirectSeats, broadcastDirect and reconcile's
broadcastInProgress probe through it. `terminal()` itself is unchanged after an abandoned first
attempt — the socket probe cannot live inside it because fake-hc consumers (startConsultant and
wait-path tests) have no socket by construction; their reds were the evidence.

This also explains the mid-pass environmental noise: orphaned probe cores accumulated across the
day's runs. Host cleaned (four orphan serves killed, seven probe state dirs removed); the fix makes
the class impossible.

## Implement-end proof reruns on the final head

All nine criterion proof commands rerun after the probe fix (their inputs changed), every one exit 0:
direct-create, direct-drop, direct-seats, direct-active, direct-timing, direct-runs, direct-phases,
direct-land, direct-cmdref. The green runs are the newest `check-direct-*` logs in this folder.

## Limitations

- A direct broadcast send writes no `prompt` timing row — effect-free: `leafStart` reads creation
  for direct leaves and direct prompt gaps are suppressed, so no report surface changes.
- `delivery_error.B` for a thrown HcError carries no screen capture (optional schema field); the
  `started: false` path captures one as lifecycle does.
- U4 noted: a corrupt direct state missing `created` would fail at render as an upstream corrupt
  input rather than a status bug — unreachable through the schema (`created` is required).

## Unverified criteria

None.

## Check.fix round 1

- B reviewed base `4325f9ce566c5d8588f84b7a214422e1dffe62a0` and head `1d546a7dd58da97cdeb753a52be2d558c74b4db1`. B fixed F7 in `e3eb1894` before this pass. Both refreshes left the base unchanged. The repaired head is `008dece22b62f92f71d8fb564edee37a3dbce9e2`.
- **F1, F3, F8** (`22f54842`): `src/direct.ts` and `src/state.ts` validate the real draft layout, refuse reserved owners and full-depth duplicate slugs, serialize reruns and drop eligibility with phase/dispatch, and move the owner under the exclusive capture lock. Chart and command docs now show the same layout and drop destination. `tests/direct-create.test.ts` and `tests/direct-drop.test.ts` cover the CLI, real lock contention, and artifact preservation. Corrected the readiness fixture in `08c87732` to match the actual five-array schema, with no weakened assertion. See `worker-report-r1.md` and `check-r1-integrated-1795642378082-2322768.log` (37 pass).
- **F2, F4, F5** (`c1d01705`): `src/next.ts` rejects managed seat creation and settles late deliveries at the original turn without a resend. `src/hc.ts` and `src/reconcile.ts` distinguish an absent reviewer from a transient hc error and check the turn in B's recorded session. `src/status.ts` includes closed pending broadcasts with area-relative groups. `tests/direct-seats.test.ts` and `tests/direct-land.test.ts` cover refusal, late settlement, text and JSON status, and cross-session cleanup. See `worker-report-r2.md` and `check-r2-integrated-1795642410670-2352793.log` (129 pass).
- **F6** (`008dece2`): `src/timing-report.ts` gives direct leaves creation-based cohort membership, without changing planning-prompt membership for lifecycle leaves. `tests/direct-timing.test.ts` proves the cohort member has the expected elapsed time and no prompt or seat gaps, alongside the run-pair control. See `worker-report-r3.md` and `check-r3-integrated-1795642420877-2405645.log` (19 pass).

Red-before on `e3eb1894` with the regression edits: `check-repair-red-1795641780774-1598716.log` (4.47s), including the wrong draft, unlocked rerun, duplicate send, managed seat and bad status group. The cohort reproduction with a valid ISO cutoff is `check-r3-red-1795641790532-1619337.log` (0.16s): CLI succeeded but omitted the cohort member. R1/F3 also uses B's actual chart-capture reproduction in `review-B.md`. The archived worker reports preserve the targeted CLI edge evidence for terminal disappearance, transient hc errors, and both lock boundaries.

### Integrated-head proof before the state lookup follow-up

Each row ran via `akrogon run-check --name <label> -- <argv>` on `008dece2`. Logs are relative to this report.

| Label | Command | Result | Wall | Log |
| --- | --- | --- | --- | --- |
| direct-create | `bun test tests/direct-create.test.ts --timeout=120000` | 0, 14 passed | 1s | `check-direct-create-1795642433859-2419407.log` |
| direct-drop | `bun test tests/direct-drop.test.ts --timeout=120000` | 0, 6 passed | 2s | `check-direct-drop-1795642435560-2421619.log` |
| direct-seats | `bun test tests/direct-seats.test.ts --timeout=120000` | 0, 4 passed | 3s | `check-direct-seats-1795642438320-2424237.log` |
| direct-active | `bun test tests/direct-active.test.ts --timeout=120000` | 0, 2 passed | <1s | `check-direct-active-1795642438968-2429184.log` |
| direct-timing | `bun test tests/direct-timing.test.ts --timeout=120000` | 0, 3 passed | 1s | `check-direct-timing-1795642439495-2430867.log` |
| direct-runs | `bun test tests/direct-runs.test.ts --timeout=120000` | 0, 3 passed | <1s | `check-direct-runs-1795642439976-2431754.log` |
| direct-phases | `bun test tests/direct-phases.test.ts --timeout=120000` | 0, 6 passed | 2s | `check-direct-phases-1795642441687-2433030.log` |
| direct-land | `bun test tests/direct-land.test.ts --timeout=120000` | 0, 7 passed | 4s | `check-direct-land-1795642445106-2436364.log` |
| direct-cmdref | `bun test tests/command-reference.test.ts tests/cli-help.test.ts --timeout=120000` | 0, 11 passed | 1s | `check-direct-cmdref-1795642446536-2445482.log` |
| direct-docs-links | `bun test tests/docs-links.test.ts --timeout=120000` | 0, 13 passed | <1s | `check-direct-docs-links-1795642446699-2448408.log` |
| direct-retired-guard | Plan's retired-guard grep assertion | 0, no matches | <1s | `check-direct-retired-guard-1795642446818-2448740.log` |

No paid or live external proof was needed. No unverified done criteria from the targeted proof. Full checks and phase outcome recorded below.

### Final verification and handoff

The first full `akrogon verify` on `008dece2` took 126s and failed only the existing ownership invariant: `src/direct.ts` checked for `state.yaml` outside `src/state.ts`. See `check-test-1795642578439-2455058.log`. Follow-up `93082937` centralizes that lookup without changing the test. The targeted repair passed all 11 inventory tests in `check-repair-state-inventory-1795642617633-2928962.log`.

Handed-off base: `4325f9ce566c5d8588f84b7a214422e1dffe62a0`. Handed-off head: `93082937cca22052d4377dace947dce6b4738343`. All nine criterion proof commands, the docs check and the retired-guard check passed again on this head. Their exact logs and wall times are in `check-fix-93082937-proof-index.txt`, using the commands in the table above.

`akrogon verify` on that head returned green (383s): setup, format, typecheck and test all exited 0. Test log: `check-test-1795643012552-2961248.log`. Format: `check-format-1795642633185-2961248.log`. Typecheck: `check-typecheck-1795642636232-2961248.log`. No merge checks were run. No remaining unverified criteria.

`akrogon phase direct-leaf check.review --slot A` returned `moved check.review`. B owns the re-review.

## Check.fix round 2

- Reviewed base `4325f9ce566c5d8588f84b7a214422e1dffe62a0`, reviewed head `93082937cca22052d4377dace947dce6b4738343`. F9 was the only finding handed to A. Both refreshes kept the same base.
- `4ad80f82` adds one real CLI case to `tests/direct-land.test.ts`, with no change to existing assertions. It lands with B working in another hc session, stops B before acknowledgement, then uses `akrogon direct --reviewer` and `akrogon next`. Worktree, temp and slice must stay before the repoint and through the new broadcast turn, then disappear. Red on the unfixed product: `akrogon run-check --name direct-pending-replacement-red -- bun test tests/direct-land.test.ts --timeout=120000 -t 'a pending broadcast keeps cleanup held for a replacement reviewer'` exited 1 in 0.78s. `check-direct-pending-replacement-red-1795643306416-418251.log` shows it failed at the missing worktree while `prompted.B` was still unset. B's independent CLI reproduction also saw temp and slice removed.
- `8ea0ff73` moves the existing pending guard ahead of reviewer lookup in `src/reconcile.ts`; the shared predicate retains all three resources until acknowledgement. After acknowledgement, the recorded-turn and missing-reviewer release rules are unchanged. No docs changes needed. The archived `worker-report-r4.md` records the passing focused replacement case and all 46 reconcile tests.

### Round 2 proof and verification

Handoff base: `4325f9ce566c5d8588f84b7a214422e1dffe62a0`. Handoff head: `8ea0ff7320227e1e45785410787481e71989851e`. All criterion proofs reran on this head using the commands in the round-1 table. Each exited 0.

| Label | Passed | Wall | Log |
| --- | ---: | ---: | --- |
| direct-land | 8 | 3s | `check-direct-land-1795643415164-499528.log` |
| direct-create | 14 | 1s | `check-direct-create-1795643416063-507333.log` |
| direct-drop | 6 | 1s | `check-direct-drop-1795643417663-509294.log` |
| direct-seats | 4 | 3s | `check-direct-seats-1795643420078-511013.log` |
| direct-active | 2 | <1s | `check-direct-active-1795643420566-513706.log` |
| direct-timing | 3 | <1s | `check-direct-timing-1795643420892-514423.log` |
| direct-runs | 3 | 1s | `check-direct-runs-1795643421232-514817.log` |
| direct-phases | 6 | 1s | `check-direct-phases-1795643422321-515439.log` |
| direct-cmdref | 11 | <1s | `check-direct-cmdref-1795643423249-517231.log` |
| direct-docs-links | 13 | <1s | `check-direct-docs-links-1795643423354-518964.log` |
| direct-retired-guard | no matches | <1s | `check-direct-retired-guard-1795643423450-519149.log` |

The land proof includes the replacement case and both existing cross-session cleanup cases after acknowledgement. `akrogon verify` returned green in 320s with receipt `8d7fc3ed-f74e-4bbe-a950-f64f102602b4`. Format, typecheck and test exited 0: `check-format-1795643426752-519321.log`, `check-typecheck-1795643429554-519321.log`, `check-test-1795643743437-519321.log`. No merge checks, paid proofs, or unverified criteria.

The test log records 1,536 full-suite passes and 855 changed-file passes, with zero failures. `akrogon phase direct-leaf check.review --slot A` returned `moved check.review`. The saved phase is `check.review`.
