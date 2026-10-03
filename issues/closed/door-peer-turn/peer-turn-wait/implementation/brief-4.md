# brief-4: tests/peer-wait.test.ts (plan U4, decision D6)

## 1. Goal

Create `tests/peer-wait.test.ts` proving every outcome branch of `skills/chart-issues/scripts/peer-wait.ts` against the fake herdr — brief done-criteria 1 and 2. One test per branch plus the budget-clamp and verbatim-stderr cases; no wording assertions.

## 2. Acceptance criteria (the test set)

The script under test: `bun skills/chart-issues/scripts/peer-wait.ts <pane> <return-file> <budget-seconds>` run as a subprocess with a fake-herdr PATH shim (symlink `tests/fake-herdr.ts` as `herdr` into a temp bin dir, prepend to PATH) and `FAKE_HERDR=<db json path>`. Collect `{code, stdout, stderr}` — reuse `run()` from `src/shell.ts` or `Bun.spawn` directly; `run()` trims, which is fine for assertions.

Available fake controls (already merged at HEAD, see `tests/fake-herdr.ts`): db fields `panes`, `waitScript: [{status?, code?, message?, stderr?, sleepMs?, append?}]`; unscripted `working` pane → ~50 ms sleep then real timeout stderr exit 1; `idle`/`done`/`blocked`/`unknown` → success body `{"result":{"agent":{...,"agent_status":<stored>}}}`; scripted `status` → success reporting that status without mutating the pane; scripted `stderr`/`code` → verbatim failure exit 1; `append` → writes `<pane_id>\n` to that file path mid-wait. All invocations are JSON-logged one per line to `<db>.calls`.

Required tests (each its own `test`):

1. **pass-through**: pane `working`, `waitScript: [{stderr: 'raw failure text'}]` → non-zero exit (1), `stderr === 'raw failure text'` byte-identical, `stdout === ''` (no result line).
2. **blocked wins over file**: pane `blocked`, return file pre-created non-empty → `{outcome:'blocked', status:'blocked'}`, exit 0, exactly one stdout line.
3. **done on timeout** (the OR rule): pane `working`, `waitScript: [{append: <return file path>}]` → wait times out but append wrote the file → `{outcome:'done', status:null}`.
4. **done while herdr reports working**: `waitScript: [{status:'working', append: <return file>}]` then timeouts → `{outcome:'done', status:'working'}`.
5. **failure on idle + missing file**: pane `idle`, file does not exist → `{outcome:'failure', status:'idle'}`.
6. **failure on done + 0-byte file**: pane `done`, file exists with `size === 0` → `{outcome:'failure', status:'done'}`.
7. **budget with null status**: pane `working`, no waitScript, budget ~0.3–0.5 s → `{outcome:'budget', status:null}`; every logged `agent wait` call's `--timeout` satisfies `> 0` and `<= 10000` and `sum(timeouts) <= budget*1000 + 250` (sleep granularity). Assert via reading `<db>.calls`.
8. **budget keeps last status**: `waitScript: [{status:'working'}]` then default timeouts, small budget → `{outcome:'budget', status:'working'}`.
9. **argv validation**: missing args and `budget=abc` → exit 1, usage/error on stderr, no stdout result line.

Every result-line assertion checks all four fields (`outcome`, `pane`, `file`, `status`) and that stdout contains exactly one line.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `skills/chart-issues/scripts/peer-wait.ts` — the implementation under test (at HEAD)
- `tests/fake-herdr.ts` — fake contract (section 2 above summarizes)
- `tests/helpers.ts` `fixture()`, `tests/shell.test.ts` ~line 88 — PATH-symlink + `FAKE_HERDR` env pattern
- `tests/watch-issues-scripts.test.ts` — subprocess test style

## 4. Change list and needed interfaces

Owns exactly: `tests/peer-wait.test.ts`. Nothing else may change.

- Script path: `resolve(import.meta.dir, '../skills/chart-issues/scripts/peer-wait.ts')`; run `['bun', script, pane, file, budget]`.
- Temp dirs: `mkdtempSync(resolve(tmpdir(), 'peer-wait-'))`, cleaned in `finally` (repo pattern: `rmSync(dir, {recursive:true, force:true})`).
- Minimal db: `{panes:[{pane_id:'w8:pX', tab_id:'w8:t1', cwd:'/tmp', agent:'fake', agent_status:'working'}], tabs:[], serial:0}` — check `paneSchema` in `src/shell.ts` for required fields; `workspaces`, `prompts`, `starts` have defaults.
- Env for subprocess: `{...process.env, PATH: bin + ':' + process.env.PATH, FAKE_HERDR: db}`.
- Use `test.serial` if tests share nothing global they can also run parallel; no shared global state exists here (each test has own dir/db) → plain `test` is fine; do NOT mark serial without need (bunfig runs files concurrently anyway).

## 5. Do-not, reasons and exceptions

- Do not import the script as a module; the contract is the process boundary (stdout/exit/stderr) — importing would skip the actual `herdr` spawn path.
- Do not assert on stderr wording beyond the verbatim pass-through case; prose/usage wording is not a contract.
- Do not add more tests than the listed set; extra edge cases need a named consequence — each listed test maps to a done-criterion branch.
- Do not touch `peer-wait.ts` or `fake-herdr.ts`; a defect found returns as a mismatch with the failing evidence.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

Restated: process-boundary testing only, no wording asserts, exactly the listed tests, no edits outside the test file; mismatch evidence over scope change unless A revises the brief.

## 6. Ordered steps

1. Read the three read-first files (interfaces above).
2. Write `tests/peer-wait.test.ts` with the 9 tests and a small `runPeerWait` helper (criteria 1–9).
3. Run `export AKROGON_BASE=69038ef023a8434104bb9c6335f79daa1a6c2377; bun test --changed=$AKROGON_BASE --timeout=30000` and `bun test tests/peer-wait.test.ts --timeout=30000`; paste results.
4. `git add tests/peer-wait.test.ts && git commit -m "test peer-wait outcomes"`; return the commit ID.

Advisory size: 1 file (~150–200 lines), under 15 turns.

## 7. Commands

```bash
export AKROGON_BASE=69038ef023a8434104bb9c6335f79daa1a6c2377
bun test --changed=$AKROGON_BASE --timeout=30000
```

## 8. Done-when, evidence and report

Done when all 9 tests pass and the commit exists. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
