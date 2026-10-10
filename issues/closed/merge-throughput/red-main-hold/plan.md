# Plan: red-main-hold

When B judges a merge run red because `<remote>/<default_branch>` itself is broken, the command holds the repo instead of splitting the batch or bouncing the next holder. `akrogon phase <slug> check.fix --slot B --attempt <id> --red-on-base <sha> --command <exact command>` restores the batch, clears the record, writes a per-repo hold in `held.yaml` under `globalHome()`, appends one `held` attempt line, prints and notifies. `mergeTurn` checks the hold after its fetch and again inside the batch-creation lock: main changed outside `issues/` and `learnings/` clears the hold; otherwise no attempt starts. `akrogon unhold` clears by hand; `status` and `unpause` surface the hold.

Debate is off (`debate: no`); this synthesis plans directly from brief and design.

## Read first

- `src/pause.ts` — the file shape this leaf mirrors: `globalHome()` YAML record, `ENOENT`-means-empty read, `withLock` writer, `pauseCommand` pattern.
- `src/phase.ts` — `phaseCommand` merge-`check.fix` dispatch (~line 770): stale-attempt check, split path (`restoreMembers`/`restoreHolder`/`batch_limit`), solo `transition` with `appendAttempt(repo, slug, record, 'red')`, and `herdrCall` for the notification.
- `src/next.ts` — `mergeTurn` (~line 971): reconcile loop, `recorded.applied` dispatch, fetch + warn (~line 1007; the design's `:996` moved), the batch-creation `withLock` (~line 1016), `dispatchMergeLeaf`; `mergePass` (~1238) loops only while the holder leaves `merge`.
- `src/batch.ts` — `equalOutsideRecordFolders` (line ~23: `git diff --quiet a b -- ':(top)' ':(top,exclude)issues' ':(top,exclude)learnings'`), `restoreMembers`, `restoreHolder`.
- `src/attempts.ts` — `appendAttempt` signature and `Outcome` enum (already includes `'held'` from merged merge-attempt-records).
- `src/status.ts` — `readPaused` usage, `paused` heading annotation (~line 330) and the slug form's `paused:` print (~line 285).
- `src/akrogon.ts` — verb option maps (parseArgs keeps dashed names: `values['red-on-base']`), `unpause` case (prints then `unpausePass`).
- `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/merge-attempts.test.ts`, `tests/pause.test.ts`, `tests/pause-status.test.ts`, `tests/command-reference.test.ts` — fixture shapes: `fixture()`, `leaf()`, `batchFixture`, `advanceRemote`, fake-herdr `*.calls` log.
- `skills/merge-issue/SKILL.md` — "Shared endings" red paragraph (line ~65) and "attempt top" section; `skills/check-issue/SKILL.md` line ~61 for the base-run rule this references.
- `README.md` Command table, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/cheat.md`.
- `learnings/LESSONS.md` — especially 2026-10-10 (attempt records append exactly once per attempt; the `red` writer guards on `recorded`), 2026-10-08 (`bun run format` rewrites pre-existing drift; check `git status` after format and revert unrelated), 2026-10-01 (assert refusal/reason/side-effects, not prose wording).

## Decisions

- D1. New module `src/hold.ts` beside `src/pause.ts`, same file discipline: `heldFile()` → `globalHome()/held.yaml`; `holdSchema` = `z.record(repoName, {sha, command, holder, attempt, at, evidence, fix?})`; `readHeld()` lock-free (`ENOENT` → `{}`, invalid → `HoldStateError` naming the file, mirroring `PauseStateError`); `writeHeld()`/`dropHeld()` lock-free for callers already inside `withLock`; `setHeld()`/`clearHeld()` wrap them in `withLock(globalHome()/.lock)`; `unholdCommand(cwd)` mirrors `pauseCommand` — resolves the repo, clears, prints `unheld <repo>`; fails `No hold on <repo>` when absent. The optional `fix` field is the interface hold-fix-leaf consumes; this leaf never sets it.
- D2. `withLock` is not reentrant (nested `flock` on the same path deadlocks). The `--red-on-base` handler and `mergeTurn`'s in-lock re-check therefore use the lock-free primitives; only `unholdCommand`, the post-fetch site-1 clear, and outside-lock code take the lock.
- D3. `--red-on-base` is valid only on `check.fix` with `--slot`, `--attempt` and `--command`, and only while the leaf holds a batch record. `--command` without `--red-on-base` is refused. The existing stale-attempt guard runs unchanged; sha validity is `sha === (await localBase(repo))` after a fresh `git fetch <remote>` inside the phase lock — "current fetched" means the tracking ref after this call's own fetch.
- D4. The `--red-on-base` handler runs before the split/solo fork and is identical for both: `restoreMembers` + `restoreHolder` on `record`, `appendAttempt(repo, slug, record, 'held')`, `saveState({...s, batch: undefined})` with no `batch_limit` change, `writeHeld(repo.name, {sha, command, holder: slug, attempt: record.attempt, at: ISO, evidence: resolve(leaf.path,'review-B.md')})`, print `held <repo> on <sha>: <command>` (a stable single line), notify via `herdrCall(['notification','show', \`${repo.name} merge held on ${sha.slice(0,12)}\`, '--body', command, '--sound','request'], shownSchema, slug)` with failure degraded to a warning (mergeNotice shape, so a downed herdr never strands the hold). `committed = true` so `mergeWake` runs; the wake re-discovers no batch, hits the guard, and returns — one pass, no prompt.
- D5. `mergeTurn` checks the hold twice (design C):
  - Site 1, after the fetch/warn and before the batch-creation lock: `const held = heldFor(repo.name)`; if `held !== undefined` and `await equalOutsideRecordFolders(repo, held.sha, await localBase(repo))` → print `held <repo> on <sha>: <command>` and return. If outside differs → `clearHeld(repo.name)` (fresh lock, drop the entry) and continue.
  - Site 2, inside the batch-creation `withLock`, after `const builtOn = await localBase(repo)` and before writing the record: re-read `heldFor(repo.name)`; if still held and `equalOutsideRecordFolders(repo, held.sha, builtOn)` → print the same held line and return without a batch (a new hold can arrive between site 1 and the lock since `phase` takes the same `.lock`); if the sha moved → `dropHeld(repo.name)` in place and continue.
  - `builtOn` equals the fetched tracking ref already resolved in the block, so site 2 costs one `readHeld` per turn when unheld. `localBase` throwing C3 propagates as today.
- D6. Status shows both markers independently: heading `repo (paused)` / `repo (held)` / `repo (paused) (held)` in board and `--charts` output, plus `held: <sha> <command>` beside `paused:` in the slug form. `akrogon unpause` prints `unpaused` then the held line, then still runs `unpausePass` — the pass's own hold check prints the reason and returns. Manual `next` is blocked too: the hold is not gated on `isAutomatic` anywhere (pause's precedent stays separate; docs call this out).
- D7. merge-issue's red ending gains base judgment before the split/fix call: on red checks with no cause in the stack's diff, B runs the same command once in a detached worktree at `AKROGON_BASE` (the check-issue:61 procedure), records both runs in `review-B.md`, and on base-red ends with `check.fix --slot B --attempt <id> --red-on-base <fetched-main-sha> --command <exact command>`; a red-on-base refusal means main moved — refetch, re-run on the new base, re-judge.
- D8. `phaseCommand` signature grows `rawRedOnBase`, `rawCommand`; `akrogon.ts` adds `'red-on-base'`/`'command'` to the phase options and an `unhold` case. README row + `contracts.phase`/`contracts.unhold` in command-reference.test.ts update together (the test fails on drift).

## Units

Shared test resource: every unit uses `fixture()`/`fakeHerdr()` under `tests/helpers.ts` (isolated temp repos, no sharing between tests). `AKROGON_HOME`-scoped `held.yaml` keeps holds fixture-local.

| Unit | Wave | Owns | Depends on |
| --- | --- | --- | --- |
| U1 — hold module + `--red-on-base` ending | 1 | `src/hold.ts`, `src/phase.ts`, `src/akrogon.ts`, `tests/hold.test.ts` (new) | — |
| U4 — docs and merge-issue ending | 1 | `skills/merge-issue/SKILL.md`, `README.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/cheat.md`, `tests/command-reference.test.ts`, `src/AREA.md` | — (text only; contracts updated against the agreed CLI shape) |
| U2 — mergeTurn guard | 2 | `src/next.ts`, `tests/hold.test.ts` (guard cases appended; file created by U1 so edits don't collide) | U1 (`src/hold.ts` exports, `held.yaml` writer) |
| U3 — status/unpause surface | 2 | `src/status.ts`, `tests/pause-status.test.ts` | U1 (`src/hold.ts`) |

Wave 1 has U1 and U4 (disjoint paths, no dependency). Wave 2 has U2 and U3 (both land on U1's module; disjoint paths from each other).

### U1 — hold module + `--red-on-base`

- `src/hold.ts` per D1/D2; `src/phase.ts` per D3/D4; `src/akrogon.ts` phase options `'red-on-base'`, `'command'` (string) + `unhold` case per D8.
- `tests/hold.test.ts`: reuse the `batchFixture`/`soloFixture`/`attemptLines`/`advanceRemote` helpers from `tests/merge-attempts.test.ts` (export them or copy the minimal shape — prefer exporting from merge-attempts if a shared helper is not the cleaner call; keep the file's own fixture functions if export churn exceeds a few lines).
- Cases: (a) `check.fix --red-on-base <fetched sha> --command 'bun test'` on an applied batch → exit 0, `held` line printed, holder still `merge`, `batch` undefined, `batch_limit` absent, member branches back at saved heads, `held.yaml` entry with sha/command/attempt/evidence=`…/review-B.md`, one `held` attempt line, exactly one `notification show` call in fake-herdr `.calls` naming repo and sha. (b) Same call on a solo record → same outcome shape, `members: []`. (c) Wrong sha / stale attempt / missing `--command` / `--red-on-base` on `merged` or a leaf with no record → nonzero, named refusal, nothing written (no hold, no attempt line, batch intact). (d) `unhold` clears and prints `unheld repo`; `unhold` with no hold fails naming `repo`; `unhold` resolves the repo from a leaf worktree/subfolder like pause.

### U2 — mergeTurn guard

- `src/next.ts` per D5, both sites.
- Cases appended to `tests/hold.test.ts` (fake-herdr env, `cli(f,['next'])`): (e) held + unchanged main → `next` prints the held line, no herdr `tab create`/`agent prompt` calls, no batch record on the merge-phase leaf. (f) `advanceRemote` touching only `issues/` → still held, same assertions. (g) `advanceRemote` touching a real file → hold cleared (`held.yaml` empty), a batch attempt starts (record written/prompt sent). (h) `unhold` then `next` → attempt starts. Each case asserts the printed reason/side-effect, not wording beyond the fixed `held <repo> on <sha>:` prefix.

### U3 — status/unpause surface

- `src/status.ts` per D6: `readHeld` alongside `readPaused`, heading and slug-form prints.
- Cases appended to `tests/pause-status.test.ts`: heading shows `(held)` alone, `(paused) (held)` together, and neither after `unhold`; `status <slug>` prints `held:` only while held; `unpause` on a held repo prints `unpaused` and the held line.
- `unpause` printing lives in `akrogon.ts`'s unpause case but is asserted here via the CLI (U1 wires the call; U3 owns the status-side assertion — if the print lands in `pauseCommand` instead, still assert by CLI only).

### U4 — docs and merge-issue ending

- `skills/merge-issue/SKILL.md` per D7: red-ending paragraph leads with the base judgment (check-issue:61 run shape), records both runs and the cause in `review-B.md`, ends with the full `--red-on-base` call; stale-sha refusal → refetch, re-run, re-judge; also update the paragraph that claims every `check.fix` splits or moves (red endings now have three endings: split, check.fix, held).
- `README.md` Command table: `unhold` row; phase row gains `[--attempt <id>] [--red-on-base <sha> --command <command>]`. `tests/command-reference.test.ts` `contracts` updated in lockstep (existing-test edit → `Test-Change: tests/command-reference.test.ts contract extended for new phase flags and unhold` trailer on the commit).
- `docs/guide/merge.md`: the `check.fix` paragraph documents `--red-on-base <sha> --command <cmd>` — the leaf stays in `merge` with the record cleared, a hold names the sha and command, the next turn refuses until main moves outside `issues/`/`learnings/`, `akrogon unhold` clears it, a red run while held cannot start.
- `docs/guide/next.md`: hold differs from pause — `next`/`--all`/hooks all stop merge attempts while held; `unpause` prints an existing hold. `docs/guide/cheat.md`: `akrogon unhold` near pause/unpause.
- `src/AREA.md`: one line under Non-obvious patterns — a main-red merge ends in a repo hold (`held.yaml`) that mergeTurn checks after fetch and in the batch lock.

## Docs affected

`skills/merge-issue/SKILL.md`, `README.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/cheat.md`, `src/AREA.md` (one line each or the sections above). `tests/AREA.md`, `skills/AREA.md`, other guide pages: no change needed. `learnings/LESSONS.md`: only if a seat finds a reusable lesson.

## Notes for review

- The brief pins the guard to `src/next.ts:996`; in the live file the fetch now sits at ~1007 after merge-attempt-records landed. Guard sites follow the text ("after the fetch", "inside the locked build"), not the stale line number (D5).
- The brief says B "first records … then ends with" the `--red-on-base` call; the skill cannot guarantee call order against the live `held.yaml`, so the command validates sha-vs-fetched-main at call time and the skill documents the refetch/re-judge retry (D7).
- A `--check` flag combined with `--red-on-base` is refused — `--check` validates a move to `merged`/`check.fix`; a hold is not a move and has nothing to check.

## Verification

`checks` for this repo: `bun run format`, `bun test --timeout=30000`, `bun run typecheck` (all blocking per `akrogon config`). No `merge_checks` configured; none added.

| Criterion | Proof | Catches | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| 1. Valid `--red-on-base` holds the repo | tests/hold.test.ts (a),(b): state, `held.yaml`, heads, single `held` line, printed output | Restore/record/hold regressions | seconds | Any edit to src/hold.ts, src/phase.ts |
| 2. Stale attempt / wrong sha refused | tests/hold.test.ts (c): nonzero exit, unchanged state/files | Validation gaps, silent holds | seconds | src/phase.ts validation edits |
| 3. Held + unchanged main blocks `next` | tests/hold.test.ts (e),(f): no mutating herdr calls, held line | Missing or misplaced guard | seconds | src/next.ts guard edits |
| 4. Main moved → clear + attempt; issues-only → held | tests/hold.test.ts (g): real file advance clears and starts; (f) covers issues-only | Pathspec or comparison bugs | seconds | src/next.ts, src/batch.ts edits |
| 5. `unhold` clears; absent hold fails naming repo | tests/hold.test.ts (d),(h) | Missing command or wrong repo resolution | seconds | src/hold.ts, src/akrogon.ts edits |
| 6. Status shows paused/held; unpause prints hold | tests/pause-status.test.ts new cases: heading pairs and slug form | Annotation ordering/omission | seconds | src/status.ts edits |
| 7. One `notification show` per hold | (a),(b) assert exactly one `notification show` line in fake-herdr `.calls` | Duplicate/missing notify | seconds | src/phase.ts notify edits |
| 8. Skill/docs document the ending | `skills/merge-issue/SKILL.md` diff shows base-first order and the full flag form; README table + `docs/guide/merge.md` name `--red-on-base` and `unhold`; command-reference.test.ts passes | Contract drift, undocumented flag | seconds | Doc/skill edits |
| 9. Blocking `checks` pass | `bun run format` (then `git status` clean — see 2026-10-08 lesson), `bun test --timeout=30000`, `bun run typecheck` | Regressions, type errors, drift | minutes | Any unit completion |

Deliberate-break evidence (standing design): each unit shows one break turning its new test red (e.g. U2 runs (e) with the site-2 check deleted; U1 runs (a) with `writeHeld` skipped).

Restart boundary: long-running `akrogon next` processes keep old code until the operator restarts them at handoff (design sequencing lock); the plan needs no in-band migration since `held.yaml` is absent-means-unheld.
