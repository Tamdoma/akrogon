# Sub-brief 1: run-check refusal of merge_checks + config print

## 1. Goal

Implement plan decisions D1–D3 of the suite-refusal leaf: `akrogon run-check` refuses any invocation whose argv equals a configured `merge_checks` entry in one of three forms, `akrogon config` prints `akrogon verify --attempt <id>` for each `merge_checks` entry, and `src/AREA.md` reflects both.

## 2. Numbered acceptance criteria

1. `akrogon run-check -- <argv>` refuses (exit non-zero before any process starts, stderr naming `akrogon verify --attempt <id>` and that a red merge check is reproduced with a narrower command) when, for some `merge_checks` entry text `t`: (a) argv equals `parse(t)` tokens from `shell-quote` mapped to strings/ops, (b) argv is exactly `['sh','-c',t]`, or (c) argv is exactly `['sh','-c', setupCommand(config,t)]`. Anything else runs.
2. `checks` entries in the same three forms are never refused.
3. `withSetup` in src/config.ts returns `merge_checks` values equal to the literal `akrogon verify --attempt <id>`; `checks` and `advisory` keep the existing `akrogon run-check --name ... -- sh -c ...` wrapping.
4. src/AREA.md's run-check bullet and the `withSetup` non-obvious-pattern line name the refusal / printed route.

The planned tests already committed on this branch prove criteria 1–3; do not edit them. A red planned test under correct product code is a mismatch you return, never a test fix.

## 3. Read-first list

- src/run-check.ts — `runCheck` is the only function to touch; `refuse()`, `requireRepo(readGlobal(), cwd)` already exist there.
- src/config.ts:346-363 — `setupCommand` (exported) and `withSetup`.
- src/next.ts:304 — existing `parse` (shell-quote) usage pattern: `parse(line)` returns `(string | {op: string})[]`.
- tests/run-check.test.ts new tests (search `merge-refusal`, `still-runs`) — the contract.
- tests/config.test.ts :337-421 — expected printed strings.
- skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces

- src/run-check.ts: import `parse` from `shell-quote` and `setupCommand` from `./config`. In `runCheck`, after `refuse()` and `requireRepo`, before `leafTarget`: for each `merge_checks` value `t`, refuse when argv equals `parse(t).map(tok => typeof tok === 'string' ? tok : tok.op)`, or `['sh','-c',t]`, or `['sh','-c',setupCommand(repo.config,t)]`. On match: `process.stderr.write(...)` naming `akrogon verify --attempt <id>` and the narrower-command reproduction, `return 1`. Exact refusal wording is yours; both strings must appear.
- src/config.ts `withSetup`: `merge_checks` maps each value to `'akrogon verify --attempt <id>'` (literal; keep the map keyed by entry name).
- src/AREA.md: one-line updates in the run-check bullet and the `withSetup` line under Non-obvious patterns.
- Owns: src/run-check.ts, src/config.ts, src/AREA.md. No shared test resource. No prerequisite units.

## 5. Do-not, reasons and exceptions

- Do not edit any file under tests/ — tests are planned and committed; a red planned test under correct code is a mismatch returned to A, never fixed by you.
- Do not touch src/verify.ts, src/akrogon.ts, src/phase.ts, or any SKILL.md / docs file — outside this unit; sibling unit owns them.
- Do not add new dependencies; `shell-quote` is already in package.json.
- Do not widen the matcher: only `merge_checks`, never `checks` or `advisory`; a broader refusal would break every printed-checks run.
- Restating: scope changes, test edits and interface changes return a mismatch to A; the exception is a revised brief from A.

## 6. Ordered steps

1. Edit src/config.ts `withSetup` (criterion 3).
2. Edit src/run-check.ts `runCheck` + imports (criteria 1–2).
3. Edit src/AREA.md (criterion 4).
4. Run section-7 commands; repair failures within this brief.
Advisory size: ~3 files, under 30 turns.

## 7. Commands

Run inside your worktree after `bun install --frozen-lockfile`:
- `bun test --timeout=30000 tests/run-check.test.ts -t 'merge_checks|still runs'`
- `bun test --timeout=30000 tests/config.test.ts -t 'merge'`

## 8. Done-when, evidence and report

Both section-7 commands exit 0. Report cites the `check <label>: <exit> <path>` lines from `akrogon run-check` for each run; commit your changes on the worktree HEAD and return the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
