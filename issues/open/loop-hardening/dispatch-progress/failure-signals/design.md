# Design: failure-signals

## Binding decisions, verbatim

# What happens to a seat that stays working forever?

## Question
Is a permanently busy agent warned about or automatically failed?

### Carries
`tests/next.test.ts:94-114` expects blocked agents to wait without consuming attempts. No progress timestamp exists in state or herdr.

## Findings
(both) `dispatchSlot` :221 returns on busy with no limit. (B) elapsed time is duration, not a demonstrated stall; a mid-rebase merger could be killed. (A) originally proposed auto-fail with an attempt consumed; withdrawn after B's rebuttal.

## Resolution
Operator 2026-09-11: `4a`, asked "how will I be warned?". Answer given: a herdr desktop notification once the seat has been busy longer than 60 minutes, and a line in `akrogon status` showing busy duration. Ownership is kept; nothing is interrupted. State records when the seat was first seen busy and clears it when the seat is seen idle. The window is a constant, not a config key. Foreclosed: automatic failure or attempt consumption on a timer.

# How is a failed leaf notified once?

## Question
How does the failure notification stop repeating on every sweep?

### Carries
`tests/next.test.ts:148-173` expects notification failure to stay visible.

## Findings
(both) `next.ts:314` notifies on every dispatch of a failed leaf. (B) transition-only notification loses the notice on a crash or herdr failure; state is saved before later effects. (A) originally proposed transition-only; withdrawn.

## Resolution
Operator 2026-09-11: `5a`. State records successful notification delivery for the current failure episode; a sweep notifies only when that record is absent and sets it only after herdr succeeds; the record clears when the leaf leaves `failed`. Foreclosed: notifying inside the transition with no record.

# How are the ten reports grouped?

## Question
One epic with six issues, or six standalone issues?

### Carries
shapes.md: a GitHub report has exactly one completion owner; #10 and #14 span four destinations.

## Findings
(both) #10 and #14 need a container owner. (B) an epic delays closure of narrow sources until the epic moves under current code; see source-owner-closure.

## Resolution
Operator 2026-09-11: `1a`. Epic `loop-hardening` owns #10 and #14. Issues `record-sync` (#7), `dispatch-progress` (#6, #9, #11), `recoverable-completion` (#5, #13), `lifecycle-records` (#8), `command-outcomes` (none), `review-protocol` (#12). Foreclosed: standalone issues with #10/#14 attached to whichever finishes last.

Excluded decisions (owned elsewhere or not applicable here): extra-panes (seat-guards); dispatch-error-report (isolated-dispatch-errors); dead-fields-delete (dead-fields)

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

Owned surfaces: state schema additions in `src/state.ts` (`failed_notified: z.boolean().default(false)`, `busy_since: z.object({ A: z.string().optional(), B: z.string().optional() }).default({})`), the failed branch of `dispatchLeaf` and the busy branch of `dispatchSlot` in `src/next.ts`, `commitMove` in `src/phase.ts` resetting `failed_notified` on any transition, the leaf row in `src/status.ts`, tests. Window constant `STALL_MS = 60 * 60 * 1000` in `src/next.ts`. The stall notification fires once per busy episode: after notifying, keep the stamp and mark it notified by storing it under `busy_since` unchanged and recording the notification time in the same object as `busy_notified: {A?, B?}`; clear both when the seat is seen idle. Notification text names repo, slug, seat and duration.

Exclusions: extra panes and session guards belong to `seat-guards`; error boundaries to `isolated-dispatch-errors`; removal of `priority`/`slot` to `dead-fields`.
