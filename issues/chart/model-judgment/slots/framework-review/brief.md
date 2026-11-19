# Brief: why deterministic checks keep smothering model decisions

Work blind. Do not read the other consultants' files. Read records only, never your own memory.

## Operator question, verbatim
"Where is the systemic problem? Why does this keep happening when we build out with AcroGon and with the framework? Where is the systemic issue? Look at it from the systems architected, systems thinking perspective. What are the loops, either reinforcing or balancing Those are actually making these kinds of tests all the time. I don't want the deterministic code to suffocate agent decisions. This is not supposed to happen because the tests will never pass that way, or at least they will suffocate the flow. Seed everything that needs to be seeded, either here or in Akrogon or both."

Operator decision on the latest case: "There should be no slop checks and tests." and "Everything that the model needs to decide should be loose, and not suffocated by endless tests."

## Latest case (serp-wireframing / wireframe-skill-revamp)
- F3: the capture driver advanced by matching model wording ('prep-evidence THIN_READ').
- F4: count rules stood in for model quality calls. Thin read meant fewer than `thin_min_usable_page1` usable competitors. A topic was banned when punished on more than half of a stem's pages. A long-excerpt match was refused. A hero heading_directive was refused.
- F5: a blocking THIN_READ prep gate stopped and asked the operator "good enough" per page.
- Records: /home/ivan/Work/infra/tamdoma/framework/issues/chart/serp-wireframing/ (forks, slots, CHART.md) and issues/open/serp-wireframing/wireframe-skill-revamp/{brief,design,plan}.md. The amendment is in design.md "loose judgment (2026-11-17)".

## What to find
1. The loops, reinforcing (R) and balancing (B), that produce these checks. Cite where each loop lives: which step of chart-issues, plan-issue, implement-issue, check-issue or merge-issue, which rule text, which file:line. Akrogon skills are under /home/ivan/Work/infra/akrogon/skills/. Read chart-issues/SKILL.md, chart-issues/assets/{shapes,standing-design,questions,autopilot}.md, check-issue/SKILL.md, plan-issue/SKILL.md, learn-issues/, and the lesson rule. Framework lessons are in /home/ivan/Work/infra/tamdoma/framework/learnings/.
2. Evidence from at least two other charts or leaves in the framework (issues/chart/*, issues/closed/*) where the same pattern appeared. Examples: a model decision turned into a script threshold or refusal, a text match on model output, an operator stop added for a quality call.
3. The missing balancing loop: what should push back, and where it should live.
4. A concrete fix: rule text changes per file (akrogon and/or framework), with the leverage point named. Prefer removing a mechanism over adding one. Say which part belongs in akrogon, which in the framework, and which in both.

## Output
Write /tmp/claude-1000/-home-ivan-Work-infra-tamdoma-framework/2a6e2c2c-fbec-47a6-aedf-7cd9add6587e/scratchpad/systemic/<your slot letter>.md with codes: L1.. for loops, E1.. for evidence (path:line), G1.. for gaps, X1.. for fix items (file, current text, proposed text, why). Keep it under 150 lines.
