# Slot B: Release fork refresh

Inspected 2026-10-16 at main/origin/main `ab3c889d72e82189a55164bab0a26ac7b1335ca9`. Read only Question/Carries in release.md, not Findings. No tests, cleanup or live process operations performed.

## Current delivery

F1. “Today's merged-only deletion” is obsolete. For every discovered leaf, scratch can already be removed when its tab and any pane inside are gone and no run-root keep reason remains. Phase controls reporting, not that deletion (`src/reconcile.ts:694–750`). Discovery includes open and closed leaves, not parked (`src/next.ts:164–167`). Dead-owner run roots are also removed independently of phase (`src/reconcile.ts:723–736`).
F2. Merged and failed leaves already get their loaded slice stopped before scratch sweeping, with live-tab, unavailable-inventory, live-admission and own-slice vetoes (`src/reconcile.ts:151–176,420–440`). The stop rechecks live admissions under the admission lock. This is delivered by `c200c57` and the admission-race correction `8b8515f`.
F3. “Stop, confirm exit, then delete” is not yet an end-to-end invariant. A failed or skipped slice stop adds a keep entry before scratch captures `keptBefore`; scratch can still remove the directory because its own loop adds no new keep entry (`src/reconcile.ts:437–439,707,746–748`). Scratch deletion checks neither slice emptiness nor the same-user cwd/fd scan. A vanished tab on an unfinished leaf does not trigger the finished-slice stop (`:176,429`), despite allowing scratch deletion.
F4. Failure still retains the tab: phase failure saves state, notifies, renames the tab, and records the transition (`src/phase.ts:82–108,155–185`); `next` does not auto-close failed tabs (`src/next.ts:777–787`). Merged holder closure runs after B's end signal (`:1497–1506`). Thus Q2 remains a real policy choice.
F5. Parking is not a running-leaf shutdown operation. It rejects leaves with a recorded tab or worktree, then moves issue directories without process/temp cleanup (`src/park.ts:23–26,55–73`). Parked ownership is absent from both normal discovery and host `allLeaves` (`src/next.ts:164`, `src/state.ts:153–156`). An unmatched host slice containing processes is kept (`src/reconcile.ts:813–829`).

Related delivery, distinguished from contracts still waiting:

| Leaf | State/evidence at inspected main | Effect on this fork |
| --- | --- | --- |
| finished-leaf-processes | `issues/open/worktree-cleanup/finished-leaf-processes/state.yaml:2` merged; `src/reconcile.ts:420–440` | Finished slices stop after tabs disappear, with the vetoes above. |
| scratch-copy-removal | `scratch-copy-removal/state.yaml:2` merged; commit `3a3464a`, `src/reconcile.ts:639–676` | Owns registered verify/build/worker copies and process vetoes, not the whole leaf-temp release protocol. |
| kept-status | `kept-status/state.yaml:2` merged | Its original plain-status surface was superseded by `fb60ccd`; `src/leftovers.ts:11–23,50–55` now displays actionable kept paths and hides ordinary in-use reasons. |
| test-isolation | `test-isolation/state.yaml:2` merged; commit `33024f8` | Removes suite contamination, not arbitrary leaf release behavior. Its criteria are `test-isolation/brief.md:10–11`. |
| stacked-member-close | `stacked-member-close/state.yaml:2` merged; commit `2fefdd6`, `src/next.ts:1001` | Merged members' tabs close in the merge pass; holder keeps its separate end-of-turn closure. |
| store-sweep | `store-sweep/state.yaml:2` is **merge**, not merged | Its promised live-process veto, leaf-temp/slice checks and expanded sweep are not delivered on this main. See `store-sweep/brief.md:12–17`. Coordinate this work rather than duplicate its deletion machinery. |

The abbreviated state/brief paths in the table are under `issues/open/worktree-cleanup/`.

## Leaf-path lock

F6. The recorded lock does not match main. `leaf-path.md:21` specifies `/tmp/akrogon-<uid>/<hash12>`. Current `leafTemp` derives `/var/tmp/akr-<uid>/<repo-hash4>/<leaf-hash8>`, with an absolute `AKROGON_LEAF_TEMP_ROOT` override (`src/config.ts:263–272`); directory ownership, no symlinks and mode 0700 remain enforced (`:275–300`).
F7. History explains the replacement: `3ae682f` moved scratch under `~/.akrogon/scratch/<repo>` as part of the run-check wrapper; `2c3a0af` (2026-10-11) replaced that with short `/tmp/akr-<uid>/<4>/<8>` paths to accommodate Chrome sockets and sweep ended checks; `c698170` (2026-10-14) moved that layout to `/var/tmp`. Its commit message records tmpfs files counting against slice memory and holding admission closed overnight. The same commit removed new-tab scratch wiping because detached checks still needed their captures, and put captures inside their owned run roots. Current allocation merely ensures the directory (`src/next.ts:461–463`). These are recorded reasons, not a fresh performance measurement.
F8. The current test pins the new path and override (`tests/config.test.ts:845–855`); it does not establish the old lock's full nested browser-socket proof for a 10-digit uid. Do not silently restore `/tmp` or claim that old proof transfers. Refresh the root/path decision against both the October 2 browser-hang report and October 14 tmpfs-memory incident before handoff.

## Q1 — Release behavior

1. Pick, reason, cost: Choose explicit release cleanup for every supported outcome: save required evidence, stop owned execution, establish exit, then remove disposable scratch. Extend the existing reconcile path and store-sweep guards instead of adding another remover. Cost: uncertain ownership, active admitted work or failed shutdown delays cleanup and must remain visible; a disappeared tab is not proof of process exit.
2. Rejected option: “Keep merged-only deletion” is neither today's behavior nor sufficient for failed/parked/tab-loss residue. Also reject treating cwd/fd matches as permission to kill arbitrary same-user processes: those are reasons to retain an item, not proof of process ownership.
3. Evidence: `operator`, `INTAKE.md:9`, read 2026-10-16, asks for memory release without broken tests. `better-than-training`, current code in F1–F5 and commits in F7, read 2026-10-16, shows broad deletion already exists while release ordering remains incomplete. `store-sweep/brief.md:14–17` already assigns retention for running leaves and process users.
4. Pitfalls and what removes them: Do not stop the command's own slice before its logs/finalization finish; use the external end-of-turn/reconcile path, retaining the existing own-slice veto. Couple exit verification and deletion eligibility, including stop failure, escaped processes and racing admissions. Keep unpublished evidence: `run-check` intentionally leaves `refusal.json` and captures when publication is refused (`src/run-check.ts:239–244,259–260`), and reconcile preserves it (`src/reconcile.ts:710–721`). Such a directory cannot become disposable merely because its leaf closed.
5. Missing question: Does “tab vanished” end the attempt or request recreation? Today tab_closed reconciles then dispatches again (`src/next.ts:1445–1470`). Define release before that recreation, including whether an independently admitted check is allowed to finish. Also define parked/closed ownership and the retry trigger when release is deferred; paused repos currently skip automatic tab-close cleanup (`:1453`).

## Q2 — Failed-leaf timing

1. Pick, reason, cost: Automatically close the failed leaf's tab after durable failure evidence and the final seat turn finish, then run the same external release path. Do not kill the failure-reporting command from inside `phase failed`. Cost: the operator loses an idle interactive failure tab and diagnoses from retained reports/transcripts or resumes the leaf.
2. Rejected option: Keeping the tab indefinitely leaves its slice protected and temp in use until a human acts (`src/reconcile.ts:159–163,744–745`), contrary to the requested automatic release. Immediate closure merely after saving `state.yaml` is also too early: notification, log and timing work still follows (`src/phase.ts:155–185`).
3. Evidence: `operator`, `INTAKE.md:9`, read 2026-10-16, favors release promptly; `better-than-training`, `src/phase.ts:82–108,155–185` and `src/next.ts:1497–1506`, read 2026-10-16, provides the existing failed-tab behavior and merged end-of-turn closure pattern. Q2's automatic failed closure is not delivered by worktree-cleanup.
4. Pitfalls and what removes them: Name the durable evidence and the event proving the failing seat has finished before closing it. Preserve evidence when publication fails rather than declaring release successful. “Worktree kept” also needs a decision: current reconcile removes a clean, removable failed leaf worktree after its tab disappears (`src/reconcile.ts:554–564`). Automatic tab closure would make that happen sooner; keeping every failed checkout changes that existing policy.
5. Missing question: Should failure retain every worktree, or preserve today's dirty/unreachable guards and branch while removing clean checkouts? If an admitted run survives failure, must release await it or explicitly cancel it? The current live-admission veto must not be silently overturned by the phrase “right after evidence is saved.”

## Remaining material decisions

Q3. Root/path: is the October 2 `/tmp` lock still intended after `c698170`, and what current browser/runtime evidence warrants reversing the disk-backed default? This is a reopened decision, not a coding detail.
Q4. Release boundary: define terminal state, tab loss, park, operator stop and pause separately; none universally implies the others in current code (`src/stop.ts:56–75`, `src/park.ts:55–73`, `src/reconcile.ts:176`).
Q5. Ownership and evidence: distinguish leaf-owned processes that may be stopped, escaped users that veto deletion, live admitted checks, and refused-publication artifacts. Specify who completes each deferred release and what evidence survives.
Q6. Coordination: store-sweep is still pending. Reuse its agreed guards once delivered, with a dependency only where this work consumes that implementation. Keep framework's child-process/socket fixes and non-akrogon `/tmp` residue outside this chart, as `CHART.md:17–19` requires.
