# Leaf review, slot C

## worker-stash-rule

Holds.

## trailer-rule-refusal

T1. The readiness proof is false as recorded. I ran its command, `bun test tests/phase.test.ts -t citation`, and it selects "a trailer naming a different path does not cite..." and "a solo merge push keeps citations valid...", 2 pass. Neither is a test asserting "final trailer block"; those assertions live in "modified old test files need a Test-Change trailer on every guarded move" and the frozen-record drift test, which the filter does not select. So the proof's limits claim (the fixture and its "final trailer block" assertions run today) was not observed, and criterion 2's pre-existing key part rests on an unrun proof. Smallest correction: rerun with a filter that selects those two tests, or the whole file, and record that command and result.

T2. The design's binding copy states the five writer lines "already say final trailer block". Live text contradicts it for one: `skills/plan-issue/SKILL.md` never says "final trailer block"; it only points at "the trailer rule". The other four do say it. This changes no pick or owned file, but the stated reason for leaving writer sites unchanged is wrong for plan-issue. Smallest correction: fix that sentence in the fork Taken and the design copy to name plan-issue as pointing at the trailer rule.

## installed-step-transfer

I1. The fallback "a skill not resolved under `releases/` is the repo's own step" misclassifies a supported install layout. In `src/release.ts`, `ensureCurrent` can point `~/.akrogon/current` at `toolRoot`, the akrogon checkout the command runs from, and `currentReleaseCommit` then returns null. On that layout a consumer's running skill resolves into an akrogon checkout, not under `releases/` and not inside the consumer repo, so the text would send the sorter to same-repo Transfer for a step it cannot edit in its own repo. Smallest correction: classify by where the step's file lives, not by install layout. Inside the registered repo means same-repo Transfer; outside it means installed step, citing the releases sha when under `releases/`, else that checkout's own git HEAD.
