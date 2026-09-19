# Foreign leaves: what next reports and whether the repo keeps dispatching

## Question
Q1. When a registered repo holds leaves whose `state.repo` names another registered key, does `akrogon next` print one aggregated line per repo per invocation, or keep one line per leaf?
Q2. Does a foreign leaf stop dispatch of that repo's own valid leaves, or do valid leaves keep dispatching while the foreign ones are reported?
Q3. Is detection walk-time only, or also refused at registration (`akrogon init`) when foreign leaves already exist?

### Carries
- No hidden watchdogs, clocks or polling (operator rule, 2026-09-18, `../seat-stall-detection/`).
- "Once" means once per invocation unless the operator asks for remembered state (B, K4).
- Off route: the framework merge that imported the tree, and consumer cleanup.

## Findings
- (A) Recommend one aggregated line per repo when every mismatch shares one stored key, naming the count, stored key and registered key; keep per-leaf lines when keys differ. Tier: inspected code, no outside source.
- (B) K2: summarize versus reject the whole repo are different scheduling outcomes and need the operator. K3: registration catches the inherited case only; a later merge needs walk-time detection. K5: aggregation does not prevent import.
- (both) Today `unreadable > 0` already makes `selectLeaves` return the repo without dispatch (`src/next.ts:567`), so a foreign leaf already blocks that repo's own leaves.

## Taken
Operator 2026-09-19, verbatim: "1a | 2a | 3a | question where is the git update on this issue where we add the second branch and ignore issues on main?".
- Q1: A. One structured line per repo per invocation naming registered key, count and each offending path with its stored key; per-leaf lines stay for other unreadable causes; exit status stays nonzero. Foreclosed: per-leaf lines for mismatches; one line per stored key.
- Q2: A. Valid leaves keep dispatching; a parsed foreign-key leaf is classified apart from unreadable state so it is reported, skipped, and does not count toward max_active; foreign leaves stay out of dispatch, cleanup and dependency lookup. Foreclosed: blocking the repo.
- Q3: A. Walk-time detection only; init unchanged. Foreclosed: registration refusal.
- The operator's question about the framework update (second branch, ignore issues on main) concerns the import mechanism, off route in CHART.md with owner: the framework repo's update workflow.
