# Merged notes: proof-rule

## Q1 which tests
- Timing, browser, process or shared-resource tests, plus tests repaired after an integrated failure; includes new cases in existing files and helper changes that affect them; selection by what the test does, not its path. (A,B) Cost: planner must trace the execution path; misclassification possible.
- Planner gives a short reason in the existing proof mapping for each changed case it excludes; B checks it. No new record. (B; A agrees)
- Every added or changed test: rejected, adds runs to deterministic tests without addressing the gap. (A,B)
- Only tests repaired after merge failure: rejected, misses gap (a). (A,B)
- Pure tests keep the existing fail-before/pass-after or deliberate-break proof (skills/check-issue/SKILL.md:53). (B)

## Q2 what runs count
- The changed case run repeatedly beside the stages that affect it at merge, using existing runners; each counted run must reach the case on its current version and record its result. (A,B) "Same stages" means stages affecting the mechanism, not the whole merge gate. (B)
- A's concrete form for framework playback: the playback stage with `--rerun-each N` inside a `bun run --parallel` of its verify:core siblings; about one core lane, 4-5 min, or about 9 min for 10 runs at 54 s each (measured from parallel-selftest logs). (A)
- CPU-stress standalone: rejected as substitute, allowed as extra diagnosis; stress-ng not installed here. (A,B)
- File-only rerun: rejected as sole proof; passed twice standalone. (A,B)
- Repeated merge_checks before review: rejected, check-reruns lock. (A,B)
- No adequate smaller composition: A says the existing plan-issue rule applies (plan-issue SKILL.md:62, leaf ends `failed` with "requires new proof machinery", operator decides). B asks that the contract settle this collision before handoff. (differ in form)
- Runs skipped by an earlier failed stage do not count; completeness recorded. (B; A agrees)

## Q3 how many runs
- A: fixed floor of 10 runs for every triggered test, higher with a stated reason. Stops the one-green-run judgment. Detection at an assumed 1-in-10 rate: 65% at 10, 41% at 5, 88% at 20.
- B: planner sets the count per proof command with reason and runtime; detection chance labelled unknown unless p is measured; never reduced after red; more than one completed run.
- Both: count declared before the runs, never lowered after a red, never presented as a guarantee. (A,B)
- Differ: fixed floor (A) vs planner-set (B). B: a floor has no established detection target and the 1-in-10 rate rests on a small sample. A: the case shows a seat judging one run enough; Q1 already excludes cheap deterministic tests, so a floor only costs on timing tests.

## Q4 failure ending
- Leaf's own changed test failing: keep failure logs, repair on the owning branch, rerun the full campaign on the repaired version; `--retry`, quarantine or a later green run of the unchanged version never count. (A,B)
- Single diagnostic retry for unattributed red stays (skills/implement-issue/SKILL.md:38). (A,B)
- A run lost to an unrelated infrastructure failure does not count toward the declared count; remaining runs still need to complete. (B; A agrees)
- Interrupted run is incomplete, never green. (B; A agrees)

## Open
- Q2 collision when no smaller composition exists (see Q2).
- Q3 floor vs planner-set.
