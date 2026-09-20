# Seat override shape

## Question
Q1 Does a repo override a whole seat {harness, model, effort}, or single fields?
Q2 Selection of harness/model/effort only, or extra per-repo launch flags too?

### Carries
Locks: defaults unchanged for repos without the field; no new phase, command, watcher or file; harness templates, install and max_active stay global.

## Findings
Q1 (both): a seat is one strict triple at src/config.ts:9 and launch uses all three at src/next.ts:218-224. Whole-seat override reuses the schema and one lookup per seat. Field merge risks a harness swap inheriting a foreign model.
Q2 (both recommend selection only): install keys on harness names at src/install.ts:51, so any installed harness is selectable. (B rebuttal, accepted): flags would need an argument-composition rule, not install scanning.
Settled by evidence: one shared resolver serves `akrogon config` and launch (both); harness key validated against the global registry at init and before dispatch allocates (B); override applies at next agent start, running seats untouched (B); init-issues preserves a stored override and never writes inherited values (B).

## Taken
Q1: "1a" (2026-09-20). Whole seat. Foreclosed: field-level merge.
Q2: "2a" (2026-09-20), after an explanation of pick vs template. Selection only. Foreclosed: per-repo launch flags.
