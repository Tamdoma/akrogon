# Design: dead-fields

## Binding decisions, verbatim

# What happens to the unread priority and slot fields?

## Question
Keep, or delete with migration?

### Carries
`src/state.ts:15,28`, strictObject schema, shapes.md state template, chart door writes `priority`.

## Findings
(both) no reader in scheduling. (B) status detail serialises them; removal under strictObject rejects old files without a migration.

## Resolution
Operator 2026-09-11: "Just make sure that in the future if they're not used or consumed anywhere, delete them. We want to keep everything simple and moving Without adding new machinery and potential failure points." Delete `priority` and `slot` from the schema, from `dispatchSlot`, from shapes.md and the chart door handoff batch, and strip them from every existing state file under open, closed and parked in the same leaf. Foreclosed: keeping them as metadata; giving priority scheduling meaning.

# How are the ten reports grouped?

## Question
One epic with six issues, or six standalone issues?

### Carries
shapes.md: a GitHub report has exactly one completion owner; #10 and #14 span four destinations.

## Findings
(both) #10 and #14 need a container owner. (B) an epic delays closure of narrow sources until the epic moves under current code; see source-owner-closure.

## Resolution
Operator 2026-09-11: `1a`. Epic `loop-hardening` owns #10 and #14. Issues `record-sync` (#7), `dispatch-progress` (#6, #9, #11), `recoverable-completion` (#5, #13), `lifecycle-records` (#8), `command-outcomes` (none), `review-protocol` (#12). Foreclosed: standalone issues with #10/#14 attached to whichever finishes last.

Excluded decisions (owned elsewhere or not applicable here): stall-signal and failed-notice-once schema additions (failure-signals); tree-preflight

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

Owned surfaces: `stateSchema` and `readState` in `src/state.ts` (strip `priority` and `slot` from the parsed YAML object before `stateSchema.parse`, nothing else), the `slot` write in `dispatchSlot` (`src/next.ts:235`), any `priority`/`slot` mention in `src/status.ts`, `skills/chart-issues/assets/shapes.md`, `skills/chart-issues/SKILL.md`, tests and fixtures. No bulk edit of `issues/` files.

Exclusions: new fields `failed_notified` and `busy_since` belong to `failure-signals`; depth checks to `tree-preflight`; the session-guard edit at `src/next.ts:230` belongs to `seat-guards`.
