# Brief 2: U2 engine callers write notice files

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/notices-on-hc-u2` (detached at the leaf head, which already holds `src/notice.ts`). Repo: akrogon (TypeScript, bun).

## 1. Goal

Move the busy, merged and failed notices in `src/next.ts` and `src/phase.ts` from `herdr notification show` to notice files written through `src/notice.ts`, fold "pending"/"shown" into today's records, and remove a pending file whose condition cleared (plan D3-D7, D10, D13).

## 2. Acceptance criteria

`src/notice.ts` (landed) exports `Notice`, `noticeFolder(session)`, `noticeId(repo, ...parts)`, `noticePath(folder, id)`, `writeNotice(folder, id, notice)` (throws on failure), `noticeState(folder, id): 'pending' | 'shown'`, `removeNotice(folder, id)`.

Session (D3): every caller resolves `repoSpace(repo)` from `src/hc.ts` and uses `noticeFolder(space.session)`. Resolve lazily: only when a write or removal is due or a record is `'pending'`. A refused resolution (`ok: false`) is that caller's write failure (D7). No caller uses `repoSession`, `herdrArgv`, `herdr`, `retryable` or `run` for notices.

Ids (D2): busy `noticeId(repo.name, 'busy', slug, seat)`, failed `noticeId(repo.name, 'failed', slug)`, merged `noticeId(repo.name, 'merged', slug)`.

Texts (D10), unchanged from today:
- Busy: title `Busy leaf: <repo>/<slug> seat <seat> <h>h<mm>m` (today's computation), body `''`, attention false.
- Merged: title `<repo>/<slug> merged, move it back`, body `next: akrogon phase <slug> merge`, attention true.
- Failed: title `<repo>/<slug> failed`, body `<cause>: <reason>`, attention true.

1. `observeBusy` (`src/next.ts:157`):
   - Seat working or blocked, past `STALL_MS`, `busy_notified[seat] === undefined`: resolve (refused throws its reason), `writeNotice` (a throw propagates, record stays unset so the next pass writes again), record `'pending'`, save, `wakeWatcher` as today.
   - Seat working or blocked, `busy_notified[seat] === 'pending'`: if `noticeState` is `'shown'`, record `'shown'` and save. Never rewrite. Any other defined value (old timestamps, `'shown'`) means shown: nothing.
   - Seat neither working nor blocked: when `busy_notified[seat] === 'pending'`, `removeNotice` that seat's file, then clear both records as today.
2. Merged (`mergeNotice` at `src/next.ts:727`, failed-holder branch of `reconcileBatch` at `src/next.ts:825`): `batch.notified === 'shown'` stays; `'pending'` folds through `noticeState`; absent writes. A successful write records `'pending'`. A refused resolution or failed write warns with today's structured `console.warn(JSON.stringify({ warning: 'merge notice failed', slug, error }))` and leaves `notified` absent so the next pass writes again. Save `{ ...batch, notified, recorded: true }` as today, with `notified` omitted when absent.
3. Failed fold (failed branch of `dispatchLeaf`, `src/next.ts:601`): when `state.failure.delivery === 'pending'` and the file is gone, save `failure.delivery: 'shown'` before the existing recovery refusal logic.
4. `announceFailed` (`src/phase.ts:92`): write the failed notice; `delivery = 'pending'` on success, `'error'` on a refused resolution or failed write (the error kept as `lastError`, as today). Keep the tab rename and the rest unchanged.
5. `commitMove` (`src/phase.ts:187`):
   - Into `failed` or `merged` (where `busy_notified` resets): remove each seat's busy file whose `recorded.busy_notified[seat] === 'pending'`.
   - Leaving `failed` (`recorded.phase === 'failed' && to !== 'failed'`): remove the failed file when `recorded.failure?.delivery === 'pending'`, remove the merged file when `recorded.batch?.notified === 'pending'`, and drop `notified` from `after.batch` (so a later failure of the same batch writes again).
   - Dropping `notified` goes into the `after` object before the save. The removals run after the save, inside the existing post-save `try` (the follow-up work block that turns errors into `MoveCommittedError`), so a refused resolution never blocks a committed move but still fails loudly.
6. `src/state.ts` batch schema (D4): `notified` becomes `'pending' | 'shown'`, optional. Old records still parse: `z.preprocess` maps `true` to `'shown'` and `false` to `undefined`.
7. `herdrCall` in `src/phase.ts` is deleted. Every import in `src/next.ts` and `src/phase.ts` that becomes unused is removed (`herdr`, `herdrArgv`, `repoSession`, `retryable`, `SessionResolution`, `run`, `Result`, `CommandError` only where unused). Do not change `src/shell.ts`: `observe.ts` and tests still import its functions.
8. Planned tests green (they exist; do not edit them), see section 7.

## 3. Read first

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.
- `src/notice.ts`, `src/hc.ts:199-212` (`repoSpace`, `SpaceResolution`).
- `src/next.ts` 150-205, 590-615, 720-830. `src/phase.ts` 1-125, 180-255. `src/state.ts` 10-20, 75-130.
- `src/phase.ts` `renameTab` (lines 76-90): the existing `repoSpace` use pattern to copy.
- Planned tests: `tests/next.test.ts` "busy seats persist, warn strictly after an hour, retry a failed notice and clear on an idle turn"; `tests/phase.test.ts` "stop from implement on dirty worktree records blocked failure and clears busy fields" (line 1092) and "failed announce writes the failed notice, renames tabs and tolerates missing tabs" (line 1358); `tests/batch-dispatch.test.ts` lines 180 and 324. `tests/hc-fixture.ts:486-512` (`noticeFiles`, `blockNotices`).

## 4. Change list

- `src/next.ts`: criteria 1-3, 7. `src/phase.ts`: criteria 4, 5, 7. `src/state.ts`: criterion 6.
- Owned paths: those three files. Lands after U1 (landed). Runs beside U3 (`src/verify.ts`) and U4 (skill text); no shared paths or test resources.

## 5. Do-not, reasons and exceptions

- Do not edit any test file (`tests/**`). Other cases in `tests/next.test.ts`, `tests/phase.test.ts` and `tests/session-routing.test.ts` still assert old herdr notification calls and will go red; A ports them. Report which ones you saw red, do not fix them.
- Do not touch `src/verify.ts`, `src/shell.ts`, `src/notice.ts`, `src/hc.ts`.
- No fallbacks, retries or catch-alls beyond those listed: a failed write is recorded (failed: `'error'`, merged: warn and absent) or thrown (busy).
- Do not change `src/status.ts`: it never reads notice values.
- A requirement that conflicts with the code: return a mismatch with evidence and the smallest brief correction. Exception: a revised brief from A.

Reasons restated: tests are A's; other units own those files; the write must fail loudly and be retried by the next pass; status needs no change. The only exception is a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile`.
2. `src/state.ts` schema (criterion 6).
3. `src/next.ts` (criteria 1-3), `src/phase.ts` (criteria 4, 5), imports (criterion 7).
4. Run section 7 commands; all named cases green; typecheck green.
5. `bunx prettier --write src/next.ts src/phase.ts src/state.ts`, one commit: `feat: engine notices write notice files`.

Advisory size: 3 files, under 30 turns.

## 7. Commands

- `akrogon run-check --name u2-busy -- bun test --timeout=30000 tests/next.test.ts -t 'busy seats persist'`
- `akrogon run-check --name u2-phase -- bun test --timeout=30000 tests/phase.test.ts -t 'stop from implement on dirty worktree|failed announce writes the failed notice'`
- `akrogon run-check --name u2-batch -- bun test --timeout=30000 tests/batch-dispatch.test.ts -t 'a failed holder with a landed candidate|a failed published holder receives one recovery notice'`
- `akrogon run-check --name u2-typecheck -- bun run typecheck`

## 8. Done-when, evidence and report

Done when criteria 1-8 hold and the commit exists. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite its `check <label>: <exit> <path>` line; read a log with `akrogon log <path>`. Return the commit id. Stop no process by command-line pattern; stop a run only with `akrogon stop-run <run-id>`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
