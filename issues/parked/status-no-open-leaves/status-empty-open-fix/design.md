# Design: status-empty-open-fix

## Binding decisions, verbatim

# What does status print for a repo with no open leaves?

## Question
Confirm: missing `issues/open` reads as zero leaves, and a zero-leaf repo prints its name followed by an indented `no open leaves` line. Exit code stays 0.

### Carries
None.

## Findings
- scanRepo in src/status.ts throws on a missing folder and readLog already tolerates a missing file, so the fix is symmetrical.
- The row format is parsed by tests/status.test.ts with a field regex, so the new line must not look like a leaf row.

## Resolution
Operator answer (2026-09-11): `1-A`. Missing `issues/open` counts as zero leaves. A zero-leaf repo prints its name followed by an indented `no open leaves` line. Exit 0. Reason: one symmetrical fix matching how readLog already tolerates a missing file, and it answers both complaints in the report. Foreclosed: fixing only the crash and leaving the bare name.

Re-intake: operator 2026-09-11, `14a - But if that is still an issue, we need to resolve that one as well. Not just remove it completely.`

Excluded decisions: every loop-hardening decision; this leaf touches only status output for the empty and missing-open cases.

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

Chunk terminology above refers to this leaf's owned work. User-visible flows retain an end-to-end command and artifact; verification uses the checker's verdict and blocking `checks` commands (`bun run format`, `bun test`, `bun run typecheck`). No human-only prerequisite exists for this leaf. An unforeseen physical blocker ends the attempt and informs the operator. Credential access alone does not create a human-only prerequisite, and `hand_built` remains a separate explicit operator choice.

## Leaf architecture

Owned surfaces: `scanRepo` and the board printer in `src/status.ts`, `tests/status.test.ts`. `scanRepo` already guards `existsSync(open)`; the crash and the silent name come from the printer, which emits rows only for leaves. Add one branch: when a scan is ok and has zero leaves, print the repo name then `  no open leaves`. The parked line keeps printing after it. No change to `state.ts`, `next.ts` or the unreadable path.

Exclusions: depth validation, parked hints and repo-key messages belong to loop-hardening leaves `tree-preflight` and `repo-identity`.
