# Map A: proof-limits-handoff (#127), written before reading B and C

## What happened (inspected)

- Framework leaf `issues/closed/about-titles/fixture-weave-recorder/readiness.yaml` `proofs[0]`: the only proof ran the old recorder; `result` says the gate refused because "the recorder has no copy judgment step; repair step owned by fixture-weave-recorder"; `limits` says "not the copy judgment session, finalize or verify acceptance".
- `brief.md` criterion 1 rests on "the real verify reports no finding this run caused". The deciding unknown was a property of existing data and an existing checker: the fixture was recorded 2026-10-18, before three verify checks were added. Running real verify on the untouched fixture is a local, unpaid call that would have shown the 15 flagged pages before handoff.
- So the gap was not "a paid session was not run". It was "the property the criterion rests on was never observed, and nothing asked which proof observes it".
- `skills/chart-issues/SKILL.md` "Take", operation-proof paragraph: proof is required per external operation, with `limits`; nothing maps a proof's limits back to the criteria. `assets/shapes.md` "Preflight and validation": the implementer audit checks that a named operation has a recorded proof, not that a criterion's deciding property was reached.
- `src/readiness.ts` `proofSchema`: `limits` is free text; no field links a proof to a criterion. Signpost 1c (written rules only) keeps it that way.

## Forks

F1. Where the new check lives.
- a (recommended) One sentence in the shapes.md implementer audit ("Read the briefs as an implementer"): for each done-criterion, name the proof or charting observation that reached its deciding property; a property a proof's `limits` names as unproven, with no other proof, is probed or narrowed before handoff. SKILL.md "Handoff" already points at the shapes audit, so no second copy. Signposts 1c, 6a.
- b A handoff-review line listing each proof's limits beside the criteria. Display only; under autopilot nobody reads it (C's signposts note), so it repeats #127.
- c A `covers:` field on proofs, checked by the command. Rejected by signpost 1c.
- Breaks later: a, a rule A can skip under load; mitigated by making it part of the existing audit A already runs at every handoff.

F2. Which properties need a charting observation (signpost 4a: the family).
- a (recommended) Any property a done-criterion's pass depends on that exists before the leaf builds anything: existing data, an existing checker's verdict, an outside call's behavior. Observed by the cheapest call that reaches it, often a free local run (here: real verify on the untouched fixture). Properties the leaf itself builds stay done-criteria.
- b External operations only (today's rule). Misses #127's case, whose decisive unknown was a local checker on old data.
- Breaks later: a can grow charting time; bounded by "cheapest call that reaches it" and by applying only to deciding properties.

F3. When the observing call costs money and the operator declines it (signpost 3a vs SKILL.md "Take": "Declining a required probe holds the handoff ... scope is not narrowed. There is no waiver.").
- a (recommended) Keep the hold for required operation proofs (the operation is called at all). For a criterion's deciding property, a declined paid probe narrows that criterion with the operator to what is proven, at the handoff review. Signpost 3a, operator words.
- b Replace the hold everywhere with narrowing. Weakens operation proofs that exist for credentials and flags.
- c Keep hold only, ignoring 3a. Contradicts the operator's signpost.
- Under autopilot the paid probe already waits on grant approval (SKILL.md "Autopilot"); the decline is operator words, so the narrowing follows them, not A.

F4. A proof that fails because the product does not exist yet (here: the recorder lacked its copy judgment step).
- a (recommended) The limits line splits each unproven property into "the leaf builds it (criterion N)" or "unknown: observed by <call>" so the audit in F1 has something to compare. Written-rule only (1c).
- b Leave limits free-form; the audit judges from prose.

## Practitioner questions

- Would a pre-mortem ("which criterion fails first and why") at handoff have caught it? Same intent as F1a, cheaper as one audit step.
- Is the fixture's age (recorded before new checks) a family? Yes: any checked-in recording older than its checker. F2a covers it.

## Pitfalls

- Duplicated rule text between SKILL.md and shapes.md drifts. Put it in one place (shapes audit) and keep SKILL.md pointing to it.
- Stale docs (LESSONS: 2026-09-11 stale rule in docs): `docs/use/plan-work.md` and `docs/reference/` describe the proof rule; the leaf greps `docs/` for "proof" and "limits" and owns any hit.
- `tests/chart-shapes.test.ts` checks readiness shape only; no test pins the prose. No vanity test should be added for prose (standing design).
- Signpost 5a: new handoffs only; no re-audit of handed charts.

## Split

One leaf in akrogon (`skills/chart-issues/SKILL.md` "Take" paragraph, `assets/shapes.md` audit sentence and limits wording, docs hits). One outcome; no dependency. Lifecycle route (autopilot).
