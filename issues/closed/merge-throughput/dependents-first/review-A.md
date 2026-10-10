# Review A: dependents-first

Base: `2e78945849eed87c42abd56f224909f4d2050b36`. Reviewed head: `e8d876833546540257740aec6c377525e2c0d388`. Mode: delegated implement, initial blind review.

## Evidence

- Read: `plan.md` (+ appended Implementation notes), `design.md`, `brief.md`, `implementation/report.md`, full diff `2e78945...e8d8768` (8 files).
- Implement-run checks, rerun at head by reviewer reasoning plus worker evidence: `bun run typecheck` pass; `bun test --timeout=30000` 608 pass 0 fail; `bun test --changed=$AKROGON_BASE` 47 pass; docs-links pass.
- Deliberate-break evidence per unit (count key, batch key, merged filter, sweep key each redden their criterion test).

## Verification against criteria

- C1/C2/C3: `mergeQueue` comparator is exactly batch → `dependentCounts` desc → unchanged `time`/slug chain. `dependentCounts` builds edges only between `phase !== 'merged'` leaves, DFS with a `seen` set; merged leaves get no incoming edges (dependents adjacency has no merged values) so their count is always 0; self-cycles count 0 via seeding. `phase.ts` holder refusal and `status.ts` TURN inherit order unchanged. Status-driven tests prove all three at the CLI boundary.
- C4: `sweep` keeps merged-first, adds count-desc, stable sort preserves prior visit order; counts computed over `discover(repo, invocation).leaves` (full repo, not swept subset). Prompt-order test proves the `next --all` boundary.
- C5: TURN cells exercise `akrogon status`; `merge.md`/`next.md`/`state.md` wording verified in diff `a84ee97`; `limits.md` and `skills/merge-issue/SKILL.md` checked — no ordering claims to update.
- C6: all `checks` green at head.
- Docs sweep: `src/AREA.md` and README carry no merge-ordering claim — no documented behavior changed there beyond the three edited guide files. No AREA.md touched in the diff.

## Findings

Verdict: `nits`. No Fix.

- N1: `tests/dependents-first.test.ts` last test asserts `merge.md`/`next.md` `toContain('blocked-by')`/`toContain('transitively')` — prose-wording coupling, exactly the kind of check the review bar discounts. Deferred: it does not fail today, removing it leaves C5's doc half with no automated pin, and a stricter test (rendered wording) would couple harder. Promote to Fix if a doc rewrite drops either term while keeping the behavior undocumented.
- N2: `implementation/report.md` references `report-u1/u2/u3.md`, which lived inside the deleted worker worktrees and are unreachable. Deferred: the substance is folded into report.md and plan.md Implementation notes; the dangling names are cosmetic. Promote to Fix only if review traceability requires the raw worker transcripts.
- N3 (process, recorded, no code action): `plan.md` lacked the dated `## Implementation notes` for the F1 fixture repair; appended this pass.

## Test-Change trailers

- `a2b48ea`: trailers for `tests/batch-dispatch.test.ts` and `tests/pause-next.test.ts` — correct, cite the ordering change as the source; no existing expectation changed.
- `e8d8768`: trailer for `tests/dependents-first.test.ts` — harmless extra on a new file; names what was added.

## Operator actions

None.
