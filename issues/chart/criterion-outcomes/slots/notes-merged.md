# Merged notes: proof-command-owner

Sources: slots/notes-A.md, notes-B.md, notes-C.md. Skills and code at akrogon HEAD 96a96979, read 2026-10-19.

## Options
- Criterion locks the observable result; `plan.md` owns the proof command; A corrects a wrong command and records old, new and reason; B judges the correction in review (A,B,C). B in check.repair and merge hands a command correction to A instead of swapping it (B,C). A runner command written inside an existing criterion is proof, not a locked decision, so in-flight leaves are covered without brief edits (B,C); B adds: only when the outcome stays unambiguous without it. A direct invocation of the product named as the result stays locked outcome (B,C). Corrections go toward the repo's configured runner or script semantics (timeout, env, preload, isolation, scope) (A,C); B: prefer the configured runner, and allow another existing valid invocation proving the same outcome with recorded reason and B review. Reason: the rule exists in halves (shapes audit, plan mapping, an undefined `test-proof-rules` citation); joining them removes the operator stop with no new code. Cost: skill text in plan, implement, check, merge; seats judge equivalence (A,B,C).
- Operator amends the criterion each time (today) (rejected A,B,C). One round trip, about 25 minutes, recurred after #47.
- Known-red waives a red criterion proof (rejected A,B,C). Proves nothing; `verify` known-red covers only configured `checks`, not ad-hoc criterion commands (C).
- Run every criterion command on base at handoff (rejected A,B,C). Red-first proofs are red on base by design; tests often do not exist until plan (B,C).
- Any seat may swap the command (rejected B,C). The seat needing green would grade itself.
- Command registry or equivalence matcher (rejected B). Judgment, not data.
- Mechanical lint refusing commands in criteria (rejected A; C asks Q2). Format check on prose.
- Keep commands in briefs and rely only on the existing prose audit (rejected C). It already existed and #105 passed it; does nothing for in-flight leaves.
- Fix the base-red cause inside the leaf (rejected C). Not owned.

## Evidence
- `shapes.md` Preflight and validation: a criterion is an observable result, never a test file; the #105 criterion broke this and passed the audit (A,B,C).
- `plan-issue` plan.synthesis: plan.md maps each criterion to "the command that observes it", using a runner that exists at base or one product invocation (A,B,C).
- `implement-issue`, `check-issue`, `merge-issue` route "a unit of the leaf's own done-criteria that is wrong" to A "under `test-proof-rules`"; no file defines it (A,C); it is a closed leaf slug (`issues/closed/pre-written-tests/test-proof-rules`) (A).
- `implement-issue` Shared context: a red criterion "is never handed off as pre-existing, base red"; with the command in the criterion the operator stop is the only exit (A,B,C).
- `check-issue` check.repair: B repairs every Fix except a locked brief change and "any correction of a test expectation", and may change no other plan text (A,B).
- `check-issue` check.review already rejects skipped, filtered or disabled planned tests (C).
- Lesson `learnings/history/2026-10-16-review-test-command-equivalence.md`: compare with the configured runner first; never weaken required checks (A,B,C); can retire into this rule (A,C).
- #105: plain `bun test` on 3 files, same 9 failures base and head; repo runner `--isolate` passes; operator edit changed only the flag (A,B,C).

## Pitfalls
- A swap passes by observing less: the same named tests and cases still run, a deliberate break still turns new-behavior proof red, B checks it (A,B,C).
- Base red used as an excuse: the criterion's own result must still be shown passing; configured `checks` keep the known-red path (A,B,C).
- Flake shopping toward green: correction only toward the configured runner, with the diff-cause judgment (C).
- Product invocation mistaken for proof plumbing: an invocation that is the behavior stays locked (B,C).
- A correction widens a live or paid action: grants unchanged; widening is an operator stop (B,C).
- Old stop wording left behind: replace the ambiguous wording at chart audit, synthesis, implement, review, repair and merge (B).
- Configured `checks` treated as plan-owned: they stay repo-owned (C).

## Open questions
- Q1 Define the rule once and point the three citations at it, retiring the lesson (A,C)?
- Q2 Mechanical guard in `akrogon` against commands in criteria (C asks; A rejects)?
- Q4 Repo with no configured runner for a criterion: planner judgment reviewed by B (C).
- Q5 Bound corrections per criterion (C)?

## Where slots differ
- Mechanical guard: A rejects, C asks, B silent.
- In-flight literal commands: B allows only when the outcome stays unambiguous; C treats every runner command as proof, the equivalence guard being the judge.
- Correction direction: A,C only toward the configured runner; B prefers it but allows another valid invocation.

## Rebuttals

- B: "prefer", not "only", configured runner (recorded under Options and differences); the direct route has `<chart>/direct/plan.md` (implement-issue Direct form), so the door owns the command there with B reviewing; Q3 removed.
- C: disputes B's in-flight qualifier (recorded under differences); audit-only option added; tag split applied.
