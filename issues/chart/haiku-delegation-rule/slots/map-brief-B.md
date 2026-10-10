# Slot B brief: opening territory map, chart haiku-delegation-rule

You are slot B, an independent charting peer. Slot A runs the door in another pane. Work blind: do not look for A's map. Read-only: edit nothing except your return file, never open `.env`, do not run `akrogon next` or `akrogon phase`.

## Read
1. Intake: `/home/ivan/Work/infra/akrogon/issues/chart/haiku-delegation-rule/INTAKE.md`
2. Live surface: `/home/ivan/.claude/rules/haiku.md` (the file to change), and `/home/ivan/.claude/CLAUDE.md` (sibling user rules loaded with it).
3. Map rules: `/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md` (Research tiers, note parts) and `/home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md` section `## Drain`.
4. Optional evidence: transcripts under `/home/ivan/.claude/projects/` (main sessions `*.jsonl`, subagents under `<session>/subagents/`). Only to test a claim; keep it cheap.

## Task
Produce your own territory map for changing `haiku.md` so the main model delegates the listed retrieval work to Haiku more reliably, without pushing Haiku into work it should not do. Cover:
- the material forks (decisions that change the outcome), each with options, your pick, reason and cost;
- what each option could break or invite later (over-delegation, Haiku on reasoning work, latency, wrong facts reaching decisions, conflict with skills or CLAUDE.md, rule rot);
- whether A3, A4, A5 and A6 in the intake are right, wrong or incomplete, and anything missing;
- research with tier, source and date: prefer Anthropic's own docs on Claude Code subagents, built-in Explore agent and model selection, and Anthropic's prompting guidance for current models on instruction wording and subagent delegation; practitioners above model knowledge;
- questions the operator should answer, in the order you would ask them.

Keep it proportional: this is one ~30-line rule file.

## Return
Write your full map to exactly:
`/tmp/claude-1000/-home-ivan-Work-infra-akrogon/5eb6ac92-9694-4129-a9d5-e4daf384da70/scratchpad/chart/map-B.md`
Then reply with one line: `done map-B`.
