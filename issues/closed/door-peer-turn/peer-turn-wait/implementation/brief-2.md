# brief-2: fake-herdr `agent wait` + waitScript (plan U2, decision D5)

## 1. Goal

Extend `tests/fake-herdr.ts` so the `herdr agent wait <pane> --timeout <ms>` command exists and is scriptable, enabling `tests/peer-wait.test.ts` (a later unit) to drive every outcome branch deterministically.

## 2. Acceptance criteria

1. `agent wait <pane> --timeout <ms>` is handled (dispatch follows the file's existing `if (args[0] === 'x' && args[1] === 'y')` chain). `--timeout` value is parsed as a number (invalid → `failure('invalid_timeout')` or an Error; match file conventions).
2. New optional db field `waitScript: z.array(waitEntrySchema).default([])` where `waitEntrySchema` has optional `status` (the paneStatus enum the file already uses: 'idle'|'done'|'working'|'blocked'|'unknown'), `code`, `message`, `stderr` (mirror `scriptEntrySchema`), `sleepMs` (number), and `append` (string path appended mid-wait — reuse `scriptEntrySchema`'s append semantics but to an arbitrary file path).
3. Per call: shift the next `waitScript` entry; when none remains, behavior keys off the pane's `agent_status`:
   - `working`: sleep `entry.sleepMs` if scripted else ~50 ms, then emit the real herdr timeout body to stderr and exit 1: `{"error":{"code":"timeout","message":"timed out waiting for agent status"},"id":"cli:agent:wait"}`
   - `idle`, `done`, `blocked`, `unknown`: exit 0 with stdout `{"id":"cli:agent:wait","result":{"agent":{<pane fields including agent_status>}}}` matching the existing `result({ agent: target })` envelope style
4. Scripted entries override: `stderr` → verbatim stderr + exit 1 (like `scriptedFailure`); `code` → `{"error":{"code","message"}}` + exit 1; `status` → success body reporting that status (do not mutate the pane's stored status); `sleepMs` → sleep before the scripted outcome. Scripted `append` appends the given string to the named file path mid-wait (after sleep, before the outcome).
5. Every call is already logged to `<db>.calls` (existing `appendFileSync` covers it — keep working).
6. `bun test --changed=$AKROGON_BASE --timeout=30000` passes; `bun test tests/` files that use fake-herdr must not break (schema additions have defaults, dispatch order keeps `agent start`/`agent prompt` ahead only in declaration order — `agent wait` is a distinct `args[1]`).

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `tests/fake-herdr.ts` — the whole file; patterns to copy: `scriptedFailure`, `flag`, `pane`, `result`, `failure`, zod defaults
- `src/shell.ts` lines ~74-86 for `paneSchema`/`agent_status` enum
- `tests/shell.test.ts` — how the fake is wired via PATH symlink

## 4. Change list and needed interfaces

Owns exactly: `tests/fake-herdr.ts`. Nothing else may change.

Interfaces produced (consumed by the later U4 test):

- db: `waitScript` array as above; write it via `writeFileSync(db, JSON.stringify({..., waitScript: [...]}))`.
- Success envelope: `{"id":"cli:agent:wait","result":{"agent":{...}}}` — reuse `result({agent: target})` shape; for a scripted `status`, emit `{...target, agent_status: scripted}`.
- Timeout stderr must be exactly: `{"error":{"code":"timeout","message":"timed out waiting for agent status"},"id":"cli:agent:wait"}` (exit 1).
- A non-scripted `working` pane waits a fixed short real time (≈50 ms via `Bun.sleep`) so a budget test sees several bounded calls without spinning thousands.
- `sleep` helper: `await Bun.sleep(ms)` — note the fixture's top-level code runs synchronously; check whether the dispatch block can `await` (the file is a script; top-level await is allowed in Bun). If awkward, use `spawnSync`-free busy alternative: `Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)` — verify it compiles under `tsc`/bun and pick the simpler one that works.

## 5. Do-not, reasons and exceptions

- Do not change any existing command's behavior or the existing schema fields (defaults keep old dbs valid); other suites depend on them.
- Do not mutate `pane.agent_status` when a scripted `status` is served; the pane's stored status is the default branch and tests may inspect it.
- Do not skip the `.calls` log or `save()` ordering; tests assert on both the calls file and final db.
- Do not add a `wait_calls` counter to the db unless needed; the calls file already records args — prefer it.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

Restated: no existing-behavior changes, no stored-status mutation, keep the calls log working, prefer the calls file over new counters; mismatch evidence over scope change unless A revises the brief.

## 6. Ordered steps

1. Read `tests/fake-herdr.ts` fully (criterion 6 context).
2. Add `waitEntrySchema` + `waitScript` field to `databaseSchema` (criterion 2).
3. Add the `agent wait` dispatch block implementing criteria 1, 3, 4.
4. Run `export AKROGON_BASE=69038ef023a8434104bb9c6335f79daa1a6c2377; bun test --changed=$AKROGON_BASE --timeout=30000` (criterion 6).
5. Sanity probe: create a db with one `working` pane, run `FAKE_HERDR=<db> bun tests/fake-herdr.ts agent wait <pane> --timeout 100` — expect exit 1 with the timeout stderr after ~50 ms; then with `idle` pane expect exit 0 JSON. Record outputs.
6. `git add tests/fake-herdr.ts && git commit -m "fake-herdr: agent wait with waitScript"` and return the commit ID.

Advisory size: 1 file (~50–80 added lines), under 12 turns.

## 7. Commands

```bash
export AKROGON_BASE=69038ef023a8434104bb9c6335f79daa1a6c2377
bun test --changed=$AKROGON_BASE --timeout=30000
```

## 8. Done-when, evidence and report

Done when all criteria hold and the commit exists. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
