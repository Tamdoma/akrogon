# Implementation report — Brief 4

## Criteria coverage

1. `--reason ' '` and `--reason ''` refused, `state.yaml` unchanged — covered in `tests/phase.test.ts` (`failed routing and reason misuse are guarded`, blank/empty cases assert nonzero exit and unchanged bytes). Pass.
2. `--reason '  real reason  '` succeeds and stores `real reason` — same test, padded case asserts exit 0 and trimmed `failure.reason`. Pass.
3. `failure.reason: ' '` rejected by `readState` — covered in `tests/state.test.ts` (`failure record round-trips and rejects unknown keys`, whitespace reason throws `z.ZodError`). Pass.
4. `src/AREA.md` bullet corrected — replaced stale line with: "Phase moves reject a dirty worktree and branch changes under `issues/`; a stop into `failed` skips both, a `cause: blocked` restart skips only the dirty check, and the empty-branch refusal applies only at review handoff." Verified by reading file; 27 lines, four sections intact. Pass.

## Changed files and reasons

- `src/phase.ts`: `rawReason` parse is now `z.string().trim().min(1).optional()` — refuses whitespace-only at boundary, stores trimmed text.
- `src/state.ts`: `failureSchema.reason` is now `z.string().trim().min(1)` — same protection for stored records.
- `src/AREA.md`: replaced stale every-move bullet with accurate exceptions for stop-into-failed and blocked restart.
- `tests/phase.test.ts`: extended reason-misuse test with blank, empty, and padded cases (criteria 1–2).
- `tests/state.test.ts`: extended failure round-trip test with whitespace reason rejection (criterion 3).

## Tests run

Command (from worktree root):
`AKROGON_BASE=43ef0f7a7cb8908df33a734bbdee406b1563d408 bun test --changed="$AKROGON_BASE"`

Result: 168 pass, 0 fail across 5 files.

```
(pass) failed routing and reason misuse are guarded [203.45ms]
(pass) failure record round-trips and rejects unknown keys [6.29ms]
168 pass
0 fail
2326 expect() calls
Ran 168 tests across 5 files. [46.12s]
```

Red check before fix (expected failures):

- `bun test tests/phase.test.ts -t "failed routing and reason misuse are guarded"` → 0 pass, 1 fail (`blank.code` was 0).
- `bun test tests/state.test.ts -t "failure record round-trips"` → 0 pass, 1 fail (whitespace reason parsed).

Green check after fix:

- `bun test tests/phase.test.ts -t "failed routing and reason misuse are guarded"` → 1 pass, 0 fail, 14 expects.
- `bun test tests/state.test.ts -t "failure record round-trips"` → 1 pass, 0 fail, 4 expects.
- `bun run typecheck` → pass (`tsc --noEmit`, no errors).

## Known limitations

None known.

## Unverified criteria

None.
