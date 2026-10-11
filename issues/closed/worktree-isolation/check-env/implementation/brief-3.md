# Brief 3: tools on merge attempt records

## 1. Goal

Plan unit U2 (decision D8). Each new merge attempt record carries `{name, path, version}[]` for every tool declared in the repo config `tools:` list, resolved once when the merge batch is dispatched.

## 2. Acceptance criteria

1. `batchSchema` in `src/state.ts` gains `tools: z.array(z.strictObject({name: text, path: text, version: text})).optional()` (use the file's existing `text`/schema conventions).
2. `attemptRecordSchema` in `src/attempts.ts` gains the same optional `tools` field; `appendAttempt` copies `batch.tools` into the record (old JSONL lines without `tools` still parse).
3. New exported `resolveTools(repo: Repo): Promise<{name, path, version}[]>` in `src/attempts.ts`: for each name in `repo.config.tools`, `path` = `command(['which', name])` output, `version` = first line of `run([name, '--version'])` stdout (stderr first line when stdout is empty; a failing `--version` yields `version: 'unknown'` — do not throw on the version probe). A `which` failure throws (surfaces as dispatch error → `skipped`, matching `next.ts` error handling).
4. `next.ts` `mergeWake`: inside the `withLock`, immediately before `const next: Batch = {...}` is built, `const tools = await resolveTools(repo)` and store `tools` on the record when `repo.config.tools.length > 0` (leave the field absent when the list is empty — optional, not `[]`).
5. Proof: a real merge turn created via `cli(f, ['next'])` (pattern in `tests/batch-dispatch.test.ts` — `dispatchFixture`, `toMerge`) with `tools:` in the fixture `issues/config.yaml` and a fake executable on PATH produces `state.batch.tools` entries `{name: <tool>, path: <bin path>, version: <first --version line>}`; after the attempt ends, the `merge-attempts.jsonl` line carries the same `tools` array.
6. A declared tool absent from PATH makes the dispatch attempt fail with an error naming the command (the `which` CommandError), no batch record written.

## 3. Read-first

- `src/attempts.ts` — `attemptRecordSchema`, `appendAttempt`, imports.
- `src/state.ts` — `batchSchema` (~:42-66).
- `src/next.ts` — `mergeWake` batch construction inside `withLock` (~:1050-1105); its error handling around `sweep`.
- `src/shell.ts` — `command`, `run`, `CommandError`.
- `tests/merge-attempts.test.ts` — `attemptLines`, `batchFixture`, `soloFixture`.
- `tests/batch-dispatch.test.ts` — `dispatchFixture`, `toMerge`, `next()` for the real-dispatch path.
- `docs/guide/files.md` — merge-attempts field list (~:55-72).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Plan D8: `/home/ivan/Work/infra/akrogon/issues/open/worktree-isolation/check-env/plan.md`.

## 4. Change list and interfaces

Owned paths: `src/state.ts`, `src/attempts.ts`, `src/next.ts` (mergeWake region only), `tests/merge-attempts.test.ts`, `docs/guide/files.md`.
Lands after: worker 1 (`tools: z.array(text).default([])` on `repoSchema` — verify in your base; missing → mismatch).
Consumed by: merge-attempts consumers (files.md documents the shape).
Shared path note: another unit later edits `src/next.ts` around line ~368-416 (`allocate`); you must touch ONLY the `mergeWake` batch construction (~:1050-1110) and its imports if needed — do not refactor or move anything else in that file.

- `resolveTools` lives in `src/attempts.ts` beside `readPressure` (imported by `next.ts` with the existing `appendAttempt` import).
- No new dependencies; `which` is in every fixture PATH.

## 5. Do-not, reasons and exceptions

- Do not edit `src/config.ts`: schema field is worker 1's and already landed in your base.
- Do not resolve tools anywhere else (appendAttempt, phase.ts): resolution is once at dispatch, stored on Batch, copied to each record — that IS the locked design.
- Do not pin or validate versions: recording only (design forecloses version pinning).
- Do not make `tools` required on either schema: old records predate it.
- Do not touch `allocate`, `leafTemp`, `withSetup`, `run-check`: other units own them.
- Mismatch rule: any conflict with live code or the landed worker-1 diff returns a mismatch with evidence instead of re-scoping; the exception is a revised brief from A. Restating the above: each exclusion exists because another unit owns that surface or the design fixes the behavior; the only exception is a revised brief.

## 6. Ordered steps

1. `git log -1 --oneline`; confirm `tools` exists in `repoSchema` (`src/config.ts`). If absent → mismatch.
2. Extend `batchSchema` + `attemptRecordSchema` + `appendAttempt` + `resolveTools`.
3. Wire `mergeWake` per criterion 4.
4. Extend `tests/merge-attempts.test.ts` (new test file section or new `tests/attempt-tools.test.ts` if the fixture import chain fights you — prefer extending): real-dispatch test per criterion 5 with a fake tool script `tool-a` (writes `tool-a 1.2.3` to `--version`) symlinked into a `bin/` on the cli env PATH, `tools: [tool-a]` in `issues/config.yaml`; missing-tool test per criterion 6; appendAttempt copy test using `soloFixture` with `tools` set on the injected `Batch`.
5. Update `docs/guide/files.md` field list: `tools` is `{name, path, version}[]` resolved at merge dispatch; absent on pre-existing lines and when the repo declares no tools.
6. Run changed tests to green; `bun run format` touched files.

Advisory size: ~5 files, under 40 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/check-env-u3
bun install
AKROGON_BASE=354c80e14aca6483c430312c61ae5c1397bb548e sh -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'
```

## 8. Done-when, evidence and report

Criteria 1-6 green; commit on the detached worktree with `Test-Change:` trailer naming each existing test file changed (check `src/test-files.ts` path rule). Report commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
