# failed-refusal merged notes (A, B, C)

## Q1 scope
- Refuse every new leaf- and worker-scoped run while the leaf phase is `failed`; holder/checkout runs untouched; no other phase (A,B,C). Decide leaf-backed by the caller carrying a phase, not by `scope` alone (B,C).
- Rejected: paid-only (no cost signal in code, A,B,C); more phases (merged already refused by `ownerRefusal`, merge verify must run, C).

## Q2 when
- Read the phase twice: before admission and again right before spawn, after any admission wait, beside the existing fenced `ownerRefusal(target, repo, true)` (A,B,C). Fresh `readState` of the leaf folder at the late point (B,C).
- Durable record: (A,C) a new `check_refused` timing kind; (B) the existing retained run root with `refusal.json` and `PublishRefusedError.log` via `refusePublish`, no schema change. C notes an unknown timing kind makes older readers drop all timings.
- The last read is the acceptance point; a failure committed after it does not cancel the run (B).
- Text: "Refusing run-check <name> for leaf <repo>/<slug>: the leaf is failed (<reason>). Recover with akrogon phase <slug> <failure.phase>, or run the plain command without run-check." (A,C wording merged)

## Q3 in-flight
- Accepted runs finish and publish (A,B,C). A nested run-check after the move is refused as a fresh launch (C).

## Q4 verify
- No carve-out; each verify stage is a fresh launch and is refused the same way; no skill flow verifies a failed leaf (A,B,C; C read implement/check/merge skills). A refusal never writes a green or complete receipt (B).

## Points where slots differ
Durable record form only.
