# Where pass artifacts land and where the mistake fails

## Question
Q1. Does `akrogon phase` refuse `issues/` files on the leaf branch at every transition that has a worktree, with the nonempty-branch condition kept at `check.review` only?
Q2. Does the dispatch prompt carry the absolute authoritative leaf folder, in addition to skill text naming the write destination?
Q3. Do transitions also require the phase's pass artifact to exist in the authoritative folder, or does missing-artifact diagnosis stay at dispatch (today's debate gate)?

### Carries
- Leaf branches carry code only; issue artifacts are written only in the registered checkout (shapes.md, implement-issue skill).
- The debate gate stays on the authoritative path and never searches worktrees (B, R3).
- Off route: repairing the boulevard `worker-scaffold` branch and moving its `plan.md` and implementation briefs.

## Findings
- (A) Recommend Q1 yes and Q2 yes together: the gate makes the wrong state unrepresentable at the next move, the path removes the reason to guess. Skill text alone already failed once (`plan-issue/SKILL.md:14` existed and the seats still wrote relative to cwd). Tier: inspected code and skill text.
- (B) K6 agrees on both, subject to operator scope. K7: split `requireCodeOnly`; earlier checks must run before a slot is recorded (`src/phase.ts:121-128`). K8: artifact-existence checking is additional behavior with rebuttal-off and debate-off variants and must not ride in under a path fix. R3: a net branch diff check enforces final content, not that no commit ever touched `issues/`, and the widened guard must consider moves from `failed` and leaves without a worktree.
- (both) The message on refusal names `<repo.root>/issues/open/<...>` so the seat knows where the file belongs.

## Taken
Operator 2026-09-18, verbatim: "1 - I'm for a, but what happens then, does it autocorrect? | 2a | 3a".
- Q1: A. `akrogon phase` refuses `issues/` diffs on the branch at every move with a recorded worktree; the empty-branch refusal stays at check.review only. No autocorrect: the command refuses with a message naming the authoritative folder and the offending paths, and the seat repairs (write the file in the authoritative folder, remove it from the branch, rerun the move). Foreclosed: review-only gate; akrogon moving or copying files itself.
- Q2: A. The dispatched prompt carries the absolute authoritative leaf folder and every lifecycle skill's write lines point pass artifacts there. Foreclosed: skill text only.
- Q3: A. No artifact-existence gate; today's debate gate stays. Foreclosed: phase-to-artifact table.
