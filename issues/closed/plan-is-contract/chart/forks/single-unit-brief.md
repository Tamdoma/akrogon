# Does a one-unit delegated leaf still get a worker brief?

## Question
Q9 · Does a delegated leaf with one unit still get a worker brief?

### Carries
- Operator scope: "Worker sub-briefs and the report stay."
- Astra F2 "What breaks": a worker needs all binding facts for its scope, not an unexplained pointer.
- brief-template.md line 5: one unit uses `implementation/brief.md`, several units add `brief-N.md`.
- All three registered repos run `implement: subagents`.

## Findings
- Framework used sub-briefs in most of its 96 leaves (158 files), akrogon in 9 of 37 (19 files), pi-extensions in 1 of 5. A one-unit delegated leaf today hands the worker the whole-leaf brief; with it gone the worker gets a sub-brief or `plan.md` itself.
- Research, practitioner: Anthropic, "How we built our multi-agent research system", anthropic.com/engineering/multi-agent-research-system, June 2025, read 2026-09-14. "Each subagent needs an objective, an output format, guidance on the tools and sources to use, and clear task boundaries"; imprecise delegation made subagents duplicate work. Made the sub-brief mandatory in delegated mode.
- Research, operator: Astra F2 "What breaks", read 2026-09-14. Binding facts, not a pointer. Shaped the pitfall.
- Standalone (implement-issue:55) has no leaf and no plan; its task brief comes from the same template.

## Taken
Operator answer (2026-09-14): chosen as the recommended set with "Least complexity, everything stays. The implementation has to be detailed and according to the rules. Just remove redundancies." `9a`. Delegated mode always writes one sub-brief per unit from the eight-section template, one unit included. Inline mode writes nothing. The template's opening paragraph drops the whole-leaf brief and keeps the sub-brief rule; standalone keeps its task brief from the template. Foreclosed: handing a worker plan.md with the command in the prompt.
