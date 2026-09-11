# Design: seat-guards

## Binding decisions, verbatim

# May a leaf tab hold an extra operator pane?

## Question
What does allocate do with a third pane?

### Carries
`src/next.ts:170-171`.

## Findings
(both) three panes throw `Expected one or two panes`. Operator asked why anyone would open one; answer: a shell to poke around.

## Resolution
Operator 2026-09-11: `11a`. Extra panes are ignored; the recorded A and B seats stay authoritative; a vanished seat is replaced by a new split, never by adopting an unrecorded pane. Foreclosed: keeping the two-pane rule.

# How are the ten reports grouped?

## Question
One epic with six issues, or six standalone issues?

### Carries
shapes.md: a GitHub report has exactly one completion owner; #10 and #14 span four destinations.

## Findings
(both) #10 and #14 need a container owner. (B) an epic delays closure of narrow sources until the epic moves under current code; see source-owner-closure.

## Resolution
Operator 2026-09-11: `1a`. Epic `loop-hardening` owns #10 and #14. Issues `record-sync` (#7), `dispatch-progress` (#6, #9, #11), `recoverable-completion` (#5, #13), `lifecycle-records` (#8), `command-outcomes` (none), `review-protocol` (#12). Foreclosed: standalone issues with #10/#14 attached to whichever finishes last.

Excluded decisions (owned elsewhere or not applicable here): stall-signal, failed-notice-once (failure-signals); dispatch-error-report (isolated-dispatch-errors); dead-fields-delete (dead-fields)

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

Owned surfaces: `dispatchSlot`, `dispatchLeaf` merge check, `allocate` in `src/next.ts`; `tests/next.test.ts`. Session check becomes: skip only when `state.prompted[slot] !== undefined && pane.agent_session?.value === state.prompted[slot]`. Merge check uses `busy(pane)`. `allocate` selects seats from recorded `state.pane` ids among live members; when both are recorded and live, extra members are ignored; a missing recorded seat is replaced by a new `pane split` from the surviving recorded seat; only a tab with zero members throws. Start timeout 30000, prompt wait unchanged.

Exclusions: stall detection and failure notification belong to `failure-signals`; error boundaries to `isolated-dispatch-errors`; the `slot` field write removal belongs to `dead-fields` (leave the line untouched here to avoid a conflicting edit).
