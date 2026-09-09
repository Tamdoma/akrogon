# Contract Fit

Chart skill version: 4

Status: resolved
Type: research

## Question

The checkout mixes two contracts: the chart handoff emits a consult-position state and standing-design still requires parking for operator-owned work, while lifecycle.ts knows only P-draft onward. List every place the intake contracts and the July 28 lifecycle disagree, with file and line, so # Skill Rewrite can settle one flow.

## Findings

Tier 2, codebase read on 2026-09-08. Full list with file and line: [contract-mismatches.md](../research/contract-mismatches.md). 38 mismatches in five groups. Changes # Skill Rewrite, # Turn Within Phase, # Distribution.

1. Phase vocabulary: intake emits `phase: consult-position`, lifecycle.ts throws on anything outside P-draft to D-merge, so every lifecycle skill's first command fails on an intake leaf. `created` is date-only on one side and git ISO on the other. `repo` and `priority` are dropped by the first transition write.
2. Files: intake emits brief.md, design.md, state.yaml. Lifecycle skills read planning/plan.md, a.md, b.md, implementation/plan.md. Neither side makes the other's files. create-issue forbids phase folders that consult-issue requires.
3. Series shape: flat SERIES-<slug>.md with plain leaf dirs versus nested <series>/SERIES.md, series state.yaml, and NN[ps]- marker dirs. The July 28 parser would misread the intake table.
4. Gates and tokens: July 28 has four operator gates, 30 run-status tokens, footers, pair.yaml, park.hold. Intake forbids all of them and has one approval at emission. `consult-election` in design.md has no consumer.
5. Stale mirrors: consolidate-issues' reference cites functions, keys and files that do not exist anywhere.

## Resolution

Two contracts, no bridge. The intake contract is the newer and the operator wants its doors kept, so the lifecycle side is what gets rewritten: phase vocabulary, file names, series shape and gate removal are all settled inside # Skill Rewrite, with the dump as its checklist. Research only, decides nothing beyond that. Foreclosed: patching lifecycle.ts to accept both shapes.
