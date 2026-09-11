# Design: repo-cap

## Binding decisions, verbatim

### Operator locks from intake
Global `max_active` stays the machine ceiling. The repo key is optional with no default. No new command, file, state or scheduler. Registration order of the sweep is unchanged.

### What happens when repo caps add up to more than the global cap?
Operator: `1a`, 2026-09-11. Silent. Reason: the global cap is the ceiling by definition and repo shares summing past it is a valid setup, so nothing is built. Foreclosed: a note from `akrogon config` or `next` when the sum exceeds the global.

### How does an unreadable repo inventory count against its own cap?
Operator: `2a`, 2026-09-11. Same rule as the machine count: readable leaves plus unreadable count charge the repo's own cap. Reason: one expression filtered by repo, no new branch. Foreclosed: marking an unreadable repo full.

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

## Current interpretation

Carry the creation-locked block above verbatim into each leaf design, together with this interpretation. Its chunk terminology refers to the leaf's owned work. User-visible flows retain an end-to-end command and artifact; verification uses the checker's verdict and blocking `checks` commands. Known human-only prerequisites are named and completed before opening a leaf, with completion recorded at the door. The historical dispatch sentence does not authorize opening a leaf with an unfinished human prerequisite or introduce a hold state. An unforeseen physical blocker ends the attempt and informs the operator. Credential access alone does not create a human-only prerequisite, and `hand_built` remains a separate explicit operator choice.

Applied here: the user-visible flow is `akrogon next --all` and its end-to-end command is the existing `tests/next.test.ts` dispatch fixture with the fake herdr, which leaves the test output as artifact. Auth, authorization, backend mutation and secret lines do not apply. Guide pages change text only; the existing Playwright specs cover their shell.

## Leaf architecture

Owned surfaces:
- `src/config.ts`: `repoSchema` gains `max_active: z.number().int().positive().optional()`.
- `src/next.ts`: `activeCount` returns the per-repo counts alongside the total, or a sibling helper computes the count for one repo with the same live-tab filter; `allocate` refuses when the total reaches the global cap or the leaf's repo has a cap and its count reaches it. The check runs only when no matching tab exists, as today.
- `src/config.ts` `effectiveConfig`: prints the repo key when present.
- `tests/config.test.ts`, `tests/next.test.ts`: new cases per done-criteria.
- Six guide pages named in the brief.

Literal rule:

```text
open new tab  <=>  no matching tab
               and machineActive < global.max_active
               and (repo.max_active undefined or repoActive < repo.max_active)
```

`repoActive` uses the same filter as the machine count restricted to that repo: non-merged leaves whose tab or worktree has a live pane.

Exclusions:
- No change to sweep order, `park`, `status` columns or the plugin hooks.
- No default for the repo key. `akrogon init` does not propose it; init-issues is untouched.
- No warning or error when repo caps exceed the global cap.

Dependencies: none. Read first: `src/next.ts` lines 255 to 300 and 524 to 542, `src/config.ts` lines 9 to 50, `tests/next.test.ts` lines 360 to 480 and 770 to 860.
