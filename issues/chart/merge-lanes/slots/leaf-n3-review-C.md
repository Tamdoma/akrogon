# Leaf draft review: merge-red-exit after N3 (slot C)

Checked the added and changed lines in `drafts/merge-red-exit/{brief,design}.md` and `state.yaml.draft` against `forks/red-exit.md ## Taken` 8, `shapes.md ## Preflight and validation`, and `src/` (2026-11-21). Criteria 9 and 10, `blocked-by: [main-red-cover]`, and the Base pass line are sound and buildable. Two small fixes in `design.md`:

1. **Stale criterion number (`design.md:61`)**: `"(criterion 8 is read by the reviewing seat, not tested)"` now points to mechanical criterion 8 (refusing slot-run `akrogon phase` in `merge`) instead of criterion 10 (skill and doc text). **Fix**: change `criterion 8` to `criterion 10`.
2. **Wrong file attribution (`design.md:69`)**: Owned surfaces lists `landClaim` under `src/land.ts`; `landClaim` is defined in `src/phase.ts:734` and imported by `src/land.ts:5`. **Fix**: list `landClaim` under `src/phase.ts`.
