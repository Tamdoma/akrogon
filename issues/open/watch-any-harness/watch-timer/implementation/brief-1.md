# Sub-brief U1: tick.ts refusal reasons

## 1. Goal

Make `skills/watch-issues/scripts/tick.ts` print a reason on every refusal, per plan.md D4
(criterion 14): today every refusal is a bare `no-watch`. The `accept` and `stopped` outcome
lines are unchanged in name and exit code; `stopped` may keep its bare word (the test only
reads `no-watch <reason>`). Exit codes stay: 0 for `accept`/`stopped`, 1 for `no-watch`.

## 2. Numbered acceptance criteria

1. Every path that today prints `no-watch` prints `no-watch <reason>` exit 1, with these
   reason families (plan D4):
   - missing/unparseable `timer=`, `pid=`, `due=`, root, or unset/empty `HC_TERMINAL_ID`:
     `bad fields`
   - `watchTarget(root)` throws: `no-watch <the thrown message>`
   - timer dead, unverified, foreign, or `parent !== own`: `no-watch timer <state|kind>` —
     use the distinguishing data you have (e.g. `timer dead`, `timer unverified`,
     `timer foreign`, `timer parent=<p> own=<o>`); any non-empty word family is fine, the
     tests only require a non-empty reason.
   - own terminal `getTerm` fails or `foreground === null`: `no-watch watcher <kind>`
   - `due <= receipt`: exactly `no-watch stale due=<n> receipt=<r>` — the free test greps
     `no-watch stale`.
   - receipt label write fails: `no-watch label <kind>`
2. The trailing `catch` binds the error message into the line (`no-watch <message>`), so no
   catch-all hides the error.
3. Reason text sits as the first token group after `no-watch`; the hook appends ` t=<turn>` to
   its own log line, so `no-watch t=<n>` alone would be the forbidden bare line.

## 3. Read-first list

- `skills/watch-issues/scripts/tick.ts` — the file you change (only file you own).
- `skills/watch-issues/scripts/hc.ts` — `getTerm`, `hcCall`, `isVerifiedTimer`, `Term`, `HcReply`
  shapes you print kinds from.
- `skills/watch-issues/scripts/repo.ts` — `watchTarget` error surface.
- `tests/watch-timer.test.ts` (the case "stop kills the verified timer; stale and forged ticks
  run nothing") — the red assertions you turn green; read, never edit.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — read before editing.

## 4. Change list and needed interfaces

- Owns: `skills/watch-issues/scripts/tick.ts` only.
- Change: replace `noWatch()` with a reason-taking variant (e.g. `noWatch(reason: string)`) or
  per-site `out('no-watch ' + reason, 1)`; route every refusal through it; the `catch` at the
  bottom becomes `catch (e) { out('no-watch ' + (e instanceof Error ? e.message : String(e)), 1) }`
  or equivalent.
- `watchTarget` rejection: today `await watchTarget(root).catch(noWatch)` — capture the error and
  print its message.
- Creation commit: `061cd4320b061a8e1763fb7269093a1482d62cf5` (worker worktree cut at this head).
- Lands first: nothing (wave 1). Consumed by: the free suite and both stand-in cells.

## 5. Do-not, reasons and exceptions

- Edit no test file and no other script — the planned tests are the contract; a planned test
  that is wrong or stays red once your code is correct is a mismatch returned to A with the
  failing output, not a test edit.
- Do not change `accept`/`stopped` semantics, exit codes, the receipt-before-check order, or
  the `stopped` kill+rm behavior — those are locked criteria 4-6.
- Do not widen the check's scope (no new condition); only refusal *reporting* changes.
- Standing exclusion: never run any `git stash` subcommand — all worktrees share one stash;
  to inspect base behavior use a second worktree of the base instead. Set work aside only as a
  WIP commit; before returning, `git reset --soft 061cd4320b061a8e1763fb7269093a1482d62cf5` and
  make the unit's one commit again.
- A refusal exit code or line a caller depends on changing (e.g. `stopped` → non-zero) is a
  mismatch to return with evidence; the exception is a revised brief from A.
- Restated: only tick.ts; reasons on every `no-watch`; `stale due=<n> receipt=<r>` verbatim;
  no test edits; no stash; mismatch instead of scope change.

## 6. Ordered steps

1. Read tick.ts, hc.ts (`HcReply.kind` values), repo.ts (watchTarget throw shape).
2. Rewrite the refusals with reasons (acceptance 1-3).
3. `bunx tsc --noEmit` must stay clean; then run the targeted test below and confirm the
   previously-red assertions are green.

Advisory size: 1 file, ~6 turns.

## 7. Commands

- `akrogon run-check --name watch-timer-u1 -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile --backend=copyfile" && bunx tsc --noEmit && bun test --timeout=30000 tests/watch-timer.test.ts'`
  (the whole free file is the unit's targeted command; cite the printed `check watch-timer-u1: <exit> <path>` line)

## 8. Done-when, evidence and report

The free suite is green where it was red on `no-watch` bare lines; paste the `check
watch-timer-u1: 0 <path>` line and any still-red case (a red that is not your change returns a
mismatch). Commit once on top of the creation commit with message naming the change; the file is
a frozen product path, so end the message with a trailer line:
`Test-Change: skills/watch-issues/scripts/tick.ts issues/chart/watch-live-speed Corrections item 4 (criterion-14 refusal reasons)`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
