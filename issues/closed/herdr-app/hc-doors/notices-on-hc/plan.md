# Plan: notices-on-hc

Slot A, plan.synthesis, 2026-11-08. Worktree `/home/ivan/.akrogon/worktrees/akrogon/notices-on-hc`, base `e3202dff` (engine-on-hc landed: `src/hc.ts` has `repoSpace` and `appHome`). Log paths are relative to this leaf folder.

## Read first

- `brief.md`, `design.md` (this folder). `design.md` Leaf architecture holds the literal file contract.
- `docs/reference-index.md`, `src/AREA.md` (key files: `hc.ts`, `verify.ts`, `phase.ts`, `shell.ts`), `tests/AREA.md` (`hc-fixture.ts`, `isolation.ts`).
- `learnings/LESSONS.md`. Relevant: `z.string().min(1)` accepts blanks (2026-09-19, so the verb's title uses `.trim().min(1)`); a native screenshot can be stale (2026-11-03, so the window tier keeps a second observation besides `herdr-app shot`); run-check TMPDIR cross-device (2026-10-22, so the writer renames inside the notice folder, never across folders).
- `src/hc.ts:206` `repoSpace` (memoized per process), `src/hc.ts:497` `appHome`.
- Callers: `src/next.ts:157` `observeBusy`, `src/next.ts:727` `mergeNotice`, `src/next.ts:825` failed holder in `reconcileBatch`, `src/next.ts:601` failed branch of `dispatchLeaf`; `src/phase.ts:57` `herdrCall`, `src/phase.ts:92` `announceFailed`, `src/phase.ts:187` `commitMove`; `src/verify.ts:237` `noticeCovers`, `src/verify.ts:323-358` `noticeSend`/`sendMainRedNotice`/`sendMergeSlowNotice`, `src/verify.ts:385` `decideSlow`, `src/verify.ts:580-606` the locked final rewrite.
- `skills/watch-issues/SKILL.md:42` (the needs-you line), `skills/watch-issues/scripts/observe.ts:204-208` (prints `notified=` and `delivery=`; unchanged).
- herdr-setup's handler: `/home/ivan/Work/infra/herdr-setup/mods/session-status/notices.js` (reads only names ending `.json`, logs `akrogon-notice <outcome>`), its leaf `issues/closed/herdr-app/status-notices/plan.md` (window-run steps reused below).
- `tests/e2e/tier.ts`, `tests/e2e/window.e2e.ts` (attended tier pattern).

No gap: every listed resource exists.

## Notes for review

- No brief/design conflict found.
- Brief criterion 1 says "the next pass" records shown or pending. For engine records (`busy_notified`, `failure.delivery`, `batch.notified`) that is the next `akrogon next` pass. For verify's ledger fields it is the next verify run of that repo that runs the main-red or merge-slow logic (D5): the ledger is written only by verify, and its consumers (`noticeCovers`, `decideSlow`) run only there.
- The planning reds for most callers ran against a temporary `src/notice.ts` stub (real writer and id, no caller changes) so the test files load. The stub was deleted before the test commit. Its reds are the missing caller behavior. Per-condition violation reds for caller decisions need product code, so implementation re-shows each one by a temporary violating edit and records it in `implementation/report.md` (table below names each).

## Decisions

- **D1 One notice module.** New `src/notice.ts` owns the file contract. Exports: `type Notice = { title: string; body: string; attention: boolean }`; `noticeFolder(session: string): string` = `resolve(appHome(session), 'akrogon-notices')`; `noticeId(repo: string, ...parts: string[]): string` = `[repo, ...parts].join('.')`; `noticePath(folder, id)` = `resolve(folder, id + '.json')`; `writeNotice(folder, id, notice): void` (create the folder recursively, write `.<id>.<pid>.tmp` in the same folder, rename to `<id>.json`, throw on any failure); `noticeState(folder, id): 'pending' | 'shown'` (file present or gone); `removeNotice(folder, id): void` (`rmSync` force). `appHome` already throws naming the expected path when the session home is missing. No herdr or herdr-app call lives here.
- **D2 Ids (Open for the plan).** Deterministic per notice so a later pass finds the file without storing a path: busy `noticeId(repo, 'busy', slug, seat)`, failed `noticeId(repo, 'failed', slug)`, merged `noticeId(repo, 'merged', slug)`, main red `noticeId(repo, 'main-red', run)`, merge slow `noticeId(repo, 'merge-slow', first.run)` (one per episode), verb `noticeId(repo, 'notice', randomUUID())`. Repo first keeps repos apart in one shared session folder. Slugs are unique per repo, so one id per condition.
- **D3 Session.** Every caller resolves the repo's session through engine-on-hc's `repoSpace(repo)` and writes into `noticeFolder(space.session)`. A refused resolution is the caller's write failure (D7). No caller uses `repoSession`, `herdrArgv` or `herdr`.
- **D4 Records keep their fields.** `busy_notified[seat]`: `'pending'` after the write, `'shown'` after the fold. Older timestamp values read as shown (not `'pending'`). Schema unchanged. `failure.delivery`: `'pending'`, `'shown'` or `'error'`. Older herdr reasons stay as written. `batch.notified`: schema becomes `'pending' | 'shown'`, absent meaning not yet written or a failed write. The schema maps an old `true` to `'shown'` and an old `false` to absent with `z.preprocess` at the state boundary, so old records still parse. Verify `notice` and `slow.notice`: `'pending'`, `'shown'` or `'error'`.
- **D5 Fold points.** Busy: `observeBusy`, while the seat is still working or blocked and `busy_notified[seat] === 'pending'`, sets `'shown'` when the file is gone and saves. Failed: the failed branch of `dispatchLeaf`, when `failure.delivery === 'pending'`, before its recovery refusal. Merged: the failed-holder branch of `reconcileBatch`: `'shown'` stays, `'pending'` folds, absent writes. Verify: inside the run's locked final rewrite, before `newRedUnits` and `decideSlow`, every ledger row with `notice` or `slow.notice` `'pending'` whose file is gone becomes `'shown'`. Resolution stays lazy: a pass resolves the space only when a record is `'pending'` or a write or removal is due.
- **D6 Removal of cleared notices (Open for the plan).** Busy: the `observeBusy` pass that sees the seat neither working nor blocked removes that seat's file when its record is `'pending'`, then clears the record as today. `commitMove` into `failed` or `merged` (which resets `busy_notified`) removes each seat's busy file whose record was `'pending'`. Failed and merged: `commitMove` leaving `failed` removes the failed file when `failure.delivery === 'pending'`, and the merged file when `batch.notified === 'pending'`, and drops `batch.notified` so a later failure of the same batch writes again. Every exit from `failed` goes through `commitMove` (traced: `src/phase.ts:303,406,459`, `src/next.ts:524`; `refuseEnclosingCompletion` only enters failed). Main red, merge slow and verb notices are never removed by akrogon: the brief names only busy and failed as cleared conditions, and a verb notice has a random id.
- **D7 Write failures keep today's handling.** Busy throws, so the record stays unset and the next pass writes again. Merged warns and leaves `notified` absent, so the next pass writes again. Failed records `delivery: 'error'`. Main red and merge slow record `'error'` and print `notice: <error>` to stderr. The verb exits nonzero with the error.
- **D8 Verify writes inside its lock.** Verify resolves the folder before the locked final rewrite, only when the run has `compares` or merge scope (the only runs that reach main-red or slow logic). A refused resolution becomes `{ error }`. Inside the lock it folds (D5), decides, writes the file and records `'pending'` or `'error'` in the same rewrite. A local file write cannot hang, so the pending reservation and the second locked write (`rewriteRun`, `noticeSend`, `sendMainRedNotice`, `sendMergeSlowNotice`) go away. `bootId` and `pidAlive` imports leave `verify.ts` if nothing else there uses them.
- **D9 Cover rule (criterion 3).** One helper in `verify.ts`, `noticeCovers(value: string | undefined, folder: string | null, id: string): boolean` = `value !== undefined && value !== 'error' && (value !== 'pending' || (folder !== null && existsSync(noticePath(folder, id))))`. `newRedUnits` uses it with the main-red id and `decideSlow` with the merge-slow id. The pid and boot clauses go. `'shown'` and older herdr reasons cover. Unknown folder means a pending row does not cover, but the write it triggers also fails and records `'error'`, so no second toast is possible.
- **D10 Texts as today.** Busy: title `Busy leaf: <repo>/<slug> seat <seat> <h>h<mm>m`, body `''`, attention false. Merged: `<repo>/<slug> merged, move it back`, body `next: akrogon phase <slug> merge`, attention true. Failed: `<repo>/<slug> failed`, body `<cause>: <reason>`, attention true. Main red: `<repo> main red`, body `<n> new red on main: <first three>; receipt <run>; chart a repair`, attention false. Merge slow: `<repo> merge slow`, body the current send text, attention false. Needs-you: written by the watcher through the verb with `--attention`.
- **D11 Notice verb.** `akrogon notice --title <text> --body <text> [--attention]`: options `title` (string), `body` (string), `attention` (boolean) in the verb's option table; `requireRepo(readGlobal(), process.cwd())`; title `z.string().trim().min(1)`, body `z.string()` (empty allowed); `repoSpace` refusal throws its reason; writes `noticeId(repo, 'notice', randomUUID())` and prints the written path. Row in `docs/reference/commands.md` (Run work) and `contracts` entry in `tests/command-reference.test.ts`.
- **D12 Watch skill needs-you line.** Both `herdr --session <name> notification show ... --sound request` forms become `akrogon notice --title "<repo>/<slug> needs you" --body "<body>" --attention`, run from the repo root. The generic notice's condition "`failure.delivery` is not `shown`" becomes "is neither `shown` nor `pending`": a pending failed notice waits for the window and will show, so a needs-you on top would toast twice. The rest of the line is unchanged.
- **D13 Old herdr code.** `phase.ts`'s `herdrCall` and every notice `herdr`/`herdrArgv`/`repoSession`/`retryable` import in `next.ts`, `phase.ts`, `verify.ts` go. `src/shell.ts` keeps `herdr`, `herdrArgv`, `repoSession` and their helpers, since `skills/watch-issues/scripts/observe.ts:6` still imports `herdrArgv` and `repoSession` (watcher-on-hc), and `retryable`/`herdrError`, since `tests/shell.test.ts` imports them (herdr-sweep). `FAKE_HERDR` in verify's `passForwarded` and `tests/fake-herdr.ts` stay for herdr-sweep. Recorded in the report as remaining importers.
- **D14 Unchanged consumers.** `note` and `leafAttention` in `src/status.ts` read `failure.cause`, `failure.reason`, `batch.owner` and `batch.recorded`, never the notice values (traced `src/status.ts:165-200,584-604`), so they stay. `observe.ts` prints `notified=` from defined `busy_notified` keys and `delivery=` verbatim. Both stay, and D12 updates the skill's reading of `delivery`.
- **D15 Window tier (criterion 4).** `tests/e2e/notices.e2e.ts`, run by name with `AKROGON_E2E=notices`, written at planning (replan 2026-11-08, test commit). `tests/e2e/tier.ts` gains `TierSession` (`tierSession(name)`: socket, app home, core state) and `engine` (`akr-e2e-engine`). `startTier` takes the session first, `Tier` carries it, `absent` takes it, and `stopTier` reads it from the tier. `window.e2e.ts` and `kinds.e2e.ts` pass `engine`. The window, `herdr-app status`/`shot` and `pactl` get `WAYLAND_DISPLAY`, `DISPLAY` and `DBUS_SESSION_BUS_ADDRESS` from `systemctl --user show-environment`, because run-check passes a clean environment (herdr-setup status-notices report: shots failed without them). The whole flow runs inside one run-check, so the window lives for the run (status-notices: a window started by one run-check dies when it returns). Flow, exactly 2 herdrapp starts of `akr-e2e-notices`:
  1. Fail before any start, naming herdr-setup and `/home/ivan/Work/infra/herdr-setup/install`, when the handler file is missing. The path is `AKROGON_E2E_HANDLER`, set to `/home/ivan/.config/herdr-app/mods/session-status/notices.js` for the real run.
  2. `startTier` (its `openOnce` is start 1: creates the home and links the personal mods, then stops), then a clean core with space `akre2e`.
  3. Assert `<session home>/mods/session-status/notices.js` resolves to the handler, else fail naming herdr-setup.
  4. Window closed: `akrogon notice --title 'akre2e closed' --body 'written with the window closed' --attention`, then check the file is present at the printed path inside the session's `akrogon-notices/`.
  5. Start 2: `herdrapp --session akr-e2e-notices`. Wait, bounded at 20 s by an `fs.watch` on the folder (armed before the first check), until the closed notice's file is gone. Expect the `akrogon-notice` line with its name and `"outcome":"shown"` in `~/.local/state/herdrapp/akr-e2e-notices.log`, and a `toast` in `herdr-app status` overlays. Record the status and the `herdr-app shot` result.
  6. Window open: with `pactl subscribe` capturing, write an attention notice. Wait until its file is gone. Expect a `new` sink-input event within 5 s (waiting on pactl's own output), the log line and a toast overlay. Then write a silent notice. Expect it deleted, its log line, and no new sink-input event within 5 s.
  7. Keep the window log (session delete removes it), then `stopTier` plus the grant's absence check.

  Artifacts go to `implementation/notices-tier/`.

## Interfaces

- `src/notice.ts` as in D1 (tests import `noticeId` and `writeNotice`).
- Notice file: `<app home>/akrogon-notices/<id>.json` = `{"title": string, "body": string, "attention": boolean}`, written via a temporary name not ending `.json`.
- `batch.notified?: 'pending' | 'shown'` (D4).
- Verb: `akrogon notice --title <text> --body <text> [--attention]`.
- Test helpers added to `tests/hc-fixture.ts`: `noticeFolder(core)`, `noticeFiles(core)` (reads only `*.json`, fails on any other entry), `blockNotices(core)` (a plain file where the folder goes, so writes fail).

## Units and waves

| Unit | Owns | Shared test resource | Lands after |
| --- | --- | --- | --- |
| U1 notice module and verb (D1, D2, D11) | `src/notice.ts`, `src/akrogon.ts`, `docs/reference/commands.md`, `tests/command-reference.test.ts` (contract line) | none | none |
| U2 engine callers (D3-D7, D10, D13) | `src/next.ts`, `src/phase.ts`, `src/state.ts` | none | U1 |
| U3 verify callers (D5, D7-D9, D13) | `src/verify.ts` | none | U1 |
| U4 watcher line (D12) | `skills/watch-issues/SKILL.md`, `docs/use/watch-while-away.md` | none | U1 |
| U5 port the remaining old notice tests (list below) | `tests/next.test.ts`, `tests/phase.test.ts`, `tests/session-routing.test.ts`, `tests/verify.test.ts`, `tests/slow-merge.test.ts` | none | U2, U3 |
| U6 window tier script (D15), landed at planning in the replan test commit | `tests/e2e/notices.e2e.ts`, `tests/e2e/tier.ts`, `tests/e2e/window.e2e.ts`, `tests/e2e/kinds.e2e.ts` | none until run | U1 |
| U7 docs | `src/AREA.md`, `tests/AREA.md`, `docs/reference/state-and-phases.md`, `docs/reference/checks.md` | none | U2, U3 |
| U8 proofs (A inline) | `implementation/report.md`, `implementation/notices-tier/` | window session `akr-e2e-notices` (grant) | all |

- Wave 1: U1.
- Wave 2: U2, U3, U4.
- Wave 3: U5, U6, U7.
- Wave 4: U8.

Replan 2026-11-08: U1-U5 and U7 landed in the first implement pass (head `6c42e1c0`, `implementation/report.md`). U6 landed at planning in the replan test commit. The only remaining unit is U8 (A inline), so the remaining run is serial-solo. U8 reruns proof only where the head changed: the replan touched only `tests/e2e/`, which the `test` check does not run. Every test file in U5 and U6 already changed on this branch, or is matched as a test file, so each commit touching it carries `Test-Change: <path> <source and reason>`.

### File and criterion checklist

- [ ] U1 `src/notice.ts` (C1, C2, C3 helpers). `src/akrogon.ts` `case 'notice'` (C1 needs-you). `docs/reference/commands.md` row. `tests/command-reference.test.ts` contract `notice: '--title <text> --body <text> [--attention]'` (red as soon as the case lands without its row).
- [ ] U2 `observeBusy` write/fold/remove (C1, C2). `mergeNotice` becomes a file write, and `reconcileBatch` folds (C1). `dispatchLeaf` failed fold (C1). `announceFailed` writes (C1). `commitMove` removals (C2). `batchSchema.notified` (D4). `herdrCall` deleted.
- [ ] U3 locked write, fold, cover helper (C1, C3). `noticeSend`, `sendMainRedNotice`, `sendMergeSlowNotice` and `rewriteRun` deleted if unused.
- [ ] U4 needs-you line (C1, C5). Doc line 24.
- [ ] U5 old tests ported or deleted, each named in the report (C6).
- [ ] U6 tier script (C4).
- [ ] U7 docs, one line each:
  - `src/AREA.md`: the shell line drops "today's notice sends", the verify lines say notice file instead of herdr notification and reason, and a key-file line for `src/notice.ts`.
  - `tests/AREA.md`: the hc-fixture notice helpers, and session-routing/slow-merge notice wording.
  - `docs/reference/state-and-phases.md`: `busy_notified`, `delivery`, `notified` values.
  - `docs/reference/checks.md:79`: the merge-slow notice wording.
  - Unaffected: `docs/use/when-work-fails.md` and `state-and-phases.md:43` ("shows a desktop notice" stays true) and `docs/pictures/watch-loop.svg` ("notification" stays generic).
- [ ] U8 window run, grep, timing, report.

### Old tests this leaf replaces

Ported at planning (now the criterion cases):
- `tests/next.test.ts` "busy seats persist, warn strictly after an hour, retry a failed notice and clear on an idle turn".
- `tests/phase.test.ts` "stop from implement on dirty worktree records blocked failure and clears busy fields", and "failed announce renames tabs, tolerates missing tabs, and retries herdr calls", renamed "failed announce writes the failed notice, renames tabs and tolerates missing tabs". Its `flaky` sub-case is deleted: it tested herdr's retryable-error retry, which has no file counterpart.
- `tests/batch-dispatch.test.ts` "a failed holder with a landed candidate is told to move back…" and "a failed published holder receives one recovery notice across repeated passes".
- `tests/verify.test.ts` "a fresh red base run sends one main-red notice and records the reason" (now "…writes one main-red notice and records it pending"), "a later base run red on the same unresolved unit sends nothing", "a failed herdr call is recorded and retried…" (now "a failed notice write…"), and "a pending notice left by a dead process does not block the next send". That last one is inverted per C3 into "a pending notice whose file outlives its sending process still covers the unit".
- `tests/slow-merge.test.ts` "a slow merge run is flagged, recorded, printed and notified once", and "a failed slow notice is retried … and a stale pending is resent". The second is inverted per C3.

For U5 (assertions on fake herdr notice calls move to `noticeFiles`, or the case is deleted with its reason):
- `tests/next.test.ts`: the `notices(f)` uses at the empty-notice assertions near lines 228, 273, 365, 371, 1957, the "a live merge retains its completion call…" busy assertion (`seat B` title), and the `saveDatabase … failNotification` uses near 362/369.
- `tests/phase.test.ts`: the "rename on a missing tab warns once and continues" loop (`notices` arrays and `failNotification`).
- `tests/session-routing.test.ts`: "the busy notice goes to the herdr session holding the repo workspace", "phase renames and the failed notice carry the resolved session", "the merge notice and main-red notice go to the resolved session", "the main-red notice reaches the running session holding the repo workspace", "a stopped repo session suppresses the main-red notice but keeps the receipt", and the notice clause of "land wake calls reach the resolved session…". The port asserts the file lands in the core holding the repo space and not in the decoy core.
- `tests/verify.test.ts`: "the incident resolves only on green evidence…", "an absent herdr binary is recorded as error…" (becomes "no session holds the repo: recorded as error"), "two simultaneous base runs produce one notification" (becomes one notice file), "a green on the same revision clears only the earlier main-red incident", "a failed base setup does not send a main-red test notice", "a leaf-scope green on main resolves a merge-scope main-red unit and re-notifies on recurrence".
- `tests/slow-merge.test.ts`: "only eligible rows enter the normal…", "an open episode pins the normal…", "the last 20 eligible runs…", and the remaining `mergeEnv`/`noticeCalls` uses.
- Dead helpers left after the port (`noticeEnv`, `noticeCalls`, `herdrCalls`, `herdrDb`, `failNotices`, `database`) are deleted in the same files.

## Criteria, observations and tests

### C1. Each caller writes one notice file atomically; the next pass records deleted as shown, present as pending

- Boundary: the session's `akrogon-notices/` folder of a real fixture core, the leaf `state.yaml`, and `issues/verify-runs.jsonl`.
  - Before: no file, and the record is unset.
  - After the write: one `<id>.json` with today's text, and the record is `pending`.
  - After the handler's delete and one pass: the record is `shown`, with no second file.
- Product failure caught: a lost, duplicated, partial or wrongly worded notice; a notice in the wrong session; a stall notice repeated every pass.
- Size: seconds per file (real core per case). Rerun trigger: any change in `src/notice.ts`, the callers, `src/state.ts` batch schema or `tests/hc-fixture.ts`. No model stage.
- Command: `akrogon run-check --name c1 -- bun test --timeout=30000 tests/notices.test.ts tests/next.test.ts tests/phase.test.ts tests/batch-dispatch.test.ts tests/verify.test.ts tests/slow-merge.test.ts tests/command-reference.test.ts`, and the `test` check.
- Cases:
  - writer: `notices.test.ts` "a notice is published as one complete <id>.json through a temporary name, creating its folder".
  - ids: "ids keep repos and kinds apart in one shared session folder".
  - verb: "akrogon notice writes one notice into the resolved session of the repo of its cwd" and "akrogon notice fails, writing nothing, when no running session holds the repo".
  - busy: `next.test.ts` "busy seats persist…".
  - failed: `phase.test.ts` "failed announce writes the failed notice…" (the `notab` block folds through `next --all`) and "stop from implement on dirty worktree…".
  - merged: `batch-dispatch.test.ts` both cases above.
  - main red: `verify.test.ts` "a fresh red base run writes one main-red notice…" and "a later base run red on the same unresolved unit sends nothing, while pending and once shown".
  - merge slow: `slow-merge.test.ts` "a slow merge run is flagged, recorded, printed and notified once".

Red at planning:
- Without the module: `check red-notices: 1 implementation/check-red-notices-1794103398496-36435.log`, `check red-failed: 1 implementation/check-red-failed-1794103399829-37603.log`, `check red-mainred: 1 implementation/check-red-mainred-1794103401025-39387.log`, `check red-slow: 1 implementation/check-red-slow-1794103401164-39494.log` (all `Cannot find module '../src/notice'`).
- Old herdr path still live: `check red-busy: 1 implementation/check-red-busy-1794103399684-36560.log` (the blocked write still exits 0), `check red-merged: 1 implementation/check-red-merged-1794103400890-37715.log` (no file, the herdr send went out).
- With the temporary stub (writer and id real, callers unchanged): `check red-notices-stub: 1 implementation/check-red-notices-stub-1794103420416-40843.log` (writer and id cases pass, both verb cases fail on `Unknown option '--title'`), `check red-failed-stub: 1 implementation/check-red-failed-stub-1794103420783-41054.log`, `check red-mainred-stub: 1 implementation/check-red-mainred-stub-1794103421666-41428.log`, `check red-slow-stub: 1 implementation/check-red-slow-stub-1794103422257-43029.log` (each fails on the missing file or record).

Conditions checked against the decisions:

| Condition | Decision | Case | Red |
| --- | --- | --- | --- |
| Written atomically: never a partial `<id>.json` | D1 | writer case (a non-`.json` name is seen before `<id>.json`) | direct write to `<id>.json`: `check red-writer-direct: 1 implementation/check-red-writer-direct-1794103437004-44151.log` |
| The folder may not exist yet | D1 | writer case, first write | no mkdir: `check red-writer-nofolder: 1 implementation/check-red-writer-nofolder-1794103437138-44262.log` |
| One file per notice across repos sharing a session | D2 | ids case | repo dropped: `check red-ids-norepo: 1 implementation/check-red-ids-norepo-1794103437278-44360.log` |
| Busy notice once per episode: a shown one is not rewritten | D5 | busy case: after the delete, the pass records `shown` and the folder holds only B | implementation: skip the fold (record stays pending, A rewritten next pass) |
| A failed write is retried and records nothing | D7 | busy case `blockNotices` step | stub red above (exit 0); implementation: record `pending` before the write |
| Failed write recorded as `error` | D7 | failed `oops` block, main-red failed-write case, slow first block | stub reds above |
| Merged notice not duplicated while pending | D5 | "failed published holder…": two passes leave one file | implementation: write whenever `notified !== 'shown'` |
| Fold reads present as pending, gone as shown, per record | D5 | busy, failed `notab`, merged, main-red second case, slow second block | stub reds above; implementation: fold that ignores the file |
| Right session: the repo space's session, not the caller's | D3 | verb case (run from `issues/` of the repo); U5 session-routing ports | implementation: write to `appHome('default')` |
| Title, body and attention as today | D10 | every caller case compares all three fields | stub reds above |

### C2. A notice whose condition cleared is removed before it shows

- Boundary: the notice file before and after the pass or move that sees the condition cleared, before any handler ran.
- Product failure caught: a stale "busy" or "failed" toast shown after the seat finished or the leaf recovered.
- Size: seconds. Rerun trigger: changes in `observeBusy`, `commitMove` or `src/notice.ts`. No model stage.
- Command: as C1.
- Cases:
  - busy cleared by an idle turn: `next.test.ts` busy case, "the idle observation … removes B's notice".
  - busy cleared by a move to failed: `phase.test.ts` "stop from implement on dirty worktree…".
  - failed cleared by recovery: `phase.test.ts` "failed announce…", first block.
  - merged cleared by leaving failed: `batch-dispatch.test.ts` "a failed holder with a landed candidate…", after `phase aa merge`.
- Red at planning: `check red-busy: 1 …36560.log` (the case stops before the clear step), `check red-failed-stub: 1 …41054.log` ("stop from implement…" fails `existsSync(busy)` expected false, and the failed block fails), `check red-merged: 1 …37715.log`.

| Condition | Decision | Case | Red |
| --- | --- | --- | --- |
| Removed in the same pass that clears the busy record | D6 | busy case idle step | implementation: clear the record without removing |
| Removed on a move into failed (busy) | D6 | stop case | stub red above |
| Removed on recovery out of failed (failed and merged) | D6 | failed first block; merged `phase aa merge` | stub red above; implementation: skip removal |
| A removed merged notice never folds as shown | D6 (`notified` dropped) | traced: the removal and dropping `batch.notified` happen in the one `commitMove` save leaving failed, and `reconcileBatch` reads `notified` only for a failed holder, so no pass can see `pending` with the file removed | n/a |

### C3. `noticeCovers`: pending covers while its file exists (also after the pid ended), shown covers, a failed write never covers

- Boundary: the verify ledger plus the session's notice folder, observed through `akrogon verify --known-red` and merge-scope runs in their own pass process.
- Product failure caught: a second main-red or merge-slow toast for the same incident, or no retry after a failed write.
- Size: seconds per run. Rerun trigger: changes in `noticeCovers`, `decideSlow`, the locked rewrite or `src/notice.ts`. No model stage.
- Command: `akrogon run-check --name c3 -- bun test --timeout=30000 tests/verify.test.ts tests/slow-merge.test.ts`, and the `test` check.
- Cases:
  - `verify.test.ts` "a pending notice whose file outlives its sending process still covers the unit" (dead pid, other boot, file present: no new file, row stays pending).
  - `verify.test.ts` "a later base run … sends nothing, while pending and once shown" (pending covers, then folded shown covers).
  - `verify.test.ts` "a failed notice write is recorded as error and retried by the next base run" (error never covers).
  - `slow-merge.test.ts` "a failed slow notice is retried …; a pending one covers, waiting or shown" (same three for `decideSlow`).
- Red at planning: `check red-mainred-stub: 1 …41428.log`, `check red-slow-stub: 1 …43029.log`.

| Condition | Decision | Case | Red |
| --- | --- | --- | --- |
| Pending covers after its pid ended, on another boot | D9 | dead-process case | stub red above (old rule resends); implementation: keep the pid clause |
| Shown covers | D9 | "later base run…" third run | stub red above |
| `error` never covers | D9 | failed-write cases | stub red above; implementation: let `error` cover |
| Same rule for the merge-slow episode | D9 | slow second block | stub red above; implementation: `decideSlow` keeps its own pid clause |
| No double write between two concurrent verify runs | D8 (write inside the lock) | U5 port of "two simultaneous base runs produce one notification": one file | implementation: write after releasing the lock |

### C4. Window tier: toast, sound, deletion, closed-window wait, clear failure without the handler

- Boundary: a real herdr-app window in the throwaway session `akr-e2e-notices` with herdr-setup's installed `session-status` mod. Before: the notice file in the session folder. After: the file is gone, the handler logged `shown`, a toast shows in the shot, and a sink-input appears for the attention notice only.
- Product failure caught: notices never shown in the real app, shown with the window closed but lost, sound on a silent notice, or a silent pass when herdr-setup is missing.
- Size: minutes. Rerun trigger: a change in `src/notice.ts`, the verb, `tests/e2e/notices.e2e.ts`, the installed herdr-app version or herdr-setup's `notices.js`. No model stage.
- Commands:
  - Handler-missing run, no window started: `akrogon run-check --name tier-nohandler -- env AKROGON_E2E=notices AKROGON_E2E_HANDLER=/nonexistent/notices.js AKROGON_E2E_ROOT=<leaf temp> AKROGON_E2E_OUT=<leaf>/implementation/notices-tier bun test ./tests/e2e/notices.e2e.ts`. Expected to fail with the herdr-setup message.
  - Real run: the same command with `AKROGON_E2E_HANDLER=/home/ivan/.config/herdr-app/mods/session-status/notices.js` and name `tier-notices`.
- Red at planning (replan 2026-11-08): `check red-tier-nohandler: 1 implementation/check-red-tier-nohandler-1794107117071-2413364.log`. It failed before any start with "herdr-setup's notice handler is not installed: /nonexistent/notices.js is missing; land herdr-setup's status-notices leaf and run /home/ivan/Work/infra/herdr-setup/install". No `akr-e2e-notices` socket or home existed afterwards. The main path is not run at planning: it uses both window starts of the grant's bound of 2 and is U8's. Typecheck over the tier files: `check plan-typecheck-tier: 0 implementation/check-plan-typecheck-tier-1794107110846-2412846.log`.
- Restart boundary: before each herdrapp start. Each counts against the grant. A failed run after start 1 or start 2 leaves fewer than 2 starts, so a rerun needs a renewed grant (stop-type bound).

Grant use (readiness `grants[0]`, bound "at most 2 window sessions, counting every herdrapp start of akr-e2e-notices"):
- Prior use: none recorded in this leaf's artifacts.
- Planning launched nothing (first plan and replan). The first implement pass launched nothing (`implementation/report.md`). Count so far: 0 of 2 herdrapp starts.
- U8 writes one count line here before each start (openOnce = start 1, attach = start 2) and completes it after.

Count lines:
- (none yet)

### C5. No `herdr notification` call in `src/` or the needs-you line; no notice caller uses the old lookup

- Boundary: the committed tree at the implementation head. Product failure caught: a leftover old-herdr notice path (2a: no fallbacks).
- Size: seconds. Rerun trigger: any change under `src/` or `skills/watch-issues/SKILL.md`.
- Commands (output recorded in the report):
  1. `akrogon run-check --name c5-calls -- sh -c "! grep -rnE \"'notification'|herdr[^\\n]*notification\" src skills/watch-issues/SKILL.md"`.
  2. `akrogon run-check --name c5-callers -- sh -c "! grep -nE 'repoSession|herdrArgv|herdr\\(|retryable' src/next.ts src/phase.ts src/verify.ts src/notice.ts src/akrogon.ts"`.
  3. `akrogon run-check --name c5-importers -- grep -rnE 'repoSession|herdrArgv' src skills tests --include=*.ts`. This lists the remaining importers: `src/shell.ts` definitions and `observe.ts`, kept per D13.
- `src/AREA.md` is under `src/`, so U7's rewording must land first.

### C6. Verify `test` duration recorded against the 75 s baseline

- Observation: the `test` entry's run time from the leaf's final `akrogon verify` receipt in `issues/verify-runs.jsonl`, next to the baseline (median 75 s, max 121 s over the last 60 runs).
- Every old test replaced is named in the report (list above, plus U5's outcome per test).
- Expected rise: about 7 new fixture cores (`notices.test.ts` 2, `verify.test.ts` 4 cases, `slow-merge.test.ts` 3) at under 1 s each, spread over 4 workers. A rise over about 10 s is explained in the report.
- Size: minutes. Rerun trigger: the final head changes.

## Verification order (U8)

1. Run the `test`, `typecheck` and `format` checks through `akrogon verify` on the final head.
2. C1-C3 commands.
3. C5 greps.
4. Handler-missing tier run.
5. Count line, then the real tier run.
6. Report: the C6 duration line and every artifact path.

## Risks

- R1: `pactl subscribe` may show no sink-input if herdr-app's sound settings mute `blocked`. The run then fails that assertion and the report records the settings read (`~/.config/herdr-app/settings.json` sound keys), not a pass.
- R2: `herdr-app shot` may return a stale frame (lesson 2026-11-03). The handler's `akrogon-notice` `shown` line with its notify id is the second observation, and the report says which observation showed the toast.
- R3: `repoSpace` is memoized per process. A repo whose space moves to another session mid-process writes to the old session until the next process. That is the same limit engine-on-hc accepted. A pending file left in the old session folds as shown in the new one. Kept as a known limitation.

## Credentials

The design names no credential variable. `akrogon status notices-on-hc` prints no `Missing:` line. Readiness input `mods/session-status/notices.js` is present (`/home/ivan/.config/herdr-app/mods/session-status` links to herdr-setup, which holds `notices.js`).

## Old herdr ids (2026-11-08, door t15 under the operator's overnight delegation)

This leaf was dispatched by the pre-switch release seconds before the switch, so its state held herdr pane and tab ids and the hc release refused implement ("state predates hc"). Door t15 removed `tab` and `pane` from state.yaml (copy in `~/.local/state/akrogon-door-backup/predates-hc-20261108/`); the next pass starts hc seats. The old herdr seats stay idle for the operator to close.

## Implementation notes

2026-11-08, slot A, implement.

- U1, U5 and U6 own test files, but implement-issue forbids workers and implement A from writing or editing tests (exceptions: A's cited expectation correction in its own commit with a `Test-Change:` trailer). Refined: the `contracts` entry for `notice` in `tests/command-reference.test.ts` (U1) and every U5 port are done by A as cited expectation corrections, each in its own commit, citing design "Tests of `herdr notification show` calls are deleted with their reason" or the literal-interface line for the verb. Workers own only U1-U4 and U7 product and doc paths.
- Mismatch for review (D15, U6): `tests/e2e/notices.e2e.ts` and the `tests/e2e/tier.ts` session parameterization are new and extended proof machinery that the plan defers to implement. implement-issue says the seat never writes or extends proof machinery, and plan-issue says a criterion needing new proof machinery ends with `failed`. U6 is not implemented. C4 stays unshown, and the pass ends `failed` naming it after the rest of the leaf is implemented and proven.

## Operator decision (2026-11-08, door t15 under the operator's overnight delegation)

Delegation, operator verbatim 2026-11-07: "you send it, you fully control that process, please" and "All approvals that are needed". The report's Blocker (C4 needs new proof machinery) takes the report's own route: the leaf returns to `plan.synthesis` for one narrow pass. Slot A keeps D1-D14 and every implemented, proven unit as they are, and writes only D15's machinery at planning: `tests/e2e/notices.e2e.ts` and the session-name parameterization of `tests/e2e/tier.ts` with its `window.e2e.ts`/`kinds.e2e.ts` callers, in a test commit with `Test-Change` trailers, showing the free red the plan rules allow without a herdrapp start (the grant's 2 starts stay for implement's U8). Then the leaf moves to `implement`, which runs only U8 and writes the report's C4 section.

## Replan 2026-11-08

Slot A, plan.synthesis, after the implement pass ended `failed` on C4 (`implementation/report.md` Blocker; the mismatch is in Implementation notes above).
- Resolved: D15's tier script and the `tier.ts` session parameterization are written at planning and committed on the leaf branch as a test commit. The C4 commands above are unchanged.
- Remaining implement work: U8 only. That is the C4 handler-missing and real tier runs with count lines, a rerun of `akrogon verify` on the new head (its `test`, `format` and `typecheck` inputs include the changed `tests/e2e/` files only through format and typecheck), and the report update. C1-C3 and C5 proof stays from head `6c42e1c0`, since the replan changed no file they exercise.

## Operator decision 2 (2026-11-08, door t15 under the operator's overnight delegation)

The report's Blocker "the window grant is used up" is approved as asked: `grants[0].bounds` renewed from 2 to a new total of 4 herdrapp starts of `akr-e2e-notices`, same target, identity, effects and cleanup. The next count line draws on this renewal. Starts are free.
