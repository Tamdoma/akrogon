# Worker brief U2: mergeTurn hold guard

## 1. Goal

Implement plan decision D5 for leaf `red-main-hold`: `mergeTurn` in `src/next.ts` checks the repo's hold after the fetch and again inside the batch-creation lock. Held + fetched main equal outside `issues/` and `learnings/` → print the held line and start no attempt; main moved outside → clear the hold and proceed. Done-criteria proven: 3, 4.

## 2. Numbered acceptance criteria

1. With a `held.yaml` entry for `repo` whose `sha` equals the fetched `origin/main`, `akrogon next` exits 0, prints `held repo on <sha>: <command>`, records no batch on the merge-phase leaf, and makes no `tab create`/`pane split`/`agent prompt`/`agent start` herdr calls.
2. After `advanceRemote` commits only under `issues/` (sha changes, trees equal outside `issues/`/`learnings/`), `akrogon next` still holds: same assertions as 1.
3. After `advanceRemote` touches a real file outside `issues/`/`learnings/`, `akrogon next` clears the `held.yaml` entry for the repo and starts a normal attempt (holder gains a batch record and its B is prompted).
4. With no hold, behavior is unchanged: `akrogon next` builds and dispatches as before (existing tests stay green).
5. The inside-lock re-check exists and works in code: a hold written between the post-fetch check and the lock acquisition still aborts the turn (proven by review/structure; not required to be driven by a race test).

## 3. Read-first list

- `src/next.ts` — `mergeTurn` (~line 971): the `git fetch` + warning block (~line 1007), then `let batch` and the batch-creation `withLock` (~line 1016) containing `const builtOn = await localBase(repo)`; `heldFor`/`clearHeld`/`dropHeld` come from `src/hold.ts`.
- `src/hold.ts` (landed by U1; if absent in your worktree, A shipped it — read `resolve(globalHome(),'held.yaml')` schema there): `heldFor(name): Hold | undefined` lock-free read; `dropHeld(name)` lock-free (use inside existing `withLock`); `clearHeld(name)` wraps `dropHeld` in `withLock` (use only outside a lock — `withLock` is not reentrant, nested `flock` deadlocks).
- `src/batch.ts` — `equalOutsideRecordFolders(repo, a, b)`: true when trees equal outside `issues/`/`learnings/`.
- `src/preflight.ts` — `localBase(repo)`: fetched tracking ref sha.
- `tests/hold.test.ts` — existing cases from U1; your cases append here.
- `tests/merge-attempts.test.ts` — `advanceRemote(f, files)`, `remoteTip(f)`, `batchFixture` shapes; `tests/helpers.ts` — `cli`, `fakeHerdr`, `leaf`, `yaml`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/next.ts`, `tests/hold.test.ts` (append; file exists on the lane). Depends on U1's `src/hold.ts` exports — already landed on the branch your worktree starts from.

`src/next.ts`:

- Add to the import block: `heldFor`, `dropHeld`, `clearHeld` from `./hold`, type `Hold` if needed.
- Site 1 — in `mergeTurn`, after the fetch-warning block and before `let batch: Batch | undefined`:
  ```ts
  const heldBefore: Hold | undefined = heldFor(repo.name);
  if (heldBefore !== undefined) {
    const baseSha: string = await localBase(repo);
    if (await equalOutsideRecordFolders(repo, heldBefore.sha, baseSha)) {
      console.log(`held ${repo.name} on ${heldBefore.sha}: ${heldBefore.command}`);
      return;
    }
    await clearHeld(repo.name);
  }
  ```
- Site 2 — inside the batch-creation `withLock`, right after `const builtOn: string = await localBase(repo);` and before `const members`:
  ```ts
  const heldNow: Hold | undefined = heldFor(repo.name);
  if (heldNow !== undefined) {
    if (await equalOutsideRecordFolders(repo, heldNow.sha, builtOn)) {
      console.log(`held ${repo.name} on ${heldNow.sha}: ${heldNow.command}`);
      return;
    }
    dropHeld(repo.name);
  }
  ```
- Do not gate either check on `isAutomatic` — a hold stops manual and automatic `next` alike.
- `heldFor` re-reads `held.yaml` per call; the site-2 re-read is the point (a `--red-on-base` call can land between site 1 and the lock since `phase` holds the same `.lock`). No caching.

`tests/hold.test.ts` additions (write the hold file directly with `yaml(resolve(f.home,'held.yaml'), {repo: {sha, command:'bun test', holder:'hold', attempt:'a1', at: new Date().toISOString(), evidence: '/x/review-B.md'}})`; leaf `hold` in phase `merge` with `merge_stamp` and a branch/worktree as in `batchFixture`):

- (e) hold at fetched sha → `next` prints `held repo on <sha>`, no mutating herdr calls (reuse the `mutating`/`.calls` filter style from `tests/pause-next.test.ts`), `readState(leaf).batch` still undefined.
- (f) `advanceRemote(f, {'issues/open/x/state.yaml': 'x\n'})` after the hold → still held, same assertions. Use the pre-advance `remoteTip` as the hold sha.
- (g) hold at old sha, `advanceRemote(f, {'real-file': 'x\n'})` → `held.yaml` entry gone, `readState(leaf).batch !== undefined`, a prompt reached the fake herdr.
- (h) `akrogon unhold` then `next` → batch record exists, hold file entry gone. Skip if U1 already covers it — note in report.

One deliberate break turning a new test red (record it): e.g. comment out the site-2 check and verify (e) still passes — then instead delete the site-1 return and watch (e) fail; restore.

## 5. Do-not, reasons and exceptions

- Do not move the site-1 check before the fetch — the design pins it after fetch ("uses existing tracking ref" is the whole point of the warn path).
- Do not call `setHeld`/`clearHeld` inside an existing `withLock` — `flock` on the same path is not reentrant and will deadlock the suite; use `dropHeld`/`heldFor` there.
- Do not edit `src/hold.ts`, `src/phase.ts`, `src/status.ts`, `src/akrogon.ts`, or the merge-issue skill — other units own them.
- Do not add a `next`-level `held` sweep outside `mergeTurn` (e.g. in `nextCommand`) — the design's guard lives in `mergeTurn` only; `reconcileBatch` and `sweep` keep working normally while held.
- A newer hold landing between the site-1 read and `clearHeld` can be dropped — acceptable (no batch exists at that point so no hold writer can run concurrently in practice, and a dropped newer hold only runs one extra attempt).
- Return a mismatch with evidence instead of changing an interface; the exception is a revised brief from A. Restating: the exclusions keep the guard exactly where the locked design puts it; only a revised brief from A authorizes a change.

## 6. Ordered steps

1. Write test (e) — hold + unchanged main blocks `next` (criterion 1).
2. Apply the two `src/next.ts` edits.
3. Tests (f), (g), (h).
4. Run the changed-test command until green; run one deliberate break and confirm red; also run `bun test tests/next.test.ts tests/pause-next.test.ts` directly — mergeTurn consumers.

Advisory size: 2 files, under 40 turns.

## 7. Commands

```sh
AKROGON_BASE=547063c52e068702aaa9e77117b749e9d1341275 bun test --changed="$AKROGON_BASE" --timeout=30000
```

`bun install` first if `node_modules` is absent. `bun test tests/hold.test.ts` is the tight loop.

## 8. Done-when, evidence and report

All criteria pass with pasted outputs; commit ID returned. Your commit edits the existing `tests/hold.test.ts`, so it must carry the trailer `Test-Change: tests/hold.test.ts <what was added; no existing expectation changed>` in its final trailer block (no source citation needed for added cases).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
