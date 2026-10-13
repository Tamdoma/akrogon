# Review A — timing-events

Base: `df8868911100bf863224f71a51e70bb489d3b5d9`
Reviewed head: `bdd450084628c4dbb8647052fea8e00085303ef4` (9 commits)

## Evidence

- `bun test tests/timing.test.ts --timeout=120000` on the reviewed head: 5 pass / 0 fail — all five done-criteria proven by the planned file.
- `checks.test` 848 pass / 0 fail (81 s), `checks.test_changed` 679 / 0 (61 s), `checks.typecheck` and `checks.format` exit 0, per implementation/report.md; suite output re-verified by this seat's own `bun test tests/timing.test.ts` run above.
- `git diff df88689..bdd4500` read in full: `src/timing.ts` new, call sites in `next.ts`, `phase.ts`, `run-check.ts`, `pause.ts`, `park.ts`, docs + tests.
- AREA.md path check: `src/timing.ts`, `tests/timing.test.ts`, `docs/guide/files.md` all exist; `src/AREA.md` is exactly 40 lines with the four required sections.
- `Test-Change` trailers: `tests/timing.test.ts` cite is a corrected expectation for the parked-dep refusal (real behavior change avoided, not an expectation change — acceptable), `tests/AREA.md` cite is the trailer-only doc commit.
- No docs-page behavior claims broken: `docs/guide/files.md` adds the `timings.jsonl` section matching the implemented writers; the `wait` line's "akrogon next or akrogon park" matches D3.
- Plan/design adherence: D1–D12 as implemented match plan.md and the appended Implementation notes; `src/turn.ts` untouched; `log.jsonl`/`src/log.ts` unchanged; `readTimings` and `visitOf` exported for timing-readout; no reader output or status changes (excluded surfaces respected).

## Fixes

None found.

## Nits

- N1. `readTimings` and `recordWait` parse the entire `timings.jsonl` on every `dispatchLeaf` call (the `visit_start` guard plus up to two more reads per wait/completed path). Unbounded file, O(file) per dispatch. Deferred: documented ceiling, append-only record stays small until timing-readout's volume grows it; promotion evidence = dispatch visibly slowing on a repo with tens of thousands of timing rows.
- N2. `readTimings` warns and returns `[]` on any read failure, so a corrupt line is only a stderr warning and the `visit_start` dedup guard may silently re-derive on an unreadable file. Deferred: needed for criterion 5 (`next` must complete when the file is unwritable), and loss detection is explicitly `log.jsonl`-based in timing-readout; promotion evidence = a corruption case where the silent re-derivation produced a wrong event.
- N3. Worker-scope detection trusts any toplevel basename ending `-u<N>` that prefixes a leaf slug; a hand-made dir could misattribute a check to a unit. Deferred: consequence is a mislabeled diagnostic row only; promotion evidence = such a directory actually colliding in a repo.
- N4. `dispatchMergeLeaf`'s non-automatic branch calls `dispatchLeaf` outside the global lock, so `recordWait`'s read-modify-append can race a concurrent pass and double-write a wait boundary. Deferred: same-race pre-exists in state saves along this path, consequence is a duplicate timing row; promotion evidence = observed duplicate waits from real concurrent dispatch.
- N5. `visit_start`'s `currentVisit`/`readLog` calls live inside `commitMove`'s `logMove` try block, so a `log.jsonl` parse failure surfaces as `log append failed` and a timing append failure inside it is also folded into that error text. Deferred: consequence is mislabeled error text only, no wrong state; promotion evidence = an operator misreading one of those errors as a log problem.
- N6. `mergeTurn` writes the `batch` event with `slug: holder.state.slug` only, so members' own timelines lack a batch record; the brief attributes the event to the attempt record, which is holder-scoped. Deferred: consistent with the brief's event text; promotion evidence = timing-readout needing per-member batch rows.

## Verdict

nits

## Operator actions

None.
