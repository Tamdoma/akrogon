# Opening map brief — slot B

You are slot B, a consultant to the chart door (slot A) in repo /home/ivan/Work/infra/akrogon. Work independently. Do not read any other slot's map. Do not edit any repo file.

## Reading rule
Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it, and content lost to compaction stay readable. The full source is allowed when the source is the subject of the work (here the docs, README and their subjects are the subject). Reads name sections, never line ranges. Process text definitions live in /home/ivan/.claude/skills/chart-issues/assets/questions.md (section "Blind peer exchange" defines notes) if you need them.

## Intake (operator words, verbatim)
## Intent
- We need to make the Aprogon documentation much better. Right now it's all over the place. I need it to be very noob friendly, and I need it to build up from the first principles so that people who are using it know exactly what to do at what point of time.
- The right info has to come at the right place, so we need to map it all out.

## How I think it should look like
- First of all, I think it needs to start with the basics. We need to explain what the whole software factory is and we need like a diagram on how it works.
- Look at the way I was using this repo in the past 2-3 weeks. This has been my optimal workflow so far.
- We also need to update the documentation with all the new features, but make them digestible for human beings. Make it very noob friendly. Very noob developer friendly. Also pay attention to the autopilot mode as one of the new features, but we need to talk about all of them.
- We need a proper architecture on how to actually build out the entire documentation so that it's easy to update later on, but it needs to be very newbie friendly. And all of the concepts have to build out on top of each other. Plus we need to have some real life use cases on how we are using it across the board when building stuff with the factory.
- Explain it all in a very easy and simple and easy to understand way and also address the first principles on why and how something works. This is not built for hardcore developers only. It's built for all people who want to build something.

## Output design
- A better readme file and the entire documentation on GitHub.
- We need SVG animations, but only to make them useful for individual users, not just for the sake of having them.
- These SVGs will also explain the concepts better.

## Later operator note (verbatim)
Use slot a and slot b to consult, and also, you will set up the slot a during the implementation mode to be claude opus 5.5 medium for all issues.

## Live surfaces
- /home/ivan/Work/infra/akrogon/README.md
- /home/ivan/Work/infra/akrogon/docs/guide/*.md and docs/reference-index.md
- skills under /home/ivan/Work/infra/akrogon/skills/ (and installed copies under ~/.claude/skills/), src/AREA.md, src/*.ts command surface
- issues/chart/*/CHART.md (feature history, e.g. autopilot, direct-mode, door-handover, chart-peer-panes, fresh-consultants), issues/closed/, learnings/LESSONS.md
- Operator usage evidence of the last 2-3 weeks: git log since 2026-10-01, chart records, ~/.claude/projects/-home-ivan-Work-infra-akrogon/ transcripts, other registered repos in `akrogon config` repos (framework, P2, varhop) that used the factory
- GitHub rendering limits for README/SVG (animated SVG via SMIL/CSS in <img>, no JS, dark/light mode)

## Existing locks
- Implementation seat A for every leaf of this chart: harness claude, model claude-opus-5-5, effort medium (slots front matter at handoff).
- Charting consultants: A (door) and B (you).

## Task
Write a proportional territory map: the material forks that change the outcome (structure/architecture of the docs, audience and reading path, what goes in README vs guide, SVG approach and tooling, how docs stay current as features change, use-case sourcing, how to split the work into leaves), questions a practitioner would ask (name practitioners/sources: e.g. Diataxis, well-regarded OSS docs, with URLs and dates read), and pitfalls over the docs' lifetime: what each option could break or invite later, not only now. Ground every claim in an inspected path or a named source. Mark low-confidence items. Note the current docs' concrete defects you found (path + what is wrong) and features that exist in code/skills but are missing or stale in the docs.

Return: write the full map to the exact path /tmp/claude-1000/-home-ivan-Work-infra-akrogon/1c9d0b48-0ab4-43c9-be91-a873141eb04d/scratchpad/door/map-B.md, then end your turn.
