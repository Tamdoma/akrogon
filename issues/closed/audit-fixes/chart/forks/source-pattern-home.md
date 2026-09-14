# F7: where the GitHub source pattern lives

## Question
Q2. May the leaf edit `src/pull.ts` so both the state schema and `closeSource` share one exported source pattern?

### Carries
No existing locks. Note scope lists `src/state.ts`, `src/config.ts`, `src/next.ts`, `src/phase.ts` and their tests.

## Findings
(both) The regex is a private literal inside `closeSource` at `src/pull.ts:110`. `pull.ts` already imports from `state.ts` (line 6), so `state.ts` cannot import from `pull.ts` without a cycle. The single-definition option is: export the regex from `src/state.ts`, use it in `stateSchema.sources`, and have `closeSource` import it. That touches `pull.ts`, outside the note's four files.
(both) Alternative: copy the literal into `state.ts`. Stays inside the file list, but two copies of the grammar drift.
(B) Keep the exact existing grammar: `owner/repo#positive-number`, no trimming, no uniqueness, no network lookup. Keep `SourceError` in pull for runtime gh failures.

## Taken
Operator answer: `2a`, 2026-09-14. Export the source pattern from `src/state.ts`, use it in the state schema, and import it in `closeSource` in `src/pull.ts`. Reason: one grammar in one place. Foreclosed: duplicating the literal.
