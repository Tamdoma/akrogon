# Design: fetch-deadline

## Binding decisions, verbatim

# How does dispatch report records it had to skip?

## Question
When one leaf or repo cannot be read or cleaned, how does `akrogon next` continue and what does the operator see?

### Carries
Standing design: never silently ignore errors. Operator Q6/Q12 direction: no new machinery.

## Findings
(both) `nextCommand` has no boundary; a bad state.yaml, missing blocked-by target, deleted registered path or dirty merged worktree stops the run. (B) `activeCount` and `currentRepo` scan every registration, so unreadable occupancy must not count as zero when admitting work. (B) notification can itself fail and some failures have no slug. (A) hooks hide stderr.

## Resolution
Operator 2026-09-11: `3 whatever you want to do`. A chose the simplest: per-repo and per-leaf boundaries around the work, one structured stderr JSON line per skipped scope with repo, path or slug and the error, nonzero aggregate exit, no desktop notification. Merged-worktree cleanup failures are skipped the same way. A repo with any unreadable leaf counts all its leaves as active for capacity. Foreclosed: a per-run herdr notification summary.

# How are the ten reports grouped?

## Question
One epic with six issues, or six standalone issues?

### Carries
shapes.md: a GitHub report has exactly one completion owner; #10 and #14 span four destinations.

## Findings
(both) #10 and #14 need a container owner. (B) an epic delays closure of narrow sources until the epic moves under current code; see source-owner-closure.

## Resolution
Operator 2026-09-11: `1a`. Epic `loop-hardening` owns #10 and #14. Issues `record-sync` (#7), `dispatch-progress` (#6, #9, #11), `recoverable-completion` (#5, #13), `lifecycle-records` (#8), `command-outcomes` (none), `review-protocol` (#12). Foreclosed: standalone issues with #10/#14 attached to whichever finishes last.

Excluded decisions (owned elsewhere or not applicable here): everything except the fetch deadline; seat guards and notifications belong to sibling leaves

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

Owned surfaces: `run` and `retryCommand` in `src/shell.ts` gain an optional `deadlineMs` parameter that kills the child (`child.kill()`) and rejects with a `CommandError` whose stderr notes `deadline <ms>ms exceeded`; `recoverMerge` in `src/phase.ts` passes 60000. Tests may override through the parameter only, not an environment variable or config key. No other call site changes.

Exclusions: error isolation around the sweep belongs to `isolated-dispatch-errors`; a blocked merger guard belongs to `seat-guards`.
