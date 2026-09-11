# Design: repo-identity

## Binding decisions, verbatim

# Does state.repo stay enforced?

## Question
Keep or drop the check that a leaf's `repo` equals the registered key?

### Carries
`src/state.ts:58`, `src/status.ts:48`, `src/init.ts:28`.

## Findings
(B) reproduced: a directory move with a stable key and updated path works; only a key rename breaks. (B) the check rejects a leaf copied from another registered repo, so it guards something. (A) proposed dropping; withdrawn. (B) a recorded worktree also breaks after a repo-root or worktree-root change.

## Resolution
Operator 2026-09-11: `7a`. The registration key is persistent identity; the path may change independently. A mismatch reports which key the leaf carries and which is registered instead of `Leaf repo mismatch`. A recorded worktree whose expected path changed reports the two paths and how to relocate. No rename command. Foreclosed: dropping enforcement.

# How are the ten reports grouped?

## Question
One epic with six issues, or six standalone issues?

### Carries
shapes.md: a GitHub report has exactly one completion owner; #10 and #14 span four destinations.

## Findings
(both) #10 and #14 need a container owner. (B) an epic delays closure of narrow sources until the epic moves under current code; see source-owner-closure.

## Resolution
Operator 2026-09-11: `1a`. Epic `loop-hardening` owns #10 and #14. Issues `record-sync` (#7), `dispatch-progress` (#6, #9, #11), `recoverable-completion` (#5, #13), `lifecycle-records` (#8), `command-outcomes` (none), `review-protocol` (#12). Foreclosed: standalone issues with #10/#14 attached to whichever finishes last.

Excluded decisions (owned elsewhere or not applicable here): tree-preflight (tree-preflight); pull-origin README text (command-reference)

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

Owned surfaces: the mismatch throw in `src/state.ts` `allLeaves`, the literal parse in `src/status.ts` `scanRepo` (replace with an explicit comparison and message), `ensureWorktree` mismatch message in `src/next.ts`, one README paragraph, tests. No rename or relocation command.

Exclusions: depth validation belongs to `tree-preflight`; README verb table and intake routing belong to `command-reference`.
