# Success measure, slot A

Baseline from `issues/log.jsonl`, computed 2026-09-30 (review→check.fix moves, first log entry to merged):
- framework: 225 merged, 94 review→fix rounds (0.42 per merged leaf), 82 leaves (36%) with at least one fix round, 36 rounds where only B said fix.
- akrogon: 74 merged, 9 rounds (0.12 per leaf), 8 leaves (11%), 3 B-only.

Q1. How is the rule visible in each review?
- 1a (rec) Every Fix in `review-<slot>.md` states its input source, its consequence today, and the criterion, check or gap it hits. A Fix without a source is a Nit by rule. Every new test in `implementation/report.md` names the criterion or Fix it proves. Judged by agents, no parser.
- 1b An akrogon command parses review files for those lines and rejects the verdict. Checks wording, breaks on phrasing, violates function-over-form.

Q2. How do we know it worked?
- 2a (rec) Recompute the baseline by hand at a later chart door after the next ~30 framework leaves merge: fix rounds per merged leaf, share of leaves with a fix, B-only fix rounds. Escaped bugs show up as new seeds naming a merged leaf. No new code.
- 2b Add an `akrogon stats` command. New feature beyond the requested scope.

Pitfalls: leaf mix changes between periods, so compare the same repo. Fewer fix rounds with more escaped-bug seeds means the bar is too loose.
