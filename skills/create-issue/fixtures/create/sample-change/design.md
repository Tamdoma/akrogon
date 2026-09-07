# Design: sample-change

## Binding decisions, verbatim

- Only the command-line invalid-repo error changes. Leave browser UI and valid-repo behavior unchanged.
- akrogon
- Normal priority (n).
- All steps are agent-owned. No physical operator action is required.
- Use the normal release. Add no migration, rollout flag, or approval hold.
- Reject an unconfigured repo name with a nonzero exit and list every configured repo key. Change no files on rejection.
- Skip consult.

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

consult-election: no

## Leaf architecture

Use the command's existing invalid-repo error path and configured repo keys. The invalid-name input is the rejection trigger. Keep browser UI, valid-name handling, and storage untouched. Release through the normal release path. There are no physical operator-only steps. The implementer plans directly from these decisions. A consultant may challenge a lock only by raising a named conflict into the operator's batch queue.
