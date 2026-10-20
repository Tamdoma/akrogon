# owner-reuse

## Question

May an owner name that already closed take new leaves (append into the closed owner), or does each handoff group get a fresh owner name with twins refused?

### Carries

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: issues/chart/paid-proof-bounds/slots/map-merged.md

## Findings

Full notes: [slots/notes-merged.md](../slots/notes-merged.md) (A,B,C blind notes and rebuttals, 2026-10-19).

- better-than-training · src/phase.ts:191-226 (A,B,C) · completeOwner packs and renames the whole owner folder once; throws `Completion destination exists` at :201 before any work.
- better-than-training · src/evidence.ts:46-79 (A,B,C) · the owner name is the log identity across open/closed/parked; readLog falls back to the first existing dir's archive, so an open twin hides the closed archive.
- better-than-training · src/pack.ts:12 (A,B,C) · packFolder unions one folder's own archive only; it is not a two-folder merge.
- better-than-training · tests/next.test.ts:5700 (A,B,C) · pins today's twin-friendly dispatch.
- better-than-training · shapes.md Preflight (A,B,C) · the door's prose already refuses the twin; it was written anyway (framework commit ec649c713, 2026-10-18).
- better-than-training · framework live tree, 2026-10-19 (A,B,C) · open and closed satellite-plan-fit both exist; 708 recorded log paths in timings.jsonl and 49 in verify-runs.jsonl carry the owner name (A,C), so renaming a twin that already ran breaks evidence lookup.
- model-knowledge · no outside search: this is the repo's own naming rule, and no practitioner source applies.
- Changed the question: the destination's "always completes with a same-name closed owner" conflicts with refusing twins (B), so the round shows the wording change.

## Taken

Operator 2026-10-19: "1a |" (answered the plain-language rewrite of round 1 after "elid").

- 1a: no owner name reuse. A later group gets a fresh name (example `satellite-plan-fit-2`), chosen by the chart writer, never by akrogon.

Binding avoidance mechanisms: akrogon refuses to dispatch any leaf under an open owner whose top-level name also exists under `issues/closed` or `issues/parked`, decided by folder existence (an empty folder counts), with an error naming the conflicting folder (A,B,C); the refusal covers only that owner's leaves, so other work keeps dispatching (A); one rule in one place, and any `status` display reuses it rather than copying it (B,C); explicit dispatch of a closed leaf by its `issues/closed/...` path keeps working (C); the `completeOwner` destination throw stays as the last guard (A,B,C); the test pinning twin-friendly dispatch (`tests/next.test.ts` "closed owner name does not block an open same-name owner") flips (A,B,C). The live twin is repaired once under fork stuck-repair, which must account for the 708 + 49 recorded log paths carrying the owner name (A,B,C rebuttals).
