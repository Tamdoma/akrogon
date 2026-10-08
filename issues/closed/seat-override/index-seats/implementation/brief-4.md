# Brief U4: status seat reporting and index failure surfacing

## 1. Goal

Plan D6 and criteria 2 (`status` side), 4 and 5 (`status` side) of `index-seats`: `akrogon status <slug>` prints both effective seats with the file each came from, the overview NOTE column marks index-sourced leaves, and a malformed index surfaces as an unreadable repo line / non-zero exit.

## 2. Numbered acceptance criteria

1. `akrogon status <slug>` prints, after the state YAML, one label line stating these are the seats the next agent start uses, then a YAML block `{ a: {harness, model, effort, source}, b: {harness, model, effort, source} }` from `seats(global, repo, leaf.path)` where `source` is the absolute index path, `issues/config.yaml`, or machine `config.yaml`.
2. The overview table NOTE column carries `seats ISSUE.md` (basename of the index source) for a leaf whose A or B seat comes from an index, nothing extra otherwise; both seats from the same index file yield one marker.
3. A malformed index (any `SeatIndexError` cause: unparseable front matter, extra key, foreign seat, missing field, blank value, quote in value, missing harness template) makes `akrogon status` (overview) print the `unreadable` JSON line naming the index path and exit 1, and makes `akrogon status <slug>` exit non-zero naming the index path — both via `SeatIndexError` being added to `scanRepo`'s caught set and propagating in detail.
4. Leaves whose `ISSUE.md`/`EPIC.md` have no `---` front matter resolve exactly as before; every existing leaf still scans.

## 3. Read-first list

- `src/status.ts` — whole file; `scanRepo`/`walk` (line 38), its catch set (~line 78), `note()` (line 95), `cells`/`rows` (~135-160), `statusCommand` detail block (~298).
- `src/config.ts` — landed `seats(global, repo, leafPath?)` returning `{a, b, source}` and exported `SeatIndexError` with `.file`.
- `src/state.ts` — `Leaf` type (`{path, state}`).
- `tests/status.test.ts` — `cell`/`leafRow` helpers (lines 16-28), `register` (line 30), malformed-detail test ~line 728 for shape.
- `tests/helpers.ts` — `leaf()`, `fixture()`, `cli()`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns `src/status.ts` and `tests/status.test.ts`. Prerequisite: U1's commit on HEAD. Shared unchanged resource: `tests/helpers.ts`.

Changes in `src/status.ts`:

- Import `seats`, `SeatIndexError` from `./config`; `basename` from `node:path`.
- In `scanRepo`'s `walk`, after building the `ScannedLeaf`, compute `seats(global, repo, leaf.path).source` and store it on the scanned leaf (extend `ScannedLeaf`). `SeatIndexError` propagates to the existing catch; add `error instanceof SeatIndexError` to the `ok:false` condition so the `unreadable` line carries the index path (set `path` from the error's `file` or the leaf's index path — the printed `path` field must name the index file).
- `cells`/`note`: pass the stored sources; append `seats <basename>` (one per distinct index basename, `a` before `b`) to the NOTE join.
- Detail branch of `statusCommand`: after `console.log(state yaml)`, print the label line (e.g. `Seats for the next agent start:`) then `Bun.YAML.stringify({ a: {...source}, b: {...} })` built from `seats(global, repo, leaf.path)`.

Tests in `tests/status.test.ts`:

- Detail: leaf under an `ISSUE.md` with front matter `slots.a` → stdout contains the label, `model` value, and the absolute `ISSUE.md` path for `a` while `b` names `issues/config.yaml` or machine config; assert on values/paths, not exact wording.
- Table: leaf with index seat shows `seats ISSUE.md` in its NOTE cell (use `leafRow`/`cell`); a sibling leaf without front matter shows no `seats` token (criteria 2/4/5).
- Malformed: parametrize at least unparseable front matter and missing field → overview exits 1 with `unreadable` JSON naming the index path; detail `status <slug>` exits non-zero naming the path.
- Deliberate-break proof: the detail-block test fails before the `status.ts` change; state it in the report.

## 5. Do-not, reasons and exceptions

- Do not edit `src/config.ts`, `src/next.ts`, `src/state.ts`, `tests/helpers.ts` or other test files — owned by U1/U3/A; a gap is a mismatch return with evidence.
- Do not change the printed state YAML shape, the `Missing:`/`History:` ordering, or column headers — other tests depend on them.
- No prose assertions beyond the required label line; assert values and paths.
- Mismatch return, not scope drift; exception is a revised brief from A.

## 6. Ordered steps

1. Read the read-first files; write tests red (detail-block test must fail before code).
2. Apply `src/status.ts` changes.
3. `bun install`, then the commands below.
4. Commit with a `feat:` message and `Test-Change:` trailer for `tests/status.test.ts` (new cases added, no existing expectation changed).

Advisory size: 2 files, under 40 turns.

## 7. Commands

```sh
export AKROGON_BASE=2645d97ed1682185eea4788844f882a541885d24
bun test --changed="$AKROGON_BASE" --timeout=30000
bun test tests/status.test.ts --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence and report

Criteria 1-4 green; the detail test demonstrably failed before `status.ts` changed; typecheck passes; commit id returned. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
