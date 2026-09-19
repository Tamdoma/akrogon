# Round 2 A: classification and rewrite policy

## Research
- practitioner · mager.co "Software Factory: The End Goal of Agentic Engineering" (2026-03-19, read 2026-09-19): "an agentic system that can receive a specification and autonomously produce working, deployed, tested software with minimal human intervention"; four subsystems: intake, orchestrator, execution layer, feedback loop; level 4 on a maturity ladder; "a pipeline runs once, a factory learns"; human stays as product owner.
- vendor primary doc · factory.com "What is a software factory" (read 2026-09-19): a continuous loop, not a static pipeline; four properties: standardized inputs, standardized tooling, measurable output, replayability.
- vendor · augmentcode.com, truefoundry.com, encore.dev, faros.ai definitions found by search, same shape: fleet of agents, defined pipeline, quality gates, human sets intent and reviews.
- primary code · src/next.ts, src/phase.ts, skills/*, plugin/herdr-plugin.toml, learnings/LESSONS.md, issues/log.jsonl.

## Classification (A)
Akrogon matches every subsystem in mager's definition at single-operator scale: intake (issues/seeds via `pull`, chart-issues into leaf contracts), orchestrator (state.yaml + `next` + the herdr hook), execution layer (two seats running phase skills in worktrees), feedback loop (review→fix rounds, lessons recorded at merge, log.jsonl). Against factory.com: standardized inputs yes (brief/design/state), standardized tooling yes (same checks for every leaf), measurable output partly (log.jsonl records head, diff, attempts, fix_rounds, no cost or cycle time), replayability partly (prompts are skills in git, model in config, sessions in herdr). It stops at merge: no deploy, no monitoring. Honest one-liner for README: "Akrogon is a small software factory for one operator: you write what you want, two agents plan, build, review and merge it, and a file on disk is the only state." Call it a factory, name the stop at merge.

## Q1 · How do we classify it on the README?
A (recommended) "a small software factory for one operator", with a two-sentence definition and the stop-at-merge boundary in the intro. Newbies searching the term land on the right mental model.
B avoid the term, describe it as "an issue lifecycle through paired agents" as README does now. Precise, but the reader has to build the model from scratch.

## Q2 · How much rewrite?
Inspected stale facts: parts.html:72 "A is Claude, B is Codex" (config.yaml: both pi/devin, and the guide should say slots are configurable); idea.html:59 same; phases.html failed row says "send it back with implement" (routing allows any phase); problems.html:60 and state.html:83 attempts cap (src/next.ts:386 says 3, still true); sync claim in three places. Structure: 7 of 17 pages have a "why" box, 10 have none; in-practice has none of the first-principles explanation the operator wants.
A (recommended) rewrite every page against src/ and skills/ as the source of truth, in a fixed page shape: what it is (first principles, why it exists), how it works (the mechanism with the file or command), in practice (one concrete walk-through), then pager. Conversion becomes a byproduct of the rewrite, one leaf, ~7,200 words in, similar out.
B convert as is, then a second leaf rewrites pages one by one. Two diffs, the first ships stale text under a new format.

## Q3 · Who is the reader, stated where?
A (recommended) one sentence at the top of README naming the reader: "you already run coding agents and want a system that runs them for you". Every page is written to that person: no explanation of what an agent, a PR or a worktree is; every akrogon term explained at first use.
B no stated reader. Pages drift between expert shorthand and hand-holding.

## Q4 · Truth check
A (recommended) done-criterion: every command, flag, phase name, config key and file path in the pages exists in src/, config.yaml or skills/ (grep list in the report); the sync, slot-vendor and failed-recovery facts corrected.
B prose review only.

## Split (A)
Still one leaf. The rewrite is the conversion. Splitting rewrite from conversion doubles the README and pager churn for no independent check.

## Pitfalls
- A rewrite with no truth anchor invents behavior; the truth check is the guard.
- "Newbie" here is not "non-programmer"; over-explaining git to the stated reader is drift the other way.
- Page shape must not become a template that pads thin pages (cheat sheet stays a sheet).
