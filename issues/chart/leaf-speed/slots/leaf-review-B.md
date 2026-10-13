Draft references below are relative to the corresponding `drafts/<repo>/leaf-speed/` directory named in the brief.

## timing-events

- F1. The expected-event inventory has no delivery contract. `design.md:9` promises it, but `brief.md:5-10` defines only best-effort events and `design.md:21` exports only `readTimings`. Losing a prompt or `check_start` append cannot be detected from that same ledger. Current state overwrites prompt timestamps and clears completion on moves (`src/next.ts:548`, `src/phase.ts:152`), and the first reviewer's completion has no move (`src/phase.ts:406-410`). Specify an independent durable inventory or detectable loss signal, its owner and reader interface, including retries. Otherwise timing-readout cannot fulfil its missing-coverage criterion.

## timing-readout

- F2. `brief.md:13` requires waiting, prompted time and check time to add up to elapsed time, while `brief.md:5` places check time inside prompted time. These overlap. For a ten-minute prompted interval containing six minutes of checks, that sum reports sixteen minutes. Define exclusive components or display checks as a subset without adding them.
- F3. `brief.md:6,15` requires failed/stuck leaves in a cohort eligible only after a first implement-exit diff exists. A leaf stuck in plan or implement has no qualifying diff. The 24-hour rule does not solve eligibility. Set a binding rule for these leaves and missing timing coverage before implementation, so failures cannot disappear from the denominator.
- F4. `brief.md:13` derives every phase visit's elapsed time from `log.jsonl`, but initial planning has no entry transition. `src/log.ts:32-63` records moves only, and timing-events specifies no initial phase-opening event. Define the initial visit's start and how unavailable time is reported, with a matching producer responsibility.

## serial-plan-solo

- F5. `design.md:25` proposes checks plus text review only, and `brief.md:10-11` proves document consistency rather than the seat's changed delegation behavior. This edits agent instructions. `standing-design.md:14` requires a changed prompt to run one real call through its consumer and checks, naming the property proved. Include that proof and its recording, using existing machinery or an explicit prerequisite.

## test-changed-shared-files

- F6. `brief.md:6,15-16` promises exact reachable-file detection without defining unresolved references. Real consumers read computed paths (`.claude/skills/_shared/scripts/batch-lane.ts:284`) and recursively scan directories (`.claude/workflow/scripts/contracts-verify.ts:721-735`). An import graph alone cannot prove a path unread. Bind treatment of computed reads, directory scans and subprocesses, retaining conservative selection where reachability cannot be established.
- F7. `brief.md:7,17` includes any one-script manifest change, but deletion leaves no current script to select. Today's selector derives its universe solely from the current manifest (`run-test-changed.ts:96`). Specify old/new graph handling and surviving consumer coverage for removed or renamed scripts, or narrow this criterion to edits of retained entries.

## flaky-test-fixes and flaky-tests 4a

- F8. `brief.md:17` makes “20 consecutive runs” the acceptance result. `shapes.md:171,289` expressly forbids done-criteria naming a test count. State the corrected behavior as acceptance and place repetition in verification. Also add this slow-run leaf's repair scope and final-commit proof rule, required by `shapes.md:291`.
- F9. `brief.md:7` and fork `flaky-tests.md:12,17` omit that the three Wrangler timeouts occurred on pre-fix bases. C's `slots/final-check-C.md` explicitly states this. Commit `a9253998a` already gave that exact test a 120-second deadline, still present at `dev-cf-workers-deploy/test/deploy-core.test.ts:1394`. Record that existing repair and require evidence of a remaining current-head cause before requesting another fix. Historical red runs alone do not establish an outstanding defect.
