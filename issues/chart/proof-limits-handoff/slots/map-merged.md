# Merged map: proof-limits-handoff (#127)

Sources: slots/map-A.md, slots/map-B.md, slots/map-C.md. Tags name the slots that hold a line.

## Evidence

- The only proof stopped before the property criterion 1 rests on, and its `limits` said so (framework `issues/closed/about-titles/fixture-weave-recorder/readiness.yaml` `proofs[0]`; chart `about-titles/forks/title-source.md` "Proof 2026-11-03: recorder launch"). (A,B,C)
- The door treated the unproven verify path as a cost to budget (grant-draft-3), not an unknown to probe; one step earlier the same chart reopened a fork when a pick's proof failed (`title-source.md`, research template proof). (C)
- The deciding unknown was observable for free: real verify on the untouched fixture, recorded 2026-10-18 before checks added 2026-10-21..29. (A,C)
- An exit-0 run can also miss the property (framework `review-B.md` F1, F2). (B)
- No reader compares `limits` with criteria: `SKILL.md` "Take" is per operation; `shapes.md` "Preflight and validation" refuses only a missing proof; `src/readiness.ts` `proofSchema` has `limits: text` and nothing reads `proofs` beyond parse. (A,B,C)
- "Take" already says a proof counts only for the property it observed, for provider dry-runs and locked config keys. #127 is the general case. (C)
- "Handoff" already has an information-only review line for live runs. (C)
- Installed skill = release 9ee76bf6; a repo change reaches doors at the next release link. (B,C)

## Forks

1. Unit and place of the check.
   - 1a: the existing handoff audit gains a per-criterion coverage step in text: each done-criterion names the proof record and the observed `result` that reached its deciding property, or that the leaf builds it; a property found only in `limits` or in no proof is probed or narrowed before handoff. Stated once by generalizing the "Take" sentence ("a proof counts only for the property it observed") and applied in the shapes.md audit. (A,B,C)
   - 1b: count a proof that stops before the operation's end state as no proof. Over-refuses parts that were proven. (C rejects)
   - 1c: operator reads limits at review. No reader under autopilot. (A,C reject)
   - Differ: A put no new review line (nobody reads it under autopilot); C adds one review line per criterion citing proof path and `result` phrase, valued as a falsifiable record, not a gate. (A vs C)
2. Which properties need a charting observation.
   - 2a: any deciding property that exists before the leaf builds anything (existing data, an existing checker's verdict, an outside call), observed by the smallest check that reaches it, free before paid; the operator-approved paid test is the ceiling, not the default. Properties the leaf builds stay done-criteria. (A,B,C)
   - Stale recordings versus newer checkers: A counts it inside 2a ("existing data"); C would add a pointer to the standing-design sentence "an input whose effect on a model stage is unknown is investigated". (A vs C, small)
3. Declined or impossible probe (signpost 3a vs "Take": "scope is not narrowed. There is no waiver").
   - 3a: split by object: an operation a brief names still needs its one real call and holds when declined; a criterion's unproven deciding property is narrowed to what is proven at the handoff review, the narrowed part naming its owner (a prerequisite leaf when it can be proven alone, or an exclusion in the dependent's design). Both paragraphs, and questions.md "Optional measurement", say the same split. (A,B,C)
   - 3b: narrowing replaces the hold everywhere. Weakens operation proofs. (A,C reject)
   - 3c: hold only. Contradicts signpost 3a. (A,B,C reject)
   - If narrowing removes the chart's useful outcome, that is a material scope choice and returns as a question, not a vacuous contract. (B)
   - A paid probe's approval stays the operator's under autopilot. (A,B,C)
4. Machine-readable link (`proves:` field). Rejected: signpost 1c; a required field breaks 5a. (A,B,C)
5. When coverage is read: after the proof calls, before the handoff review; an uncovered criterion drafts one capped probe into the grant wait or narrows; a failed probe reopens the fork. (C; A,B silent)

## Pitfalls

- Rule copies drift between SKILL.md, shapes.md and questions.md: one statement, others point to it. (A,B,C)
- Boilerplate coverage ("all covered"): each line cites a proof path and `result` phrase. (C)
- Over-probing: smallest check, free before paid; the autopilot grant wait already parks paid ones. (C)
- Fixed-phrase matching on `limits`: none; limits stay useful after a pass. (B)
- Docs drift: `docs/use/plan-work.md` "Review the handoff" (lesson 2026-09-11). (A,C)
- New handoffs only; no framework repair (signpost 5a). (A,B,C)
- Grant counting stays in #126. (B,C)

## Split

One akrogon leaf: `skills/chart-issues/SKILL.md` ("Take", "Handoff"), `assets/shapes.md` ("Preflight and validation"), `assets/questions.md` ("Optional measurement"), docs hits. No engine code. (A,B,C)

## Open

- Done-criterion form for a text leaf: C proposes a read-only audit of the about-titles leaf draft (`slots/leaf-draft/fixture-weave-recorder/`) that flags criterion 1 against `proofs[0].limits`, plus a draft whose `result` observes the property passing. (C; A,B silent)
- Whether "deciding property" needs a definition, or "the observable result the criterion names" suffices. (C low confidence)
