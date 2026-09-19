# Brief 1: failed-transition announce (shell, phase, fake herdr, phase tests)

## 1. Goal

A move to `failed` announces itself inside `commitMove`: `herdr notification show "<repo>/<slug> failed" --body "<cause>: <reason>" --sound request`, the returned reason persisted as `failure.delivery` before anything else, then `herdr tab rename <tab> "<slug> failed"` when the leaf has a tab. A move out of `failed` renames the tab back to `<slug>`. Each herdr call is attempted once and retried once on a retryable herdr error; a final failure leaves the committed move and recorded delivery standing, still attempts the other call, and exits non-zero with the last herdr error. Implements plan decisions D1, D2, D3, D4, D7 and the helpers/phase-test half of D8.

## 2. Numbered acceptance criteria

1. `phase <slug> failed --reason x` on a leaf whose `tab` is seeded in the fake db records exactly one `notification show` call with argv `['notification','show','repo/<slug> failed','--body','blocked: x','--sound','request']` and one `tab rename` call `['tab','rename','<tab>','<slug> failed']`; `readState(path).failure.delivery === 'shown'`; exit 0.
2. `phase <slug> implement` from `failed` on a tabbed leaf records `['tab','rename','<tab>','<slug>']`; with `failRename` set the move still stands (`phase: 'implement'`), exactly two rename calls are recorded, and the command exits non-zero with the herdr error (`timeout`) in stderr.
3. A failed move on a leaf without `tab` records the notification and zero `tab rename` calls.
4. `failNotification` (permanent, non-retryable) with rename succeeding: exactly one notification call (no retry), `delivery: 'error'`, the tab renamed in the fake db, leaf `failed`, exit non-zero. `failRename` with notification succeeding: `delivery: 'shown'`, leaf `failed`, exit non-zero.
5. `failNotificationOnce`: two `notification show` calls, `delivery: 'shown'`, exit 0 — the bounded retry succeeds.
6. Dispatch-driven failures announce through the same path: the existing attempts-cap test in `tests/next.test.ts` still passes with the fake recording a notification and a rename during the dispatch that moves the leaf to `failed`.
7. No test invokes the real `herdr` binary: every `tests/phase.test.ts` test that moves a leaf to `failed` passes the fake env to `cli`.

## 3. Read-first list

- `src/phase.ts` — `commitMove` try/finally shape; the announce block lands inside it.
- `src/shell.ts` — `herdr()`, `command()`, `CommandError.result`; new home of `retryable`.
- `src/next.ts` — `retryable`, `retryableCodes`, `herdrErrorSchema` definitions to move out (nothing else in this file changes in this brief).
- `src/state.ts` — `failureSchema` (`delivery` already optional), `Failure` type.
- `tests/fake-herdr.ts` — `result()`, `failure()`, `flag()`, `failNotification` pattern.
- `tests/helpers.ts` — `fakeGh` as the model for `fakeHerdr`; `cli` env parameter.
- `tests/phase.test.ts` — `stop from implement on dirty worktree` (tabbed leaf), `stops land in failed`, `fix cap records attempts failure`, `review aggregates verdicts`, `failed routing and reason misuse` — all move to `failed` and need the fake env.
- `tests/next.test.ts` — `dispatchFixture`, `calls()` reader pattern for `.calls` files.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/shell.ts`: move `herdrErrorSchema`, `retryableCodes` and `retryable(result: Result): boolean` verbatim from `src/next.ts` and export `retryable`. Nothing else changes.
- `src/next.ts`: delete the three moved definitions; add `retryable` to the existing `./shell` import. Do not touch `dispatchLeaf` or any logic — owned by brief 2.
- `src/phase.ts`:
  - Import `herdr`, `retryable`, `CommandError` from `./shell` and `failureSchema` from `./state` (`command` import stays).
  - Add a module-local helper:
    ```ts
    async function herdrCall<T>(args: string[], schema: z.ZodType<T>, slug: string): Promise<T> {
      try {
        return await herdr(args, schema);
      } catch (error) {
        if (!(error instanceof CommandError) || !retryable(error.result)) throw error;
        console.warn(JSON.stringify({ warning: 'herdr call failed, retrying', slug, command: ['herdr', ...args], code: error.result.code, stderr: error.result.stderr }));
        return await herdr(args, schema);
      }
    }
    ```
  - Add `announceFailed(repo: Repo, leaf: Leaf, state: State): Promise<State>`: parse `state.failure` with `failureSchema` (a missing record throws rather than silently skipping the alert); attempt the notification with title `${repo.name}/${state.slug} failed`, body `${failure.cause}: ${failure.reason}`, sound `request`, schema `z.object({ shown: z.boolean(), reason: z.string() })`; on final failure capture `lastError` and keep `delivery = 'error'`, on success `delivery = shown.reason`. Then `saveState(leaf.path, { ...state, failure: { ...failure, delivery } })` — before the rename is attempted. Then when `state.tab !== undefined` attempt `['tab','rename', state.tab, `${state.slug} failed`]` with schema `z.object({ tab: z.object({ label: z.string() }) })`, capturing a final failure into `lastError`. Rethrow `lastError` if set; return the announced state otherwise.
  - In `commitMove`, inside the existing `try` (so `logMove` still runs in `finally` when a herdr call fails):
    ```ts
    let announced: State = after;
    try {
      if (to === 'failed') announced = await announceFailed(repo, leaf, after);
      else if (recorded.phase === 'failed' && after.tab !== undefined)
        await herdrCall(['tab', 'rename', after.tab, after.slug], z.object({ tab: z.object({ label: z.string() }) }), after.slug);
      if (to === 'merged') await completeOwner(repo, leaf, true);
    } finally {
      ... existing logMove block, passing `announced` ...
    }
    return announced;
    ```
    A rename-back failure propagates after `logMove` — the move stands and the command exits non-zero, which is the contract.
- `tests/fake-herdr.ts`:
  - `notification show`: keep `failNotification`; add `failNotificationOnce` (reset the flag, then `failure('fixture_notification_failed')`); validate `flag('--body')` and `flag('--sound')` (flag throws on a missing flag); success returns `result({ shown: true, reason: 'shown' })`. The existing `z.tuple` arg check must be relaxed so the extra flags parse — check `args[0]/args[1]` and the title positional only.
  - Add `tab rename <tab_id> <label>`: find the tab in `db.tabs`; missing → `failure('tab_not_found')`; when `db.failRename` → `failure('timeout')` (a retryable code); otherwise set `tab.label = args[3]` and `result({ tab })`.
  - Extend `databaseSchema` with `failNotificationOnce: z.boolean().default(false)` and `failRename: z.boolean().default(false)`.
- `tests/helpers.ts`: add `fakeHerdr(f: Fixture): { db: string; env: NodeJS.ProcessEnv }` mirroring `fakeGh` — mkdir `herdr-bin`, symlink `fake-herdr.ts` as `herdr`, seed `herdr.json` with `{ panes: [], tabs: [], serial: 0 }`, return `{ db, env: { PATH: `${bin}:${process.env.PATH}`, FAKE_HERDR: db } }`.
- `tests/phase.test.ts`:
  - Pass `fakeHerdr(f).env` as the `cli` env argument in every test that moves a leaf to `failed`: `review aggregates verdicts` (the cap move), `stop from implement on dirty worktree`, `stops land in failed`, `failed routing and reason misuse`, `fix cap records attempts failure`. For `stop from implement` seed the db with `tabs: [{ tab_id: 'tab-1', label: 'stop' }]` so the rename finds it.
  - Add a `calls`-style reader for `herdr.db + '.calls'` (same pattern as `tests/next.test.ts`).
  - Extend `stop from implement on dirty worktree` or add a test asserting criterion 1's exact argv and `delivery: 'shown'`.
  - Add a test covering criteria 2–5: tabbed failed leaf → `phase <slug> implement` rename-back success; same with `failRename` → two calls, phase `implement`, non-zero exit, `timeout` in stderr; leaf without tab → notification only; `failNotification` → one notification call, `delivery: 'error'`, rename still recorded, non-zero exit; `failRename` alone → `delivery: 'shown'`, non-zero exit; `failNotificationOnce` → two calls, `delivery: 'shown'`, exit 0. Use fresh fixtures per scenario as existing tests do.

## 5. Do-not, reasons and exceptions

- Do not remove `failed_notified` or the `dispatchLeaf` "Failed leaf" block — owned by brief 2; exception: none.
- Do not touch `src/state.ts`, `tests/state.test.ts`, `tests/next.test.ts` logic, or `tests/status.test.ts` — owned by brief 2.
- Do not change `logMove`, the log schema, or `commitMove`'s signature — the design adds no log fields and callers stay unchanged.
- Do not retry non-`CommandError` throws or non-retryable codes — the contract retries only retryable herdr errors.
- Do not swallow the final herdr error — the command must exit non-zero; the committed move and `delivery` are what stand.
- Do not commit — B commits after the full suite.
- Return a mismatch with evidence instead of changing a locked decision or an interface; the exception is a revised brief from B.

## 6. Ordered steps

1. `src/shell.ts` + `src/next.ts` — move and export `retryable` machinery (D4). Criterion: `bun run typecheck` clean.
2. `tests/fake-herdr.ts` — `tab rename`, notification reason/`--body`/`--sound`, `failNotificationOnce`, `failRename` (D7).
3. `tests/helpers.ts` — `fakeHerdr` (D8).
4. `tests/phase.test.ts` — write the new failing assertions (criteria 1–5) and the fake-env updates; run them red against unmodified `src/phase.ts` (no calls recorded / no `delivery`).
5. `src/phase.ts` — `herdrCall`, `announceFailed`, `commitMove` wiring (D1–D3); run the changed-tests command green.
6. `tests/next.test.ts` — confirm the attempts-cap scenario still passes (criterion 6); no edits expected.

Advisory size: about 6 files and under 30 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=f91cea968ac46f5a30119e4ce03eac611cc66abd`

## 8. Done-when, evidence and report

All criteria hold with pasted changed-test output: exact argv in `.calls`, `delivery` values, exit codes, and the red-then-green evidence for the new assertions. Scenarios use temporary repositories and the fake herdr at the PATH boundary — no real herdr socket, panes or notifications.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
