# Brief 3: U3 verify writes main-red and merge-slow notice files

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/notices-on-hc-u3` (detached at the leaf head, which already holds `src/notice.ts`). Repo: akrogon (TypeScript, bun).

## 1. Goal

Move verify's main-red and merge-slow notices from `herdr notification show` to notice files written inside the run's locked final rewrite, fold pending/shown into the ledger, and replace the pid/boot cover rule with the file rule (plan D5, D7, D8, D9, D13).

## 2. Acceptance criteria

`src/notice.ts` (landed) exports `noticeFolder(session)`, `noticeId(repo, ...parts)`, `noticePath(folder, id)`, `writeNotice(folder, id, notice)` (throws on failure), `noticeState(folder, id)`, `removeNotice`.

Ids (D2): main red `noticeId(repo.name, 'main-red', run)` where `run` is the base run's id that sent it; merge slow `noticeId(repo.name, 'merge-slow', first.run)` (one per episode, `first` from the `slow` record).

1. Folder (D8): before the locked final rewrite in the run body (`src/verify.ts` ~575-606), and only when the run has `compares` or merge scope (the only runs that reach main-red or slow logic), resolve `repoSpace(repo)` (`src/hc.ts`) and `noticeFolder(space.session)`. A refused resolution or a throwing `noticeFolder` becomes an error message, giving `folder: string | null` plus the error. No resolution happens for other runs.
2. Fold (D5): inside the lock, before `newRedUnits` and `decideSlow`, every ledger row whose `notice` is `'pending'` and whose main-red file is gone becomes `notice: 'shown'`; every row whose `slow.notice` is `'pending'` and whose merge-slow file is gone becomes `slow.notice: 'shown'`. With `folder === null` nothing folds.
3. Cover rule (D9), one helper replacing today's `noticeCovers`:
   `noticeCovers(value: string | undefined, folder: string | null, id: string): boolean` = `value !== undefined && value !== 'error' && (value !== 'pending' || (folder !== null && existsSync(noticePath(folder, id))))`.
   `newRedUnits` uses it with the main-red id of each earlier row; `decideSlow`'s `send` uses it with the episode's merge-slow id over earlier rows with the same `first.run`. The sending-pid and boot clauses go. `'shown'` and older herdr reason strings cover.
4. Write inside the lock (D8, D7): when `newRedUnits` returns names, write the main-red file in the same locked rewrite and record `notice: 'pending'`, or `notice: 'error'` and `process.stderr.write(`notice: <error>\n`)` when `folder` is null or the write throws. Same for merge slow: when the decision sends, write and record `slow.notice: 'pending'` or `'error'` with the same stderr line. The `verify slow:` stdout print stays where it is.
5. Texts (D10), unchanged: main red title `<repo> main red`, body `<n> new red on main: <first three>; receipt <run>; chart a repair`, attention false. Merge slow title `<repo> merge slow`, body today's send text (`merge verify <ms>m vs <normal>m normal; first seen at <leaf> <run>`), attention false.
6. Deleted (D8, D13): `noticeSend`, `sendMainRedNotice`, `sendMergeSlowNotice`, `noticeSchema`, the second locked write after the rewrite, `rewriteRun` if nothing else uses it, and the `herdr`, `repoSession`, `SessionResolution` imports. `bootId`/`pidAlive` imports stay only where still used elsewhere in `verify.ts`. `FAKE_HERDR` in `passForwarded` stays (herdr-sweep owns it).
7. Planned tests green (they exist; do not edit them), see section 7.

## 3. Read first

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.
- `src/notice.ts`, `src/hc.ts:199-212`.
- `src/verify.ts` 55-95 (ledger schema), 230-445 (`noticeCovers`, `newRedUnits`, `rewriteRun`, the three send functions, `decideSlow`), 470-610 (run body and locked final rewrite).
- Planned tests: `tests/verify.test.ts` "a fresh red base run writes one main-red notice and records it pending", "a later base run red on the same unresolved unit sends nothing, while pending and once shown", "a failed notice write is recorded as error and retried by the next base run", "a pending notice whose file outlives its sending process still covers the unit"; `tests/slow-merge.test.ts` "a slow merge run is flagged, recorded, printed and notified once", "a failed slow notice is retried by the next in-episode run; a pending one covers, waiting or shown". `tests/hc-fixture.ts:486-512`.

## 4. Change list

- `src/verify.ts` only (criteria 1-6). Lands after U1 (landed). Runs beside U2 (`src/next.ts`, `src/phase.ts`, `src/state.ts`) and U4; no shared paths or test resources.

## 5. Do-not, reasons and exceptions

- Do not edit any test file (`tests/**`). Other cases in `tests/verify.test.ts`, `tests/slow-merge.test.ts` and `tests/session-routing.test.ts` still assert fake herdr calls and will go red; A ports them. Report which ones you saw red, do not fix them.
- Do not touch `src/next.ts`, `src/phase.ts`, `src/state.ts`, `src/shell.ts`, `src/notice.ts`, `src/hc.ts`.
- No fallback, retry or catch-all beyond criterion 4's record-as-error.
- Do not move the write outside the lock: two concurrent verify runs must produce one file.
- A requirement that conflicts with the code: return a mismatch with evidence and the smallest brief correction. Exception: a revised brief from A.

Reasons restated: tests are A's; other units own those files; failures are recorded and retried by the next run; the lock prevents a double toast. The only exception is a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile`.
2. Edit `src/verify.ts` (criteria 1-6).
3. Run section 7 commands; all named cases green; typecheck has no error in `src/verify.ts` (errors in `tests/batch-dispatch.test.ts` about `batch.notified` belong to U2).
4. `bunx prettier --write src/verify.ts`, one commit: `feat: verify notices write notice files`.

Advisory size: 1 file, under 20 turns.

## 7. Commands

- `akrogon run-check --name u3-verify -- bun test --timeout=30000 tests/verify.test.ts -t 'a fresh red base run writes one main-red notice|a later base run red on the same unresolved unit|a failed notice write is recorded as error|a pending notice whose file outlives'`
- `akrogon run-check --name u3-slow -- bun test --timeout=30000 tests/slow-merge.test.ts -t 'a slow merge run is flagged|a failed slow notice is retried'`
- `akrogon run-check --name u3-typecheck -- bun run typecheck`

## 8. Done-when, evidence and report

Done when criteria 1-7 hold and the commit exists. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite its `check <label>: <exit> <path>` line; read a log with `akrogon log <path>`. Return the commit id. Stop no process by command-line pattern; stop a run only with `akrogon stop-run <run-id>`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
