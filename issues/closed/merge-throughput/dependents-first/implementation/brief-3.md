# Sub-brief 3: dependents-first tests (unit U3)

## 1. Goal

Prove the leaf's done-criteria C1-C5 with a new test file `tests/dependents-first.test.ts` driving `akrogon status` and `akrogon next` against temp repos and the fake herdr. Plan unit U3; the code under test already landed (decisions D1-D4): `src/turn.ts` exports `dependentCounts`, `mergeQueue` sorts (batch record first, then dependent count desc, then merge_stamp/log/slug), `sweep` sorts by dependent count after merged-first.

## 2. Numbered acceptance criteria

1. C1 (queue counts dependents): leaf `x` in `merge` with `merge_stamp` `'2026-09-12T00:00:00Z'`, leaf `y` in `merge` stamped `'2026-09-11T00:00:00Z'` (earlier), `d1` with `'blocked-by': ['x']`, `d2` with `'blocked-by': ['d1']`, both in a non-merged phase, no batch records: `akrogon status` shows `x` as `holder` and `y` as place `2` in the TURN column. Without the new order (stamp-only) `y` would be holder — prove the test goes red on the pre-change code or with the comparator's count key removed (one deliberate break per standing design).
2. C2 (batch record stays first): the C1 graph plus a minimal valid `batch` record saved on `y`: `y` is `holder`, `x` is `2`. Minimal record shape per `batchSchema` in `src/state.ts`: `{ attempt: 't1', built_on: <any 40-hex sha>, holder: { base: <sha>, head: <sha> }, members: [], applied: true }` via `saveState`.
3. C3 (merged dependents not counted): `x`'s only dependents are `phase: 'merged'` leaves; `y` (earlier stamp, no dependents) is `holder`.
4. C4 (dispatch order): leaves `few` (no dependents) and `many` (with `d1` `blocked-by: ['many']` and `d2` `blocked-by: ['d1']`, both unallocated and blocked) all at a dispatchable phase (e.g. `plan.synthesis`); run `akrogon next --all` with the fake herdr; `db.prompts` contains the `plan-issue many ...` prompt at a lower index than the `plan-issue few ...` prompt. Slug names must make the pre-change discovery order visit `few` first so the test is red without the change.
5. C5 (status places + docs): covered by the status assertions above plus docs (U2, already landed — grep that `docs/guide/merge.md` and `docs/guide/next.md` mention dependents/`blocked-by` ordering; no doc edits here).

## 3. Read-first list

- `tests/helpers.ts` (`fixture`, `cli`, `fakeHerdr`, `leaf`, `yaml`, `leafTempRoot`)
- `tests/fake-herdr.ts` (`Database` type: `prompts: { pane, text }[]`, `panes`, `tabs`)
- `tests/status.test.ts` lines ~16-60 (`cell`, `leafRow`, `columns`, `event`, `mergeRecord`, `log`) and ~776-810 (existing TURN tests — copy this pattern)
- `tests/batch-dispatch.test.ts` lines ~40-90 (`dispatchFixture`, `database`, `saveDatabase`, `toMerge`, `next` helper) — copy the local helper pattern
- `src/state.ts` (`batchSchema`, `saveState`, `State`)
- `src/turn.ts` (`dependentCounts`, `mergeQueue`) — the code under test
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `bunfig.toml` (test root) — new file under `tests/` is picked up automatically.

## 4. Change list and needed interfaces

Owned paths: `tests/dependents-first.test.ts` (new file). Needs first: U1 code (landed on this worktree's base before spawn — `dependentCounts` is already in `src/turn.ts`). Shared test resource: none; each test builds its own `fixture`.

- Use the real CLI boundary (`cli(f, ['status'], ...)` / `cli(f, ['next', '--all'], f.root, f.env)`) — same as status.test.ts/batch-dispatch.test.ts.
- `leaf(f, slug, phase, extra, container)` writes `issues/open/<container>/<slug>/state.yaml`; merge-phase leaves need `merge_stamp` set through `extra` or `saveState`.
- For C4, `next` needs `fakeHerdr(f).env` passed to `cli`; prompts appear in `db.prompts` in delivery order. `plan.synthesis` requires only seat A (debate `no`), so each ready leaf yields exactly one prompt `plan-issue <slug> slot=A phase=plan.synthesis leaf=<path>`.
- Keep tests serial-safe: use `test(...)` with own fixture and `f.clean()` in `finally`, matching house style. Give the C4 test an explicit timeout (e.g. 20000) like dispatch tests.

## 5. Do-not, reasons and exceptions

- Do not modify `src/` — the code unit landed; a failing test against the landed code is a mismatch you return with failing output, not a code fix.
- Do not edit `docs/` — U2 owns them; criterion 5 is verified by grep/assertion only.
- Do not touch existing test files — new file only.
- Do not assert on prose wording; assert TURN cell values and prompt order/contents (observable contract).
- If the landed code's actual behavior contradicts the criteria (e.g. `dependentCounts` signature differs), adjust the test to the real interface if behavior matches, or return a mismatch with evidence. The exception is a revised brief from A authorizing changes.

Restated: tests only, no src/docs edits; contradictions return as mismatches.

## 6. Ordered steps

1. Write `tests/dependents-first.test.ts` with the C1/C2/C3 status tests and the C4 dispatch test (criteria 1-4).
2. Run `bun test tests/dependents-first.test.ts --timeout=30000` — expect green on the landed code.
3. Deliberate-break check: temporarily remove the count key from the `mergeQueue` comparator in your worktree `src/turn.ts` (do not commit), rerun the file, confirm C1/C2/C3 go red; restore. Similarly you may temporarily drop the sweep key for C4. Paste evidence (or equivalent: run the file against `AKROGON_BASE` code in a scratch checkout).
4. Run the changed-test command in section 7.

Advisory size: 1 file, under 14 turns.

## 7. Commands

```sh
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

with `AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36`, plus `bun test tests/dependents-first.test.ts --timeout=30000` directly.

## 8. Done-when, evidence and report

Criteria 1-5 verified; new file green; deliberate-break red evidence pasted; changed-test command green. Commit in one commit on top of the worktree HEAD and return the commit ID. No `Test-Change:` trailer (new file).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
