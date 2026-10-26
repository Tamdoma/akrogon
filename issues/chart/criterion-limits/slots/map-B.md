Class: partial proof of a qualified requirement. The plan preserves the normal result but drops a stated failure or sequencing condition. Tests derived from that plan repeat the omission.

Smallest change: add this after the criterion-to-observation paragraph in `/home/ivan/.claude/skills/plan-issue/SKILL.md`, `## plan.synthesis`:

> Before writing tests, challenge each planned decision against every condition of its done-criterion, tracing the value from producer to last consumer through intervening calls and state changes. Include or cite proof that would fail for a reachable violation of each stated condition; these are cases of the existing criterion, not new scope.

This would have caught:

- F1. Criterion 3's retry condition conflicts with caching `null`. Its proof needs two lookups in the same process, with a failed first lookup and a repository becoming available before the second. Four distinct cwd lookups and successful-call counts cannot detect this.
- F2. Criterion 2's no-write condition requires following the host union through each `reconcile()` call. The first repo's `tab close` invalidates its use for the next repo. A no-write, single-repo count test cannot detect this. Proof must exercise the intervening write and subsequent read.

Cost: a short causal trace during planning and targeted cases where existing proof misses an explicit condition. The risk is expanding this into imagined edge cases or exhaustive combinations. “Stated condition” and “reachable violation” limit it to the brief. No new artifact, review stage, harness or fixed case count is required.

A smaller reminder to “follow the brief” repeats an existing obligation without changing how proof is chosen. Another red-first instruction also adds nothing: the existing happy-path tests can turn red while still missing both defects. Change only planning. `check-issue` already compares tests against criteria, and `implement-issue` already permits criterion tests while locking test authorship after planning. The proposed sentence closes the gap before that lock.

Evidence, 2026-10-26: better-than-training, leaf `brief.md` Done-criteria 2/3 and `plan.md` D2/D3, C2/C3 and Implementation notes; `/home/ivan/.claude/skills/plan-issue/SKILL.md` plan.synthesis proof mapping and test-writing rules; `check-issue/SKILL.md` check.review acceptance-test rule; `implement-issue/SKILL.md` implement test rules. The proposed change and expected benefit are model-knowledge judgment, not a demonstrated guarantee.
