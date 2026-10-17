# Build a structured failure cause

## Question
Q1. After base-red's known-reds-pass decision removes base reds from the `failed` path, is a structured failure class (a value seats pass with `akrogon phase <slug> failed`, read by watch-issues instead of re-judging `failure.reason`) still worth building, or does #96 close as not built with a reopening condition?
Q2. If built: which classes, how legacy records without the field are treated, and whether it stores facts (owner slug, kind) or a recovery verdict.

### Carries
- Taken: ../base-red/forks/red-base-policy.md (no leaf is marked `failed` for a base red).
- Locks: no classifier model API (chart jev-classifier, where this idea was seeded); only the operator flips autopilot; no new timers or polling.
- Related: ../base-red/slots/map-merged.md (#96 section); skills/watch-issues/SKILL.md:40-41; src/state.ts:12-18; src/phase.ts:266-283; src/next.ts:777-786.
- Operator corrections: none. Autopilot on since 2026-10-17T08:36:16Z.

## Findings
- Notes: slots/build-cause-A.md (written after B and C returned), -B.md, -C.md; merged slots/build-cause-merged.md with B F1-F2 applied; C: no disagreement.
- better-than-training, read 2026-10-17: src/state.ts:12-18 failure schema; src/phase.ts:266-283 only writer, always `cause: blocked`; :286 blocked-cause worktree exemption; src/next.ts:777-786 reads `attempts`; skills/watch-issues/scripts/observe.ts:248-250 prints the reason for the tick; skills/watch-issues/SKILL.md:40-41 owner resolution, seat checks, two-cycle limit. Changed: a field would not remove the live checks, and `cause` must not be reused.
- Historical volume: about 20 entries into `failed` in issues/log.jsonl over 36 days, base-red incidents included; no wrong recovery on record. Not a post-change rate (B F1). Delivery can fail (log.jsonl:602 `rate_limited`) and has no acknowledgement (B F2).
- practitioner, 2024-12-19: Anthropic "Building Effective Agents": simple designs with demonstrated benefit. Primary: RFC 9457 3.1.4, structured fields over parsing detail text, for HTTP APIs. Changed: favors facts over prose only once a real ambiguity is shown.

## Taken
Autopilot pick by A, 2026-10-17 (not operator words; mode record in CHART.md). Matches the round recommendation; all three slots agree.

Q1: do not build. #96 closes as not built. Q2 not reached.
Reason: `base` was the one class with a proven payoff, and the taken known-reds-pass rule keeps base reds out of `failed` where its comparison applies. A field would not remove owner lookup, seat checks, recovery history or the watch turn, and old records keep today's prose judgment, so the prose mostly survives. Removing over adding.
Scope note: unitless commands, incomplete runs and done-criteria failures still stop leaves; this close does not claim all base reds are gone.
Accepted cost: watch keeps judging reason text each tick; a vague reason can be misjudged, and a notice gives visibility, not a bound, so work can stay failed until someone looks.
Reopening condition: a recorded wrong recovery or non-recovery traced to judging reason text, a second consumer needing the class structured, or `failed` volume making per-tick judgment a measured cost.
If built later: facts and an owner reference in a new field beside `cause`, never a verdict, never a reuse of `cause`, legacy records judged as today.
Rejected: build now; store a recovery verdict; repurpose `cause`; close with no reopening condition.
Standing dissent: none.
