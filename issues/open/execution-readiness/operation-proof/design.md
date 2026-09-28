# Design: operation-proof

## Binding decisions, verbatim
From issues/chart/execution-readiness/forks/write-proof.md, Taken 2026-09-28, operator: "1a | 2a | 3a |"
- Q1-A: every external operation a brief names (API method and path, CLI command, launch flag) gets one real call with the identity the leaf will use, recorded in the fork with command, inputs, identity reference without secret values, version, date, observed result, cleanup result and what it does not prove. Writes use the smallest reversible call on a throwaway target with checked cleanup. No safe sufficient probe holds the handoff or narrows its scope. Needed credentials are in the consumer `.env` before handoff, not only before dispatch. Reason: #20, where GET-only probing and an unverified "I added the permission" let a missing write scope reach implement. Foreclosed: scope lists, docs, introspection or operator assurance as proof (B); a recorded waiver for unprovable operations (C).
- Q2-A: the charting agent runs the probes during the chart pass with the operator present; consumer probe scripts may be run as they are, chart-created scratch code is discarded, findings stay in the fork. Declining a probe holds the handoff. Reason: a probe leaf puts an unproven operation in a seat. Foreclosed: a probe leaf (B).
- Q3-A: a provider-native dry-run or validate call counts only for the property the provider documents it proves, run with the real identity and target; other assumptions need their own evidence; a sufficient no-write check is preferred. Foreclosed: always a real write (B).

Excluded: git-base decisions belong to leaf base-preflight, which owns the shapes.md sentence naming `akrogon preflight`. Off route: akrogon learns no service APIs; consumer probe repair (boulevard probe-ghl-scopes.ts) is not this leaf's.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md, interpreted: prose-only leaf. "Credential access alone never qualifies" as a human prerequisite stays true; the change is timing (credentials present before handoff). "Every secret lives in the consumer .env" is the identity source the probe uses. No vanity tests: tests/docs-links.test.ts scans only README.md and docs/guide (tests/docs-links.test.ts:75-86), so it proves nothing about these files; verification is the three-case audit and direct link check in done-criterion 6, with configured checks as regression only. Function over form: the skill states what evidence must exist, not a fixed template or wording.

## Leaf architecture
Owned: skills/chart-issues/SKILL.md, skills/chart-issues/assets/shapes.md (Preflight paragraph and implementer audit sentence), skills/chart-issues/assets/questions.md (Optional measurement).
Overlap: base-preflight edits the shapes.md Preflight paragraph too; the two leaves run in parallel and the later merge rebases.
Exclusions: no src change, no new verb, no service-specific recipe.
Dependencies: none.
