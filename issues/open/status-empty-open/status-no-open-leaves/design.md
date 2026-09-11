# Design: status-no-open-leaves

## Binding decisions, verbatim

# What does status print for a repo with no open leaves?
## Question
Confirm: missing `issues/open` reads as zero leaves, and a zero-leaf repo prints its name followed by an indented `no open leaves` line. Exit code stays 0.

## Resolution
Operator addition (2026-09-11, chat): the leaf also replaces the `key=value` row format with an aligned table of human-readable columns (LEAF, PHASE, AGE, BLOCKED BY, NOTE), because the rows wrap and are unreadable in a terminal. Machine fields stay in `akrogon status <slug>` and `issues/log.jsonl`.

Operator answer (2026-09-11): `1-A`. Missing `issues/open` counts as zero leaves. A zero-leaf repo prints its name followed by an indented `no open leaves` line. Exit 0. Reason: one symmetrical fix matching how readLog already tolerates a missing file, and it answers both complaints in the report. Foreclosed: fixing only the crash and leaving the bare name.


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

## Leaf architecture
Owned surfaces: `scanRepo`, `row` and the printing loop in `src/status.ts`, and `tests/status.test.ts`. In `scanRepo`, a missing `issues/open` yields an empty leaf list using the same shape `readLog` uses for a missing `log.jsonl`; any other error stays in the existing catch. The printing loop builds rows per repo as string arrays, computes one width per column across the repo, and prints a header line followed by the rows, keeping the existing folder-group indentation in the LEAF column. NOTE joins the non-default facts with ` · ` and is empty otherwise. A scan with zero leaves prints the repo name and then `  no open leaves` (two-space indent). No table library; padding with `padEnd`. The end-to-end verification is the status test invoking the CLI against a fixture repo, which leaves the captured output as its artifact.

Exclusions: no change to `akrogon status <slug>`, no change to the JSON diagnostics for other failures, no change to `Failed:` lines, no colour codes.
