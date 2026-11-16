# Fork notes, slot C: failed-refusal

## Q1. Which runs are refused while the leaf is failed

Pick: every leaf-scoped and worker-scoped run through `checkedRun` (src/run-check.ts) while the leaf phase is `failed`, whatever the name or argv. Only `failed`. Checkout and holder scope (slug `checkout`, no phase in `LeafTarget`) are untouched, and that is the operator path that stays open. This matches the lesson guard text carried by the fork word for word in scope.
Cost: free read only checks under run-check are refused too. The plain command without run-check still runs, and the refusal text in Q2 says so.

Rejected: paid runs only, because no code anywhere in src/run-check.ts or src/admission.ts knows what paid means, and a name list per repo would be invented config that drifts from real cost. More phases than failed, because `merged` leaves already refuse through `ownerRefusal` as owner closed, `merge` phase verify must keep running, and a parked leaf is a place the operator may legitimately run checks. Named checks via the repo `full` list, because `full` is an admission queue class, not a cost class.

Evidence: [code, src/run-check.ts `leafFields` and `checkedRun`, read 2026-11-16] phase is copied into the timing record and never gated. [code, src/admission.ts `withAdmission`, 2026-11-16] admission registers runs and holds no phase or grant concept. [record, learnings/history/2026-11-15-background-wait-fails-leaf.md] the stated guard is a leaf-scoped launch refused at phase failed, with about $2.38 total spent in the case.

Pitfalls: a guard keyed on one phase invites later phase additions one at a time. Naming only `failed` now, with the parked and merged reasons recorded here, keeps the next addition a argued change instead of a drift.

## Q2. Where and when the phase is read

Pick: inside `checkedRun`, twice, both times gated on the `LeafTarget` carrying a phase (leaf and worker scopes set it in `leafFields`, checkout scope does not).
Early, right after the check record object is built and before `withAdmission`: when the passed phase is `failed`, append the timing row below and throw `PublishRefusedError` with the refusal text. This keeps a doomed run out of the admission `full` queue.
Late, inside the `withAdmission` callback directly after the existing fenced `ownerRefusal` call and before any spawn: re-read state with `readState(resolve(target, '..'))`, since target is the leaf implementation folder for both leaf and worker scope, and when the fresh phase is `failed` append the timing row and go through the existing `refusePublish`, which writes refusal.json and throws with the log path.
Refusal text, both points: `Refusing run-check <name> for leaf <slug>: phase is failed (<failure reason when present>). Recover with akrogon phase <slug> <failure.phase> before running checks, or run the plain command without run-check.` When no failure record exists the parenthetical names only the phase.
Durable record: one new timing kind `check_refused` in src/timing.ts `timingEventSchema`, a strictObject with the check_start fields (slug, run, name, scope, phase, optional unit and attempt) and no wait_ms. Both refusal points append it through `appendTiming(repo, {kind: 'check_refused', ...check})`.
Cost: the timing schema grows one kind, and the state file is read one extra time per run at the late point.

Rejected: read once in `leafTarget`, because a `full` run can wait in `awaitLineTurn` inside admission while the leaf fails, and the reported harm is exactly launches after the move. Read inside `withAdmission` in src/admission.ts, because admission is shared concurrency machinery that reads no leaf state today. Read in the `runCheck` CLI wrapper only, because verify reaches `checkedRun` without it and Q4 picks no carve-out.

Evidence: [code, src/run-check.ts `checkedRun`, 2026-11-16] the fenced `ownerRefusal(target, repo, true)` call already sits at the exact late point inside the admission callback, and `refusePublish` beside it writes refusal.json. [code, src/run-check.ts `leafTarget`, 2026-11-16] leaf and worker targets resolve to the leaf implementation folder and checkout scope sets no phase. [code, src/timing.ts `readTimings`, 2026-11-16] timings strict parse every line and degrade to an empty list with a warning on an unknown kind.

Pitfalls: an older installed binary reading a timings file that holds `check_refused` loses all timings for that repo to the empty fallback. Writers and readers ship in the same release and install swaps the release link at once, which bounds this to dev checkout use during the leaf itself. The late `readState` can throw when the folder moved mid run, which is why it sits after the fenced owner check that already refuses owner gone and owner closing.

## Q3. A run already started when the leaf moves to failed

Pick: it runs to completion. The Q2 late read gates only the spawn. The fail move in src/phase.ts gains no run stopping code, and nothing in `checkedRun` re-checks phase at publish time.
Cost: a long paid run keeps spending after the leaf fails. The spend is bounded by that one run, and its capture stays available to the recovery pass.

Rejected: stop the leaf runs at the fail move through admission or run unit stops, because the phase move code would gain a run inventory it has no reason to hold, and a capture one second from done is paid for twice after recovery. Let it run but refuse its capture at publish, because that pays the full cost and then discards the result, the worst of both.

Evidence: [record, framework issues/log.jsonl, 2026-11-15] the reported leaf returned to implement 12 minutes after failing and merged the same night, so in-flight results had a live consumer. [code, src/phase.ts phase move, 2026-11-16] the move writes state and notices only, with no run handling to extend.

Pitfalls: nested runs complicate the boundary. A check script that itself calls run-check under the inherited `AKROGON_RUN` token after the move hits the Q2 refusal as a fresh launch, and its parent run then fails. That is the wanted spend stop, and it should be stated in the leaf so a parent failure after a fail move is not read as a product defect.

## Q4. Verify through checkedRun and any carve-out

Pick: no carve-out. `akrogon verify` in a failed leaf worktree refuses with the same Q2 text. No lifecycle flow needs it there, per the evidence below. Operator diagnosis takes the recovery phase move first or runs plain commands.
Cost: one manual habit changes. Verifying a failed leaf to see how red it is now needs the recovery move first, which also resets attempts and restarts dispatch, so it is not a read only act anymore.

Rejected: a verify flag on `LeafTarget` that skips the guard, because it makes one caller a permanent exception and verify runs repo check commands which in some repos are the paid captures themselves. A carve-out by run name such as setup, because names are free text from repo config.

Evidence: [code, src/verify.ts `verify`, 2026-11-16] scope comes from `caller.phase`, with merge or no phase taking merge scope and anything else leaf scope, so a failed leaf would run leaf scope today. [process text, skills/implement-issue/SKILL.md implement and check.fix sections, 2026-11-16] verify runs at implement end and after repairs, never in failed. [process text, skills/check-issue/SKILL.md, 2026-11-16] the check.fix move and the failed stop run no verify, and only the merge move verifies the holder. [process text, skills/merge-issue/SKILL.md, 2026-11-16] merge verify runs in merge phase against an attempt.

Pitfalls: a flow outside the skills, a hand run merge recovery script for example, could still call verify on a failed holder. The refusal text names the recovery command, so the failure is loud and self explaining rather than silent, which is the signpost 5a shape.

## Questions the fork does not ask

N1. The seat that caused the fail can still edit the worktree and spend model time after the move, since run-check is only one launch path. Does anything in this chart tell that seat to stop, or is the Q2 refusal text in its next tool result the agreed signal?

N2. Should refusal also apply when phase is `failed` but the caller is the recovery actor itself, for example the watch skill after it runs the recovery phase move in the same fire? The phase move lands first under the current watch rule, so the pick holds, but the fork never names the recovery actor as a caller.

N3. Worker worktrees resolve to the owner leaf in `leafTarget`, so a worker of a healthy leaf whose unit worktree name collides with a failed leaf slug prefix could read the wrong state. Is the existing slug derivation from the worktree basename trusted enough for a refusal, or does refusal need the state read to confirm the slug matches?
