# Are tree depth and closed owner names validated early?

## Question
Where do invalid trees and closed-name reuse fail?

### Carries
`src/state.ts:45-50,96-103`, `src/phase.ts:62-72`, shapes.md handoff preflight.

## Findings
(both) a `state.yaml` directly under `issues/open` self-deadlocks on `issues/.lock`; deeper trees lock and complete the wrong container; closed-name reuse throws at completion. (both) parked leaves report only `Missing leaf`.

## Resolution
Operator 2026-09-11: `10a`. Leaf discovery rejects a leaf directly under open/closed and any depth beyond epic/issue/leaf with a message naming the path. Handoff preflight in shapes.md refuses an owner whose name exists under `issues/closed`. `Missing leaf` names parked when the slug exists under `issues/parked`. Existing records must all pass. Foreclosed: arbitrary nesting.
