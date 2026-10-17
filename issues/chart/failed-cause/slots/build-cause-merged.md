# build-cause merged notes

Tags name the slot whose own notes hold the line. Notes: build-cause-A.md (written after B and C returned), -B.md, -C.md.

## Q1 build at all
- Close #96 as not built, with a reopening condition. (A,B,C)
- The one class with a proven payoff was `base`, and the taken known-reds-pass rule keeps base reds out of `failed` when its comparison applies. (A,C)
- The premise is narrower than "all base reds removed": unitless commands, incomplete, timed-out or setup-failed runs and done-criteria failures still stop leaves. A chart decision is not delivered reduction. (B; A agrees)
- Historical volume: about 20 entries into `failed` in issues/log.jsonl over 36 days, base-red incidents included, no observed wrong recovery. (A,C) It is not the post-change population or rate. (B) A wrong recovery is bounded by the two-cycle limit and a missed recovery by the failure notice. (C) The limit bounds repeats, not the first wrong recovery, and a notice gives visibility, not a bound: delivery can fail (log.jsonl:602 `rate_limited`) and has no acknowledgement, so work can stay failed until someone looks. (B)
- A field would not remove owner lookup, seat-idle checks, recovery history or the watch turn. (B) The legacy branch keeps today's prose judgment, so most prose survives. (A,C)
- Reopen on a recorded wrong recovery or non-recovery traced to reason text, or measured recurring interpretation cost. (A,B,C) Also when a second consumer (status, a report, a scripted tick) needs the class structured. (A,C) Or when `failed` volume makes per-tick judgment a measured cost. (C)

## Q2 if built later
- Facts and an owner reference, never a recovery verdict, since eligibility depends on current owner state, seats and history. (A,B,C)
- Kinds: human (credential, permission, operator decision, external step), owner with a slug, other. (A,C) B names operator action, another leaf's work, and an unresolved execution or proof blocker. (B)
- New field beside `cause`; never repurpose `cause`: `blocked` drives the dirty-worktree exemption (src/phase.ts:283-286), `attempts` drives a dispatch guard (src/next.ts:777-786). (A,B,C)
- Legacy records without the field are judged from reason exactly as today; never default to recoverable, never switch to notify-only silently. (A,B,C)
- Optional at the command, required by the skill templates that know the kind; ad-hoc blockers omit it rather than guess. (C)
- Mixed blockers in one stop need a representation before build. (B) Kind/reason disagreement needs a precedence line. (C)

## Evidence
- Intake #96: no observed wrong recovery, pain unmeasured. (A,B,C)
- src/state.ts:12-18, src/phase.ts:266-286, src/next.ts:777-786, skills/watch-issues/scripts/observe.ts:248-250, skills/watch-issues/SKILL.md:40-41. (A,B,C)
- Recorded human stops: GitHub auth (log.jsonl:888), unmeetable locked decision (:1025). (B)
- Anthropic "Building Effective Agents" 2024-12-19: simple designs, demonstrated benefit. RFC 9457 3.1.4: machine-readable fields over parsing detail text, for HTTP APIs. (B)

## Open questions
- `cause: attempts` has a reader and no current writer. Dead code or a value older builds still write in consumer repos? (C)
- What exact action would a structured class change after owner, seat and history checks stay? (B)

## Where slots differ
None on Q1. Q2 kind names differ (A,C vs B), conditional only.

## Rebuttal corrections applied
B's rebuttal F1-F2 (build-cause-rebuttal-B.md) applied above.
