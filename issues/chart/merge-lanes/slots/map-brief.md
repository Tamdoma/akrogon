# Map brief: merge-lanes

You are a consultant to a chart door (slot A, hc terminal t2z2). You map independently. Do not read any other seat's map file in this folder (`map-A.md`, `map-B.md`, `map-C.md`, `map-merged.md`) until you have written yours.

## Task

Write a territory map for the merge-lanes chart: the forks that change the outcome, the questions an experienced practitioner of merge queues and CI would ask, and the pitfalls over the work's lifetime, including what each option could break or invite later, not only now. Ground every claim in an inspected file, log or commit, or in a named outside source (merge-queue practitioners first: for example GitHub merge queue, GitLab merge trains, Bors/Homu, Uber SubmitQueue, Shopify, Chromium CQ), with the source and date read. Stay proportional: this is one akrogon chart.

## Intake

- `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/INTAKE.md` (operator words and agent findings).

## Locks (operator answers, binding)

- `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/forks/signposts.md` `## Taken` and `## Needs`. In short: merge speed first, counted from a leaf's first entry into merge to landed with failed rounds included; hard limits: no leaf adds a new test failure to main, the PC stays inside its limits, token cost does not grow. Each leaf is tested alone (no batching). 5a: a failed merge leaves the line at once, the next leaf starts, the retest or repair happens off the line. 6a: leaves waiting to merge stop counting against the 12-seat `max_active` limit. 2a: two full suites at once only if a measurement (needs row N2, run after the framework suite fix lands) shows neither run more than 1.25x slower and no new test fails; the operator expects it not to pay off.
- The framework suite chart runs first and is handed off: `/home/ivan/Work/infra/tamdoma/framework/issues/chart/suite-regrowth/CHART.md` (Destination, Off route, Pending steps). Do not re-map its scope.
- Carried from suite-regrowth: akrogon's slow alarm closes `recovered` and its rolling 20-run median absorbs each step, and per-script seconds are not in the ledger (`/home/ivan/Work/infra/tamdoma/framework/issues/chart/suite-regrowth/forks/suite-cuts.md` Q5).

## Live surfaces to inspect

- akrogon source at `/home/ivan/Work/infra/akrogon/src/`: `next.ts` (`mergeTurn`, `activeCount`, `reconcileBatch`), `turn.ts` (`mergeQueue`), `batch.ts` (`buildStack`), `land.ts` (`launchLand`), `phase.ts` (`merge_stamp`, `commitMove`), `verify.ts` (`newRedUnits`), `admission.ts` (`lineLock`).
- framework ledgers: `/home/ivan/Work/infra/tamdoma/framework/issues/merge-attempts.jsonl`, `/home/ivan/Work/infra/tamdoma/framework/issues/verify-runs.jsonl`, `/home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl`, and `/home/ivan/Work/infra/tamdoma/framework/issues/config.yaml`.
- Earlier akrogon charts on this subject (decisions there are history; the operator answers above win): `/home/ivan/Work/infra/akrogon/issues/chart/merge-turn/`, `merge-throughput/`, `merge-stacks/`, `verify-waste/`, `base-red/`, `host-run-load/`, `merge-slow-alarm/`, `merge-green-rate/` under `/home/ivan/Work/infra/akrogon/issues/chart/`.
- A related open leaf from another door: `/home/ivan/Work/infra/akrogon/issues/open/watch-consultants/failed-merge-resume/brief.md` (a failed merge leaf moved back to merge must rebase onto the new base). It is not this chart's scope; say whether any fork here depends on it or changes it.
- Live state: `akrogon status` run from `/home/ivan/Work/infra/tamdoma/framework` (read-only).

## What the map must cover

1. Per lock 5a and 6a: what changes in the code, which consumers rely on the state each change alters (file and function), and the forks inside each (for example: what "off the line" means for the red leaf, where its retest runs and how it re-enters, what happens to a red that is main's fault, how flaky reds are told apart, what 6a does to host load and to other repos).
2. What else in the merge line costs time between first entry to merge and landed, from the ledgers, with numbers (rebase, setup, verify, gates, push, idle gaps between holders, seat prompt time), and which of those akrogon can cut without a second concurrent suite and without batching.
3. Lock 2a: what the N2 measurement needs from akrogon to act on its result (what would change if two suites were allowed), and whether any merge-lanes work must wait for it.
4. The split you propose: leaves by independently checkable outcome, with only real dependencies ordering them.
5. Any question you would ask that this brief does not.

## Return

Write your map to the exact path for your slot:

- slot B: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/map-B.md`
- slot C: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/map-C.md`

Compact notes, every claim with its path, line or commit, or outside source and date.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule.

Do not edit any file except your return file. Do not run `akrogon next`, `akrogon phase`, or anything that changes leaf state, pushes, or starts a test suite.

## Report

When the return file is written, run: `hc send t2z2 "done <your slot letter>: <your return path>"`
