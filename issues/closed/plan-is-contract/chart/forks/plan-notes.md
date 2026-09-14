# Does an implementation-only constraint go into the plan?

## Question
Q8 · When B finds an implementation-only constraint before coding, does it go into plan.md?

### Carries
- Astra F2: "Put any implementation-only constraint missing from that contract there once before execution."
- plan-issue:59: the synthesis "resolves implementation choices without reopening locked scope".
- Locked decisions in design.md cannot change below the chart.

## Findings
- The plan is written at plan.synthesis and implement runs in a later session; B can meet a fact the plan lacks, for example a live interface that differs. Today it goes into the brief; without the brief it has no home.
- Research, practitioner: Addy Osmani, addyosmani.com/blog/good-spec, 2026-01-13, read 2026-09-14. "If you discover that the spec was incomplete or unclear, update the spec document." Made the plan the home.
- Research, practitioner: Birgitta Böckeler, martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html, 2025-10-15, read 2026-09-14. "I'd rather review code than all these markdown files"; agents ignored notes inside specs. Ruled out a separate notes file.
- Research, better-than-training: Claude Code best practices, read 2026-09-14. Implement "verifying against its plan"; deviate only by explicit decision. Shaped option B.

## Taken
Operator answer (2026-09-14): chosen as the recommended set with "Least complexity, everything stays. The implementation has to be detailed and according to the rules. Just remove redundancies." `8a`. B appends a dated `## Implementation notes` section to `plan.md` before coding, only when a constraint is missing, naming each constraint and the decision it refines. Locked decisions are refined there, never changed; a conflict with a lock is a mismatch recorded for review. Foreclosed: deviations recorded only in the report; a separate notes file.
