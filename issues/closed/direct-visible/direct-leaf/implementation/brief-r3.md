# Repair brief R3 — direct timing cohort (F6)

## 1. Goal

Repair review-B F6 under plan C-new-D21, criterion 5 and design 6.

## 2. Numbered acceptance criteria

1. A direct leaf with no delivered planning prompt joins the timing cohort at its creation timestamp. Apply the existing cohort cutoff, size, order and diff limit unchanged.
2. The direct visit reports no prompt or seat_done gaps, but retains run pairing. Lifecycle candidates still join via delivered planning prompts.

## 3. Read-first list

Read /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/{design.md,plan.md,review-B.md}, src/timing-report.ts (cohortReport, directSlugs), src/timing.ts (leafStart), tests/{direct-timing,timing-report}.test.ts, and /home/ivan/.pi/agent/skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces

Owned path: src/timing-report.ts only. Direct times already come from leafStart in src/timing.ts. Use the existing area inventory rather than a new scan of state.yaml. A committed the CLI reproduction and captured the red. No prerequisites or shared resources. Creation commit: a7127a22559407dda29958e65b6266df9d5936e1.

## 5. Do-not, reasons and exceptions

Do not change tests, lifecycle cohort semantics or unrelated flow output. Report fixture/contract mismatches with evidence. No stash (shared), process-pattern kills (shared) or full verify (A owns it). Commit WIP if needed and squash to one returned commit based on the creation SHA.

## 6. Ordered steps

Read section 3, add direct creation candidates to cohort membership using the same inventory for the direct flag, and run section 7. Return one commit plus report.

## 7. Commands

- `akrogon run-check --name r3-timing -- bun test tests/direct-timing.test.ts tests/timing-report.test.ts --timeout=120000`
- `bun run typecheck`
- `bunx prettier --check src/timing-report.ts`

## 8. Done-when, evidence and report

Return commit and worker-report.md at /home/ivan/.akrogon/worktrees/akrogon/direct-leaf-u3/worker-report.md, with the kept check line and these fields.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
