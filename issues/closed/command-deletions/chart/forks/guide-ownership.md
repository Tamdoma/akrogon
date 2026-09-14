# Who deletes the guide sentences describing removed machinery?

## Question
Q5 · Does this leaf delete the guide, skill and test lines that describe the stand-in, per-repo `max_active` and the `debate` key, or are they left for later docs work?

### Carries
- Lesson 2026-09-11 stale-rule-in-docs: grep `docs/` for a changed rule and own or report the hit.
- Off route: the docs consolidation (Astra F5) is not charted.

## Findings
- Lines: docs/guide/phases.html:74 (why box, stand-in), problems.html:60 (attempts row), next.html:65 (per-repo clause), setup.html:65, cheat.html:89, state.html:62 and :80, create.html:81, skills/check-issue/SKILL.md:31, skills/chart-issues/assets/shapes.md:155 and :160. README.md has none.
- `recoverMerge` and the hook path have no guide sentence. problems.html:61 (`phase: failed` row) names the general exit under Q2-A.
- Each hit is a sentence or clause deletion, not a rewrite. Under B the guide keeps telling operators to expect a stand-in that no longer exists.

## Taken
Operator answer (2026-09-14): `5a`. The leaf deletes the guide and skill lines that describe deleted machinery, including chart-skill template lines, which is the operator's permission for those edits. Foreclosed: leaving them for later docs work. The `debate` lines (state.html:62 and :80, create.html:81, check-issue:31, shapes.md:155 and :160) stay if the debate-key fork keeps the key.
