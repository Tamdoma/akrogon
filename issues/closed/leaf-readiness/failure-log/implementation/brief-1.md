# Sub-brief 1: failure-log — logMove records state.failure on failed moves

## 1. Goal

Every `issues/log.jsonl` record of a move into `failed` carries the leaf's `failure` object as written to state (`cause`, `phase`, `slot`, `reason`, and `delivery` when present); records of other moves carry no `failure` key. Implements plan decisions D1–D3 of the failure-log leaf. One unit, owns all changed paths.

## 2. Numbered acceptance criteria (the leaf's done-criteria)

1. `tests/phase.test.ts`: `akrogon phase <slug> failed --reason "<text>" --slot A` appends a log record whose `failure` equals the state's `failure` (`cause: 'blocked'`, phase, slot, reason; assert deep-equality against `readState(path).failure`, which also covers `delivery` when the fake herdr supplies it).
2. `tests/next.test.ts`: an attempts-exhausted stop (`cause: 'attempts'`) appends a record whose `failure` equals the state's `failure`. Extend the existing `misses` test (`tests/next.test.ts`, the test beginning `next resumes interrupted tab creation...` is a different one — the `misses` test starts around line 198) — assert on its final log record after `phase` becomes `failed`.
3. `tests/phase.test.ts`: a non-failed move (e.g. `phase <slug> plan.rebuttal --slot A` from `plan.positions`, or any `moved <phase>` transition) appends a record with **no** `failure` key (`expect('failure' in record).toBe(false)` or `!Object.keys(record).includes('failure')`), and `cli(f, ['status', <slug>])` exits 0 and prints `History:` followed by that record's line.

## 3. Read-first list

- `src/log.ts` — `logMove`, the only production function edited.
- `src/phase.ts:48-125` — `announceFailed` (persists `delivery` to state before `logMove` runs in `commitMove`'s `finally`); `after` is `announced`.
- `src/phase.ts:200-206` — `cause: 'blocked'` call site.
- `src/next.ts:429-450` — `cause: 'attempts'` call sites.
- `src/state.ts:11-18` — `failureSchema` (strict object, `delivery` optional).
- `src/status.ts:27-50` and `src/status.ts:288-300` — non-strict `logSchema`; `status <slug>` prints `History:` + raw record lines.
- `tests/helpers.ts` — `fixture()`, `cli()`, `leaf()`, `fakeHerdr()`, `readState` usage.
- `tests/phase.test.ts:53-152` — existing fixture patterns: `cli`, `readState`, `readFileSync(resolve(f.root,'issues/log.jsonl'),'utf8')` + `JSON.parse` per line, and the exact `Object.keys(log).sort()` list at ~line 137 (a `check.repair` record — it stays unchanged because that record is not `to: 'failed'`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `src/log.ts` — inside the `JSON.stringify({...})` object, add `...(after.failure === undefined ? {} : { failure: after.failure }),` so failed moves record the object state holds and all other records omit the key entirely (no `failure: undefined` key — `JSON.stringify` would drop it anyway, but the explicit conditional keeps `Object.keys` assertions honest about intent).
- `tests/phase.test.ts` — add one test covering criteria 1 and 3 (or two small tests; existing style is one scenario per test). Pattern to copy: `const log = JSON.parse(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').split('\n')[<n>]);` then `expect(log).toMatchObject(...)` / `toEqual(readState(path).failure)`.
- `tests/next.test.ts` — extend `misses`: after `readState(path).phase === 'failed'` assertions, parse the last line of `issues/log.jsonl` and assert `record.failure` deep-equals `readState(path).failure` (contains `cause: 'attempts'`).

Interfaces: `State.failure?: Failure`; `Failure = { cause: 'blocked'|'attempts', phase, slot, reason, delivery? }`. `logMove(repo, before, after, slot)` signature unchanged.

Owned paths: `src/log.ts`, `tests/phase.test.ts`, `tests/next.test.ts`. Prerequisites: none. Shared test resources: none (each test builds its own `fixture()`/`dispatchFixture()`).

## 5. Do-not, reasons and exceptions

- Do not modify `src/status.ts` or `logSchema` — it is a non-strict `z.object` and already passes the extra key through; criterion 3 proves it.
- Do not modify `src/state.ts`, `src/phase.ts`, `src/next.ts` — the failure object already reaches `after` correctly; touching them duplicates an existing guarantee.
- Do not backfill old log records, add a log version field, or surface `failure` in status output — all are design exclusions.
- Do not add new test files — extend `phase.test.ts` and `next.test.ts` only.
- Do not assert on reason prose; assert `record.failure` deep-equals `readState(path).failure` (lessons: wording assertions couple tests to phrasing).
- Do not add `failure` to the `Object.keys` expected list at `tests/phase.test.ts:137` — that record is a `check.repair` move, not a failed one, so its key list stays exactly as is.
- If you believe the scope or an interface here is wrong, return a mismatch naming the conflicting requirement, the actual code evidence, and the smallest brief correction — do not change scope yourself. Exception: a revised brief from A authorizing the change.

## 6. Ordered steps

1. `cd` into the supplied worktree, run `bun install` if `node_modules` is absent.
2. Write the criterion-1 + criterion-3 test additions in `tests/phase.test.ts` (red first: they fail because no `failure` key exists).
3. Extend the `misses` test in `tests/next.test.ts` with the criterion-2 log assertion.
4. Edit `src/log.ts` per section 4 (green).
5. Run the changed-tests command from section 7; repair failures within this brief.
6. Commit only this chunk (`src/log.ts`, `tests/phase.test.ts`, `tests/next.test.ts`) with a short message; return the commit ID.

Advisory size: about 3 files, under 15 turns.

## 7. Commands

```sh
AKROGON_BASE=b2c15ec5d2fe889e158934b084dd93cfeafc9f72
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

Run only this; A runs criterion proof and `checks` separately.

## 8. Done-when, evidence and report

Done when the three acceptance criteria hold in committed code, the changed-tests run passes, and only the three owned paths are committed. Report with pasted command results.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
