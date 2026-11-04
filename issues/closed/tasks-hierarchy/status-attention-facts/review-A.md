# Review A: status-attention-facts

Base `7f697eee`, reviewed head `f96367e`. Diff: `src/status.ts` (+49/−13), `tests/status-json.test.ts` (+128/−2), `docs/reference/commands.md` (one line).

## Evidence

- `akrogon verify` receipt on `f96367e`: green (format, typecheck, 1303 tests) — report cites run `0b43af07`; receipt confirmed in `issues/verify-runs.jsonl`.
- Four criterion proofs cited in `implementation/report.md`, all `check critN: 0` at head; earlier red verify on `1565e9a` was prettier drift, fixed by `f96367e` and re-verified.
- Deliberate-break demos recorded in `plan.md` R-cond1/R-cond2 with observed diffs for label gating, live unit, `recorded: true`, seat owner, busy seat, done/fix-round seats.
- Test-file diff removals: only the `quiet` fixture line and the import line; the `quiet` change carries a `Test-Change` trailer citing brief criterion 1 (its `missing` dep is now a real fact — the old expectation contradicted the brief; valid correction).

## Judgment against criteria

- C1: `leafAttention` emits `waiting on <slug> (<label>)` only for `parked`/`missing`/`unreadable` labels; merged and live labels produce none. Matches.
- C2: requires `landAttempt` (merge + `owner === 'command'`), `!alive`, `batch?.recorded !== true`; `landAlive` awaited once and shared with the `land` field. Matches design's reconcile exception.
- C3: failed renders `failed: <cause>: <reason>` or bare `failed` per design; gaps as `missing <kind> <name>`; prompt errors keep the `note()` busy-suppression. `red = attention.length > 0` preserves the three old facts verbatim.
- C4: `requiredSlots(phase, fix_rounds)` minus `done` minus busy; merged/failed yield `[]` via empty required slots.
- C5: envelope `red` sum untouched (`leafReds + unreadables + deploy`), grows only through new leaf facts; pinned by the planned tests.
- Exclusions respected: text view untouched (`note`, `cells` unchanged), no waits_on/attention in `status <slug>` text, no merge_checks added.

Docs: `commands.md` `--json` row now names both fields; no other doc states the JSON shape. No documented behavior contradicted.

## Findings

None. No Fixes, no Nits.

## Verdict

ready
