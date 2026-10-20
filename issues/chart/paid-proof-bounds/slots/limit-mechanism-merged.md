# limit-mechanism merged notes

## Options

- O1 written grant rule, no counter (A,B,C). A paid or quota-consuming model launch, read-only included, direct or transitive through a runner, is a billing effect that needs an operator-approved grant before its first call. `bounds` is one total for the leaf's whole life across seats, passes, probes, retries and repairs. Exhaustion or a missing grant takes the existing operator-blocker stop with the criterion still red (A,B,C); unknown prior consumption is treated the same (B). No code, schema, state field or counter. The proof-cost 2026-10-10 lock stays closed (A,B,C). Cost: seat-followed, so a disobedient or miscounting seat can still overspend (A,B,C). Not a dollar ceiling (B,C).
- O1 companion: the grant may name a native per-launch cap such as `claude --max-budget-usd` as an optional guard; the grant stays the leaf-total authority (C). B and A reject the flag only as the whole solution, not as a named guard.
- O2 akrogon-enforced counter in run-check, rejected (A,B,C). It counts wrappers, not the nested `claude -p` sessions inside framework runners or direct shell calls; needs grant links on proofs, atomic use across parallel seats and crash rules; reopens the lock.
- O3 `--max-budget-usd` as the sole mechanism, rejected (A,B,C). Per invocation, resets on each rerun, client-side estimate that can overshoot, excludes resumed totals (B,C); codex 0.163.0 and pi expose no budget flag (C).
- O4 token or USD counter from provider logs, rejected as mechanism (C): after the fact, fragile attribution, differs per harness. Fine as an audit.
- O5 keep prose and show a bigger estimate, rejected (B,C): the handoff estimate existed and 82% of 2026-10-18 input still went to reruns.
- O6 provider gateway or spend-limit service, out of scope here (B); named as the only true hard backstop, an operator account action outside akrogon (C).

## Sentence changes under O1

- chart-issues Take grant paragraph: "one scoped live-change grant ... before the first mutating proof" becomes a grant for live changes and paid or quota-consuming model launches, approved before the first covered call including the door's own charting probe; final sentence adds exhausted total and covered operation (A,B,C).
- chart-issues Take operation-proof paragraph: a paid probe needs the grant first (B,C) and counts as the first attempt (C) or consumes the total under bound-unit's unit (B); `proofs[].limits` states only what a probe does not prove and never authorizes spend (A,C).
- chart-issues Handoff: confirm live-change and paid-model grants (B,C); show the authorized worst case (sessions per attempt times permitted attempts) beside the one-run estimate, estimate information only, grant bound binding (A,C); show usage already consumed (B).
- Reuse sentence: delete "without asking again" and "before mutating"; compare operation, target, identity and remaining bound; record attempts consumed in the pass artifact; a restart, repaired commit, replacement seat or provider reset does not renew the bound (A,B,C). The same sentence exists in four skills: plan-issue:35, implement-issue:53, check-issue:35, merge-issue:33 (C, confirmed by A by grep). All change together.
- implement-issue retry and check.fix rerun paragraphs, check.review retry and check.repair rerun paragraphs: one short line that a required retry or rerun does not extend paid authorization (B).
- check.repair "B runs planned live proofs itself": only while bound remains; an exhausted planned proof is operator-only, never Handed to A (B,C).

## Evidence

- Operator: remove redundancy first (2026-10-18); proof-cost Taken 2026-10-10 forecloses enforced budget, timer or numeric gate; leaf-run-stalls Off route forbids clocks (A,B,C).
- Code: `src/readiness.ts` grantSchema `bounds`, `stop_line` free text, nothing consumes them; `proofs[]` has no grant link (A,B,C). `src/run-check.ts` checkedRun runs arbitrary argv (B,C). Framework `session-trace.ts` launchSkillSessionAsync spawns `claude -p` (B,C).
- Intake: media-range-live's written bound "at most one pass rerun" stopped the seat; leaves with `grants: []` did not (A,C).
- Vendor docs, 2026-10-19: Claude CLI reference `--max-budget-usd` print mode, estimate, can overshoot, resume excluded (A,B,C); Claude cost docs, client estimate vs bill (B); Anthropic Admin API spend limits exist provider-side (C).
- Practitioner: LangChain 2026-06-15 and OpenHands 2026-04-03 enforce fleet budgets at a gateway, which contradicts prose-only hard limits (B). Anthropic multi-agent research post: written effort rules set by humans bound fleet spend (C). Vendor blogs on layered caps and retry stops, weak (A).

## Pitfalls and what removes them

- Bound resets per pass, session, compaction or provider reset: bound is per leaf lifetime and the count lives in the pass artifact (A,B,C).
- Two parallel seats each see the same remaining bound (B). Removed by naming one launch owner or splitting the bound before handoff, settled in bound-unit.
- Door spends on a charting probe before any grant exists: grant approved before the first covered call, probe counts (B,C).
- Exhaustion becomes a waiver or a split into many small sessions: criterion stays red and takes the blocker stop; bound-unit must define attempt so splitting does not win (B,C).
- A single runner spends far more than expected: transitive fan-out must fit the unit; a run count is not a dollar cap (B).
- Native cap on a subscription login is an API-dollar estimate: never let the flag be the bound (C).
- Open framework leaves with `grants: []`: the rule bites at next paid launch, no sweep (C).
- Counter promised later: one proven launch past a written bound reopens the counter option with evidence (C).

## Open questions

- Is protection required even when a seat ignores the rule? If yes, O1 is wrong and the real fix is provider-side (B Q11, C Q-C1).
- Does the operator want a provider-side spend limit or a separate key for proof sessions as a hard backstop outside akrogon (C)?
- Who raises an exhausted bound and edits readiness.yaml: one named action (C).
- Who owns paid launches when seats overlap (B, goes to bound-unit).

## Where slots differ

- Native per-launch flag: C allows it as an optional grant-named guard; A and B do not propose it.
- Retry and rerun paragraphs: B edits each with a short precedence line; A and C change only the reuse sentences.
- Hard backstop: B leaves it out of scope; C wants the round to name it or decline it.
