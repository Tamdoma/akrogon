# Blind fork round for peer B: union-rollout

You are peer B on a new chart in akrogon (/home/ivan/Work/infra/akrogon). This is a new chart, separate from closed-chart-drafts. Work independently. Do NOT read `issues/chart/lessons-merge-conflicts/INTAKE.md` (its Agent findings are A's), `CHART.md`, `forks/`, or any other file under `slots/` except this prompt. Read-only: do not edit any repo files except your output file.

## Intake
Read the GitHub report verbatim at `/home/ivan/Work/infra/akrogon/issues/seeds/40-gacp-rebase-conflicts-on-learnings.md` (Tamdoma/akrogon#40).

Registered repos (from `akrogon config`): akrogon, framework, pi-extensions, mdcny-ghl-data-pulls, boulevard-automation, clinique-la-roya, lens, Himne, lingua-relay. Resolve roots with `akrogon config`.

## Questions (one fork, all presented together)
Q1. How should `learnings/LESSONS.md` stop conflicting on rebase?
Q2. Should `issues/log.jsonl` get the same merge rule?
Q3. How do the registered repos without the rule get it?

### Carries
- Seed workaround: `learnings/LESSONS.md merge=union` in `.gitattributes` and `.git/info/attributes`. Framework has both.
- `akrogon init` owns ignore entries and LESSONS.md scaffolding (skills/init-akrogon/SKILL.md:76).
- A leaf branch carries code only and cannot touch `issues/` (src/phase.ts:257-263). A leaf works in one repo only.
- Skill format rules: /home/ivan/.claude/skills/chart-issues/assets/questions.md (round shape and research tiers).

## Your task
Research independently: inspect the live code, git history of the registered repos, git documentation, and outside practitioner sources (tier order in questions.md). You may run experiments only in a scratch directory under /tmp that you delete afterwards. Then write a full operator round for Q1-Q3 in the questions.md shape: opening paragraph, each question with plain context, a Research line (tier, source with path/URL and date, finding, what it changed), options with one recommended and its reason, Pitfalls, reply key, and Challenge check. Add any material question or fork you think is missing, and state your evidence.

Write the result to exactly:
/home/ivan/Work/infra/akrogon/issues/chart/lessons-merge-conflicts/slots/union-rollout-B.md
