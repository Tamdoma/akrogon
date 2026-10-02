# Save route: merged A + B

## Evidence
- (A,B) pi guard refuses tool writes and recognized shell mutations to `.env`/`.env.*` and skips other command names; it has no save allowlist and does not inspect a script's own file calls (index.ts:843-895,1104-1185; tests :260-298).
- (A,B) Claude allows cannot beat denies; Edit denies do not cover subprocesses that open files themselves; sandboxing, when on, can still block them. Codex rules match argument prefixes, not script internals.
- (B) Framework producers already save in-process (dev-build-emdash setup-claim.playwright.ts:37-68,285-288; admin-session.ts:83-115,408), but write the whole file and two names at once, so they show feasibility, not this chart's single-key contract. secret-env has readers and redaction only (index.ts:28-61).
- (A,B) No leaf in this chart produces a key; the route serves future consumer producer leaves.

## Recommendation 1a (A,B): declared save operation, approved and proven per producer
- The producer's readiness contract names the save operation: entry point, inspected revision, non-secret arguments, key name, holding repo's real file and private value source (A,B).
- Prefer saving inside the producer process that receives the key, or passing it privately to a narrow save subprocess; never return it to the agent to build a command (B).
- The door reviews and proves it at charting with throwaway inputs against a scratch target: only the named entry changes, others are preserved, nothing prints, the key is revoked on failure (A,B).
- Explicit permission = operator approval of that recorded operation plus the proof, inspected against the actual harness's effective rules. No redundant allow entry where policy already permits it; where a control denies it, reconcile that control at its source and re-prove (B).
- Tool edits, shell redirects and dumping stay refused.

## Options
- 1a (A,B) as above.
- 1b (A,B) a dedicated allow entry per producer in each harness, with a pi guard save-policy feature charted as a pi-extensions leaf. Adds a second policy store and destination; matching a command does not limit what its code writes.

## Pitfalls
- (A,B) The authorization is the approved record and proof, not the guard's blind spot; any other writer is outside the grant.
- (B) The pi scrubber learns a new value only after the next agent start; the producer suppresses its own output.
- (A) Never prove against the real holding file.

## Research
- practitioner · Trail of Bits, claude-code-config (read 2026-10-02) (B): tool approval and process isolation differ; an allowlist is not file-level confinement.
- better-than-training · pi guard source and tests; Claude Code permissions; Codex rules; framework secret-env and dev-build-emdash producers; all read 2026-10-02 (A,B).
