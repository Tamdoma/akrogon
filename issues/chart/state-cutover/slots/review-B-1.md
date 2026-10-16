# Direct review B

Base: `83b92799495c40595a09ca13e08c588f89ae66ca`.
Reviewed head: `033b9b415fa1d53c35e2d526bf0c0120974b408f`.
Worktree: `/home/ivan/.akrogon/worktrees/akrogon/state-cutover-gate`, clean at review end.
Verdict: **fix**.

## F1 — Publishing an incomplete admission inventory can stop a running check before the promised read-back

The changed gate at `src/state-home.ts:70` allows publication while a previously deferred command is still able to admit work. A normal `akrogon run-check` can have deferred its startup migration because another run was live, then reach its own first admission later. Its slice lock can be created after the migrator enumerates locks (`src/state-home.ts:91-97`, `src/admission.ts:43-46`). If its record is written after the last `settled()` check but before destination config publication (`src/state-home.ts:77-84`, `src/admission.ts:160-161`), that record remains outside the copied destination.

This has a concrete consumer consequence, not just a temporarily missing file. Once config is published, `globalHome()` immediately selects the destination (`src/config.ts:197-201`). `liveRuns()` reads only that home's records (`src/admission.ts:40`, `:90-99`). If the running check's leaf fails and its tab closes, the next reconcile can find no admission veto and stop its slice, killing the check (`src/reconcile.ts:173-185`, `:484-494`). Copying the missed record afterward cannot undo that stop.

The attended repair in `forks/writer-gate.md:26` and `CHART.md:16` explicitly leaves arrivals running and repairs records after publication. It therefore does not prevent this reachable effect. The previous source process scan could block the ordinary direct CLI writer; this diff removes that protection without replacing its exclusion. The case also violates the original state-home criterion 4's requirement that running commands' records remain visible across cutover. The present overlap test keeps an admission live throughout migration attempts and does not exercise this new-admission window.

**Required correction:** revise the direct contract so no consumer can switch to the destination until all source writers are excluded and their final writes are included. For the chosen one-time attended route, enforce the command-arrival suspension and complete writer drain before enabling the scan-free migrator, keep that exclusion through copy and verification, then resume commands. If that cannot be enforced, publication needs equivalent writer synchronization in code. A later manual read-back is not the safety mechanism. Prove that admission at the cutover boundary cannot become invisible to reconciliation. This needs the door's contract correction, not an unrequested implementation of O2/O3.

Source trace retained and read back: `check review-b-source: 0 /home/ivan/Work/infra/akrogon/issues/chart/state-cutover/direct/check-review-b-source-1792113799465-2460540.log`. No live race or process-stop probe was performed.

## F2 — The direct landing guard rejects the missing test-change citation

Both commits modify `tests/state-home.test.ts`, but neither has a `Test-Change:` trailer. The actual direct guard calls `requireTestChangeCitations` (`skills/chart-issues/scripts/direct-guards.ts:18`), which rejects this range at `src/phase.ts:419-428`.

Executed that guard function against the supplied base/head through the chart holder. It exits 1 with:

```text
Changed test files need a citation:
Test-Change: tests/state-home.test.ts <source and reason>
```

**Required correction:** add a final commit trailer naming `tests/state-home.test.ts` and citing the selected writer-gate outcome for replacing cwd deferral and adapting the nested-run setup. A later trailer-only commit is supported by the guard. Re-run the citation guard on the resulting head.

Evidence retained and read back: `check review-b-trailers: 1 /home/ivan/Work/infra/akrogon/issues/chart/state-cutover/direct/check-review-b-trailers-1792113839147-2491298.log`. This is caused by the reviewed commits, so no unrelated-failure retry applies.

## Verification and scope

- Reviewed the full two-file diff, chart Taken/CHART, direct plan and report, and the affected admission/reconcile consumers. The supplied chart has no separate brief/design files, so its Taken shape and direct plan provide those contracts.
- Read back `direct/check-test-1792113717691-1822443.log` with `akrogon log`: 957 pass, 0 fail, including the changed state-home cases. The retained run follows the latest test changes. No test filtering, runner changes or disabled tests appear in the diff. Reused that evidence rather than rerunning the suite.
- The report claims typecheck, formatting and fail-before evidence, but supplies no retained paths for those results. I did not independently establish those claims or a full verify receipt. The door still needs its required landing verification after repairs.
- Test-change audit: no trailers in `a2f62ed` or `033b9b4`. The cwd assertion reversal has an explicit source in direct criterion 1. The live-record seed replaces the removed cwd sentinel, is removed before the overlap assertions, and retains nested success propagation. Those test edits have a valid purpose, but the required citation is missing (F2).
- Opened `docs/guide/install.md:62-78`. The documented machine-home location remains correct. No AREA.md or lesson changes are in the diff. No Nits, operator-only access blockers, code edits, commits, lifecycle transitions or host cutover were performed. Only this review and permitted holder logs were written.

Last operation: direct review recorded `fix`; no phase command applies.
Next: chart door repairs F1/F2 and returns the new head for B's re-check.
