# B: build-cause

## 1. Pick, reason and cost

**Q1: close #96 as not built, with a reopening condition.** Reopen for a concrete wrong recovery/non-recovery caused by ambiguous failure prose, or measured recurring interpretation cost that a field at the producer would remove. No new measurement system is needed to keep that condition.

The intake reports no observed wrong recovery and unmeasured pain. A structured label would move some classification to the failing seat, but would not remove current owner lookup, seat-idle checks, recovery-history checks or the watcher turn (`skills/watch-issues/SKILL.md:40`, `:41`). It would add a command/schema/writer/consumer contract. Accepted cost: repeated prose judgment and possible misclassification remain.

Qualify the question's premise: the taken base-red policy removes only failures admitted by its comparison rule. Non-extractable commands, incomplete/timed-out/setup-failed runs and done-criteria failures remain blocking. Also, a chart decision is not evidence of a delivered reduction in failure volume. Do not close this as “all base reds removed” or “classification no longer needed.” Evidence: `issues/chart/base-red/forks/red-base-policy.md`, Taken.

**Q2, conditional on building: store facts and owner references, not a permanent recovery verdict.** Candidate kinds are operator action, another leaf's work, and an execution/proof blocker whose resolution is not yet established. Keep explanatory reason/evidence. An owner reference belongs only to the other-leaf case, with explicit unresolved ownership when it cannot be identified. These are conditional design directions, not a schema chosen by the no-build recommendation.

For legacy records without the new field, preserve the current reason-based judgment explicitly. A completely absent failure record remains notify-only as today. Do not backfill inferred facts, default to recoverable, or silently change all existing records to notify-only. Cost: legacy interpretation remains until those failures are resolved. If eliminating all prose judgment is the actual objective, migration of existing failures is a separate decision.

## 2. Rejected options and future consequences

- O1 **Build typed facts now:** technically sound direction if a demonstrated problem appears, but not justified as an optimization today. All four seat skills can write failures for different reasons, and the observer must expose the added field. Incorrect producer labels can become more authoritative than their evidence. Evidence: `skills/plan-issue/SKILL.md:29`, `:63`, `skills/implement-issue/SKILL.md:35`, `:36`, `:38`, `skills/check-issue/SKILL.md:29`, `:31`, `:81`, `skills/merge-issue/SKILL.md:29`, `skills/watch-issues/scripts/observe.ts:248`.
- O2 **Store recoverable/nonrecoverable once:** reject. Eligibility depends on current owner state, required seats and recovery history. A verdict can become stale even while the failure's original facts stay true. Recomputing it requires the very live checks this proposal purports to replace (`skills/watch-issues/SKILL.md:40`, `:41`).
- O3 **Extend or replace `cause: blocked | attempts` without preserving its meaning:** reject as a shortcut. Existing values affect dirty-worktree recovery and failed-leaf dispatch. A finer classification cannot silently change those guarantees (`src/phase.ts:283`, `src/next.ts:777`).
- O4 **Make every unclassified legacy record notify-only:** simpler than retaining prose judgment, but changes existing recovery behavior and can strand work the watcher currently recovers. It is a possible explicit safety-policy change, not a compatibility default. Inventing labels from old reasons has the opposite risk: inferred history becomes asserted fact (`skills/watch-issues/SKILL.md:40`, `:41`, `src/state.ts:99`).

## 3. Evidence, tier, source and date

- E1 **Operator material, read 2026-10-17:** `issues/chart/failed-cause/INTAKE.md` and Question/Carries leave build/no-build open, identify no observed wrong recovery, and carry no-classifier/no-new-polling locks. The related base-red Taken narrows which failures continue. These support a no-build decision with an observable reopening condition, not a claim that all remaining failures are simple.
- E2 **Better-than-training, repo inspection 2026-10-17:** `src/state.ts:12` stores two coarse causes and prose. `src/phase.ts:266` writes `blocked` for explicit failed moves. `skills/watch-issues/SKILL.md:40` resolves owner status dynamically, and `:41` checks idle seats and history before recovery. Actual recorded failures include a GitHub authentication action (`issues/log.jsonl:888`) and an unmeetable locked decision (`:1025`), so human prerequisites remain real. These examples do not show a watcher misclassification. Relevant code/skill diffs against `0dfae20` were empty.
- E3 **Practitioner, read 2026-10-17:** [Erik S. and Barry Zhang, Anthropic, Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents), published 2024-12-19, draws on building agents and working with dozens of teams. Their emphasis on simple designs and demonstrated benefit supports deferring an unmeasured extra contract. It does not establish that typed failure facts are harmful or that this watcher's judgment is accurate.
- E4 **Better-than-training, primary standard read 2026-10-17:** [RFC 9457, section 3.1.4](https://www.rfc-editor.org/rfc/rfc9457.html#section-3.1.4), recommends machine-readable extensions instead of parsing human detail text. This supports the conditional facts design if deterministic consumers need it. The RFC governs HTTP APIs, not this agent-mediated CLI workflow, so it is design evidence rather than a requirement to implement #96 now. E3 and E4 together favor typed facts when they remove a demonstrated ambiguity, without inventing a recovery-policy field.

## 4. Pitfalls and what removes each

- R1 **Recovery authority accidentally delegated to the failing seat.** A class describes the blocker, never grants permission or skips current eligibility checks. Preserve operator-only actions, idle-seat checks and the unproductive-cycle limit. The limit bounds repeated recovery, not the consequence of the first wrong recovery (`skills/watch-issues/SKILL.md:40`, `:41`, `src/phase.ts:245`).
- R2 **Owner classification freezes a changing state.** Store the referenced owner identity, then resolve its current state when judging. Missing, ambiguous or unreadable ownership stays unresolved. Do not store “owner merged” as a permanent failure category (`skills/watch-issues/SKILL.md:40`).
- R3 **One label hides several blockers.** A repair stop can name multiple operator actions (`skills/check-issue/SKILL.md:31`). If building later, define how mixed blockers are represented and ensure clearing one cannot enable recovery while another remains. Do not choose a generic “recoverable” remainder.
- R4 **New flags break running seats or old records.** Specify writer rollout and legacy behavior before making a class mandatory. Keep the original reason and existing cause semantics. Test new producer-to-observer-to-recovery behavior and old-record interpretation, not merely enum parsing (`src/state.ts:12`, `src/phase.ts:253`, `skills/watch-issues/scripts/observe.ts:248`).
- R5 **No-build reported as delivered functionality.** Close as a deliberate scope decision with its reopening evidence requirement. Leave the schema and watcher unchanged. Base-red's implementation and validation remain separate work.

## 5. Questions missing from the fork

- Q3 What exact action would structured facts change or eliminate after owner, seat and history checks remain? Without that, “remove reclassification” is not a measurable outcome.
- Q4 If built, how are several simultaneous blockers represented, and who establishes that all are resolved?
- Q5 Must legacy failures behave exactly as today, or is a notify-only migration explicitly intended? That choice changes recovery, not just storage.

Only this return file written. No tests, state moves or watcher actions run. No other slot's build-cause notes read.
