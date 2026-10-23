# Review B: docs-use-plan

Base: `40902d8399dc88612da71a678f43038db90e1286`
Reviewed head: `1e5d84f9ae589e645c33e0a0b48bfa5f20e1fc93`
Verdict: `fix`

Initial blind review. Debate is off, so no positions-B or rebuttal-B artifacts are expected. No peer review was read. No code changes or commits were made.

## Fixes

### F1: Stopping a leaf does not make its issue parkable

Location: `docs/use/park-pause-stop.md:21`, “That work is running, so stop or finish it first.”

Real source: an operator following this page to park an issue whose leaf has already been allocated by `akrogon next`. They run the documented `akrogon stop <slug>`, then retry `akrogon park <issue>`.

Trace: `src/stop.ts:82-85` records the stopped mark and stops the slice without clearing the leaf's tab or worktree. `src/park.ts:39-42` considers either recorded field sufficient to refuse parking, independently of the stopped mark, and `src/park.ts:76-81` raises `Issue has a running leaf`. The existing `tests/leaf-stop.test.ts:98` also confirms stop preserves the worktree. The same page correctly says the worktree stays in its Stop section.

Consequence today: following the suggested stop-then-park action leaves the operator with the same refusal. Stopped work is incorrectly presented as eligible for parking. This violates brief criterion 4's requirement that every statement match current source, and the page's criterion 1 subject of explaining park and stop.

Repair: remove stop as a way to satisfy the park restriction. Explain that a stopped leaf still has its tab/worktree records, and use stop or pause to hold already-started work. Keep the existing park behavior unchanged. This needs a docs correction, not a new runtime test.

Evidence, read back with `akrogon log`:

`check review-B-stop-park-trace: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-plan/implementation/check-review-B-stop-park-trace-1792768245625-2927719.log`

That inspection also attempted a nonexistent `src/worktrees.ts` search. It supplies no evidence and is not used above. The cited stop and park source reads completed.

## Page and contract review

| Page | Current sources checked | Result |
|---|---|---|
| a-working-day | `src/next.ts`, `src/AREA.md` land/broadcast contract, chart-issues, broadcast-issue | Intake, handoff, dispatch, seats and landing agree. Optional steps and both alternative routes are covered. |
| plan-work | chart-issues Open, Drain, Take, Handoff and Direct route | Rounds, forks, fog, consultants and handoff agree. |
| quick-fix | chart-issues Direct route | Eligibility, authorization, B review, repair bound, landing and stop choices agree. |
| autopilot | chart-issues Autopilot and handover | Fixed list, A's decisions, operator approvals, lifecycle-only handoff and no execution agree. |
| write-issues-by-hand | `src/state.ts`, `src/turn.ts`, `src/next.ts`, reference files and state pages | State fields, dependency ordering, duplicate slugs and startup agree. |
| report-an-observation | seed-issue, `src/pull.ts` | Unverified intake, destination rules, deduplication and origin-based pull agree. |
| run-work | `src/akrogon.ts`, `src/next.ts`, `src/turn.ts` | Command forms, ordering, capacity, waits and automatic dependent dispatch checked. |
| park-pause-stop | `src/park.ts`, `src/pause.ts`, `src/stop.ts`, `src/stop-run.ts`, `src/leftovers.ts`, unpausePass | F1 blocks. Other control descriptions agree. |
| watch-while-away | watch-issues | Claude cron, cadence, pause gate, bounded recovery, steering and operator-only stop agree. |

All nine pages exist. All six expected SVG references resolve and have nonempty alt text matching their labels. Linked-picture pages point to the concept page. Every page ends in the planned next-step chain. No literal dates were found. Plain Markdown and SVG text were inspected as permitted by the plan. The pictures themselves are unchanged and owned by prerequisite leaves.

No changed AREA.md, moved pages, lesson removals, new dependencies, runtime changes or out-of-scope files. Existing inbound links remain unchanged as planned.

## Test changes and verification

The only `Test-Change:` trailer in base..HEAD is from `d0f4ea1d6d8abb3112e896fe0c8e923b70150132`:

> Test-Change: tests/door-reset.test.ts removed the docs/guide/chart.md read and its 'handover' substring check; fact-ownership Q2 deletes wording-only doc checks, no other expectation changed

`src/test-files.ts` matches that path. The trailer's source is design fact-ownership Q2 and the owned page-map test row. The diff removes only the guide read and its entry in the wording loop, plus updates the comment. Runtime behavior tests and skill/shapes assertions remain unchanged. The report explains the deletion. No added behavior or changed expectation needs a deliberate-break test. No planned checks, filters, runner settings, helpers or fixtures changed after planning.

The planned docs-links, door-reset and retired commands have current green recorded runs: 8, 17 and 15 tests respectively. Recorded configured verification is green: format, 1114 tests and typecheck. I read their logs through `akrogon log`. Running `akrogon verify` during review exited 0 and reused receipt `52c81485-3560-47bc-9f8f-4a5fc2c79cec` for tree `bab1b47bbea11cd0b70cb6049b1da6152a3dfb91`. No suite rerun was needed on the unchanged tree.

Additional evidence, read back with `akrogon log`:

- `check review-B-evidence: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-plan/implementation/check-review-B-evidence-1792768217108-2925638.log`
- `check review-B-page-inspection: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-plan/implementation/check-review-B-page-inspection-1792768254313-2928200.log`

The earlier `review-B-page-checks` invocation supplied Python on stdin through run-check and produced no inspection output. It is not proof. The replacement `review-B-page-inspection` passed Python as an argument and printed all nine pages, next links, dates and picture checks.

## Nits and operator actions

None. F1 is repairable by B without an operator action or design change.

## check.repair 2026-10-23

Read both initial reviews. B F1 is the only Fix. A's N1 and N2 are nonblocking concerns, not repair requests. No operator actions or handoffs to A remain. B holds no reusable Nit requiring a lesson entry.

Repaired F1 in commit `75a42d12ea76b7c0f8959b187440fdfcb859caf2` on base `40902d8399dc88612da71a678f43038db90e1286`. Only `docs/use/park-pause-stop.md:21` changed.

Before: “That work is running, so stop or finish it first.”

After: “Stopping the leaf keeps those records, so parking is still refused. Use stop or pause to hold work that has already started.”

The replacement matches `src/park.ts:39-42,76-81` and `src/stop.ts:82-85`. It distinguishes holding started work from parking an issue. No runtime change or prose test was added. The planned B source review now passes criterion 4 for this statement. The other page statements retain their prior review evidence.

Planned proofs rerun on the committed repair head, with cited logs read back using `akrogon log`:

- `check docs-links: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-plan/implementation/check-docs-links-1792768355612-2932019.log` (8 pass).
- `check retired: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-plan/implementation/check-retired-1792768356181-2932018.log` (15 pass).
- `check repair-B-planned-observations: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-plan/implementation/check-repair-B-planned-observations-1792768355610-2932020.log` (nine pages, optional labels, direct/autopilot boundaries, six image alts, nine next links, no dates, command list and repaired paragraph).

The unchanged door-reset proof retains its earlier green result. No test, fixture, helper, configuration, lockfile or proof command changed. No temporary files or external fixtures were created.

`akrogon verify` completed green on committed head `75a42d12ea76b7c0f8959b187440fdfcb859caf2`: format, 1114 tests (0 failures), and typecheck. No merge checks were run. Verification logs:

- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-plan/implementation/check-format-1792768360874-2933402.log`
- `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-plan/implementation/check-test-1792768516577-2933402.log`
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-plan/implementation/check-typecheck-1792768518828-2933402.log`

F1 is resolved. No open Fixes or Handed to A items remain. Ready for merge.
