# Opening map brief: slot B

You are slot B, a charting peer for the chart-issues door in /home/ivan/Work/infra/akrogon. Slot A (the door) is mapping the same intake independently. Do not read A's map. Do not edit any repository file. Read only.

## Task

Write an independent territory map for the intake below and save it to exactly:

/tmp/claude-1000/-home-ivan-Work-infra-akrogon/e2551340-ff8a-4098-ad7e-ed1082627d93/scratchpad/chart-open/map-B.md

The map is proportional to the work and covers:
1. Destination: the observable outcome you think the chart should aim at, in one or two sentences.
2. Material forks: each decision that changes the outcome, with the options you see, your pick and reason, and what each option could break or invite later over the work's lifetime, not only now.
3. Practitioner questions: what an experienced practitioner would ask here. Name outside sources (people or teams with a track record on flaky tests or test quarantine, primary docs such as bun test flags) with URL and date read, or record the search that found nothing stronger.
4. Pitfalls: each trap and what removes it.
5. Off route: what you would exclude and why, especially against the existing locks below.
6. Evidence: every claim about this repo cites path:line you inspected. Mark low-confidence items.

## Intake (verbatim)

/home/ivan/Work/infra/akrogon/issues/seeds/86-a-changed-test-that-fails-under-load.md (Tamdoma/akrogon#86). Read it in full.

## Live surface

- /home/ivan/Work/infra/akrogon/src/phase.ts (requireTestChangeCitations near :505, requireFrozenCitations near :547, call sites near :385, :387, :636, :642)
- /home/ivan/Work/infra/akrogon/src/config.ts (:50-103, checks, merge_checks, merge_covers)
- /home/ivan/Work/infra/akrogon/docs/guide/merge.md, docs/guide/phases.md
- /home/ivan/Work/infra/akrogon/skills/merge-issue/SKILL.md, skills/check-issue/SKILL.md, skills/implement-issue/SKILL.md, skills/plan-issue/SKILL.md
- `akrogon config` in /home/ivan/Work/infra/akrogon (note `checks.test_changed`) and in /home/ivan/Work/infra/tamdoma/framework (the consumer that hit this)
- The framework repo /home/ivan/Work/infra/tamdoma/framework, commits fb2024e0f, 349c15739, 58df9333c, if you need the concrete case

## Existing locks (from handed-off charts; read the linked forks if a pick touches them)

- issues/chart/agent-test-rules (forks/test-change-check.md): built-in test path rule (10a); `Test-Change: <path> <why>` trailer per changed test file (11a); check-only run before merge push (12a). Seats change an existing expectation only with a cited source.
- issues/chart/test-runs: heavy-run slot ruled out 2026-10-02; reopen only on a traced load failure. A leaf is stopped as red on base only from a completed, comparable base run.
- issues/chart/merge-load-flakes: named framework flakes go to the framework merge-gate chart; the command records PSI totals per merge attempt; heavy-run slot and lower max_active rejected until load is traced.
- issues/chart/check-reruns: leaves run every `checks` command before review and after repair; `merge_checks` run only at merge.
- issues/chart/framework-test-scope (open, destination framework): framework owns affected-test selection and the full suite before release.

Return only the file. When it is written, your turn is done.
