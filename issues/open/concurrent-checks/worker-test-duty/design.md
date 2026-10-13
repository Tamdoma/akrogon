# Design: worker-test-duty

## Binding decisions, verbatim
### Worker duty (forks/worker-duty.md)
Operator 2026-10-13, verbatim "1a, 2a, 3a, 4a, 5a". Round notes slots/ship-{A,B,C}.md, merge slots/ship-merged.md, rebuttals slots/ship-rebuttal-{B,C}.md.
Taken: workers run targeted tests only; A owns changed-tests and phase-end checks. Edits worker-protocol.md, brief-template.md, implement-issue SKILL.md. Implements load-guard "workers do not run the full check".

### Long-run path (forks/long-run-path.md)
Operator 2026-10-13, verbatim "1a, 2a, 3a, 4a, 5a". Round notes slots/ship-{A,B,C}.md, merge slots/ship-merged.md, rebuttals slots/ship-rebuttal-{B,C}.md.
Taken (merge, no B objection to the skill form as interim): skill-level background pattern now, implement-issue SKILL.md:45 names it. Detached run-check mode off route until the run-unit leaf exists and the pattern is seen to fail.

### Evidence (forks/evidence.md)
Operator 2026-10-13, verbatim "1a, 2a, 3a, 4a, 5a". Round notes slots/ship-{A,B,C}.md, merge slots/ship-merged.md, rebuttals slots/ship-rebuttal-{B,C}.md.
Taken: close with one sentence in check-issue SKILL.md:55,61 as above. No validator.

### Excluded
Guarantee, load-guard, dispatch-wip, cross-leaf-kill, ceiling-trigger: no surface here (owned by memory-start-check and run-units, or done on main).

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: tests prove done-criteria at the real boundary (CLI and real systemd/cgroup files where possible, fake cgroup root only for threshold states that cannot be made safely); one deliberate break per new behavior turns its test red; no wording tests on skill prose; no new proof machinery.

## Leaf architecture
Owned: skills/implement-issue/{SKILL.md,worker-protocol.md,brief-template.md}, skills/check-issue/SKILL.md, and any docs/guide line that restates the worker command (find with grep for "test_changed" and "changed-tests" under docs/ and skills/). Not owned: src/, the pattern-kill paragraphs from 873db4e (run-units rewrites those), merge-issue.
Interfaces: none in code. One rule per location; no restating the same rule in a second file except where the file is a seat's only instruction (worker-protocol for workers, implement-issue for A).
Proof: review the prose by meaning, no wording tests (standing design). The background form is proven at charting (readiness proofs, forks/long-run-path.md); the leaf states that exact form. The `test` check covers existing skill tests. (B)
