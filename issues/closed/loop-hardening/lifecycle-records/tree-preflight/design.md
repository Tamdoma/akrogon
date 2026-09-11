# Design: tree-preflight

## Binding decisions, verbatim

# Are tree depth and closed owner names validated early?

## Question
Where do invalid trees and closed-name reuse fail?

### Carries
`src/state.ts:45-50,96-103`, `src/phase.ts:62-72`, shapes.md handoff preflight.

## Findings
(both) a `state.yaml` directly under `issues/open` self-deadlocks on `issues/.lock`; deeper trees lock and complete the wrong container; closed-name reuse throws at completion. (both) parked leaves report only `Missing leaf`.

## Resolution
Operator 2026-09-11: `10a`. Leaf discovery rejects a leaf directly under open/closed and any depth beyond epic/issue/leaf with a message naming the path. Handoff preflight in shapes.md refuses an owner whose name exists under `issues/closed`. `Missing leaf` names parked when the slug exists under `issues/parked`. Existing records must all pass. Foreclosed: arbitrary nesting.

# How are the ten reports grouped?

## Question
One epic with six issues, or six standalone issues?

### Carries
shapes.md: a GitHub report has exactly one completion owner; #10 and #14 span four destinations.

## Findings
(both) #10 and #14 need a container owner. (B) an epic delays closure of narrow sources until the epic moves under current code; see source-owner-closure.

## Resolution
Operator 2026-09-11: `1a`. Epic `loop-hardening` owns #10 and #14. Issues `record-sync` (#7), `dispatch-progress` (#6, #9, #11), `recoverable-completion` (#5, #13), `lifecycle-records` (#8), `command-outcomes` (none), `review-protocol` (#12). Foreclosed: standalone issues with #10/#14 attached to whichever finishes last.

Excluded decisions (owned elsewhere or not applicable here): repo-field (repo-identity); dead-fields-delete (dead-fields)

### Standing creation-locked design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any chunk touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first chunk needing it. Non-browser flows use a real request or invocation. The gate judges the exit code and the completion half records the artifact path as evidence.
- Chunk ownership defaults to agent-owned. Only a step physically requiring the operator makes its chunk operator-owned, which parks at dispatch before any seat spawns. Credential access alone never qualifies.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

### Current interpretation

Chunk terminology above refers to this leaf's owned work. User-visible flows retain an end-to-end command and artifact; verification uses the checker's verdict and blocking `checks` commands (`bun run format`, `bun test`, `bun run typecheck`). Known human-only prerequisites are named and completed before opening a leaf; none exists for this leaf. An unforeseen physical blocker ends the attempt and informs the operator. Credential access alone does not create a human-only prerequisite, and `hand_built` remains a separate explicit operator choice.

## Leaf architecture

Owned surfaces: `leavesUnder`/`allLeaves`/`findLeaf` in `src/state.ts` (depth is computed from the `issues/open` or `issues/closed` root: a leaf must be 2 or 3 levels below), the parked hint using `issueFolders` from `src/park.ts`, `skills/chart-issues/assets/shapes.md` and `skills/chart-issues/SKILL.md` audit list, tests.

Exclusions: repo key mismatch messages belong to `repo-identity`; schema field removal to `dead-fields`; completion behaviour to `resumable-source-closure`.
