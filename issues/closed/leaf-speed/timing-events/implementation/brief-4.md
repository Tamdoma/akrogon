# Brief U4: src/pause.ts repo_pause + src/park.ts parked waits

## 1. Goal

Emit `repo_pause` on `akrogon pause`/`unpause`, and `wait` events for leaves whose issue folder is parked or unparked (plan decisions D3, D9).

## 2. Acceptance criteria

1. In `pauseCommand`, after `await setPaused(repo.name, paused)` (still inside `pauseCommand`, after the call returns — the lock is already released there, which is fine): `appendTiming(repo, { kind: 'repo_pause', pause: paused ? 'on' : 'off' })`. No `slug` field.
2. In `parkCommand`, inside the `withLock` block, after the `renameSync` loop completes: for each `name` in `moving`, enumerate `leavesUnder(resolve(repo.root, to, name), resolve(repo.root, to))` and append `{ kind: 'wait', slug: <leaf slug>, reason: verb === 'park' ? 'parked' : 'none' }` per leaf, in iteration order.
3. No dedup here — `park`/`unpark` write one event per moved leaf per call (the leaf is unreachable to `next` while parked, so it cannot accumulate repeats).
4. No other behavior changes.

## 3. Read-first

- `src/pause.ts` — `pauseCommand`.
- `src/park.ts` — `parkCommand`, `areas`, existing `leavesUnder`/`issueFolders` imports.
- `src/timing.ts` — `appendTiming`, `repo_pause` and `wait` shapes.
- `src/state.ts` — `leavesUnder(path, areaRoot)` signature and `validateLeafDepth` (the leaf folders under `issues/parked/<issue>/<slug>` and `issues/open/<issue>/<slug>` are depth 2, same as open).
- ponytail.md.

## 4. Change list and needed interfaces

Owns: `src/pause.ts`, `src/park.ts`. Prerequisite: U1 on HEAD (`src/timing.ts`; if absent, mismatch). Imports: `appendTiming` from `./timing`; `leavesUnder` is already imported in `park.ts`.

`leavesUnder(path, areaRoot)` expects the leaf folder root and the *area root* (`issues/parked` or `issues/open`); pass `resolve(repo.root, to)` for both arguments' base.

## 5. Do-not, reasons and exceptions

- Do NOT change `setPaused`, `readPaused`, `settle`/`stranded`/`running` logic or output text. Reason: out of scope. Exception: revised brief.
- Do NOT write `wait` events for dependent leaves here — `akrogon next` writes those (`parked`/`prerequisite` dep waits are U5's). Reason: owned scope. Exception: revised brief.
- Do NOT write or edit tests; `tests/timing.test.ts` red is expected until all units land. Exception: none.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing it.

## 6. Ordered steps

1. `src/pause.ts`: add the `repo_pause` append in `pauseCommand`.
2. `src/park.ts`: add the per-leaf `wait` appends after the `renameSync` loop.
3. `bun install --frozen-lockfile`, run section 7; `tests/timing.test.ts` red is expected — report it, fix only diff-caused failures.

Advisory: 2 files, under 10 turns.

## 7. Commands

`AKROGON_BASE=df8868911100bf863224f71a51e70bb489d3b5d9 && bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Both appends land, typecheck clean. Commit message: `timing-events: repo_pause and parked wait events`. `Test-Change:` trailer only if an existing test file changed (none should).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
