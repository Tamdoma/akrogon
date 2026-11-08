# notices: merged notes (A,B,C,D,E)

Sources: fork-notices-A.md .. -E.md.

## Corrections (verified by A, 2026-11-06)
- The `tasks` mod is `"place": "none"` (`herdr-app/tasks/mod.json`), and none of the operator's layouts holds it: herdr-setup's `board` and `flat` layouts hold `board`, `changes`, `files`, `pane`, `session-status`, `tabs` / `agents-by-tab`, `changes-view`, `files-view`, `pane`, `panel-bar`, `session-status`, `spaces-list`, `workspace-chrome`. So a `tasks` copy does not run unless the operator opens it, and notices through `tasks` (A,D,E) would not show. E's "docked" claim is wrong (B,C right). `session-status` (herdr-setup) is in both of the operator's layouts.
- A mod copy lives while its block is in the layout, shown or hidden; `<mod>.<command>` from `herdr-app do` reaches shown copies only (AGENTS.md "Mods"; C,D,E).
- Callers are more than four: also the failed-leaf notice in `phase` (`src/phase.ts:98-134`, `failure.delivery`, re-shown by the watcher) (B,C,D,E) and the watcher's "needs you" notices from skill text (`skills/watch-issues/SKILL.md:42`) (D,E).
- Old `herdr notification show` had no click action (B,C,D); old `shown` meant the toast was placed in app state, not seen (B, old source `api.rs:1242-1251`).
- B's native herdr-app command patch needs herdr-app source; herdr-setup has no patch mechanism and the binaries are prebuilt (map corrections). B cites only old herdr source.

## Q1. Channel
- Inside herdr-app with its toast and sounds (all). Rejected by all: `notify-send` (leaves the app, ignores herdr-app sound settings), hc labels or messages (no human-facing notice; main red and merge slow have no seat).
- `tasks` mod (A,D,E): fails, see corrections.
- A second akrogon mod, `notify`, docked so a copy is always shown, with one command `notify.show {title, body, sound}` called as `herdr-app do notify.show` (C): synchronous answer like today; cost: a docked strip in every layout (probe a zero or one-pixel block).
- A native notification command patched into herdr-app by herdr-setup (B): cleanest call, needs source.
- herdr-setup mod vs akrogon mod: owner split. Callers, records and tests are akrogon's (C,D,E); layouts are herdr-setup's (signpost 3).

## Q2. Hand-off and "shown"
- Synchronous call, answer at once (B,C): `herdr-app do` exit 0 = `shown`, error = `error`; window closed = `error`; today's retries carry it (verify's later runs, next pass for busy and merged, watcher for failed). Closest to today's control flow.
- File spool with ack (D): akrogon writes one atomic file per notice in the session's app home; the mod follows the folder with `watchFolder`, claims, posts, writes an ack; engine passes fold acks into today's records; window closed: files wait and show when the window opens; stale ones expire when their condition cleared. Cost: shown becomes known later, at-least-once delivery.
- E: check the window first (`herdr-app ls`), write the file, answer `shown` at once; window closed: `error`, no file.
- Rejected by all: waiting for an ack (no-waiting direction); marking shown on a blind write.

## Q3. Sound and click
- Sound as today (all): `request` plays the attention sound (`playSound("blocked")`), `none` silent, operator's herdr-app sound settings respected (B,C,D,E; probe whether `playSound` honors `sounds.enabled`). Busy leaf passes no sound today; old default unverified (D,E).
- Click: none, as today; the merge step stays body text (B,C) vs focus the seat's pane on click as an improvement (D,E). Never run a command from a click (all).
- Titles and bodies unchanged (all).

## Corrections after rebuttals (2026-11-06)
- B: B's pick persists `shown` only from an explicit `{shown, reason}` result, not exit 0. C's mod command has no proven synchronous acknowledgement: `nextCommand()` is asynchronous, so `herdr-app do` reaching a copy does not prove a toast posted. Old herdr's busy sound default is `None` (old source `src/cli/notification.rs:62`, test at :189): busy stays silent.
- C: receiver moves to herdr-setup's `session-status` mod (in both layouts, 29 lines, imports `run`, `appHome`); a new akrogon mod would also need herdr-setup layout edits. A spool `pending` outlives the sending pid, so verify's `noticeCovers` (`src/verify.ts:237-239`) would need its own rule; the synchronous call keeps it untouched. Busy passes an explicit `none`.
- D: withdraws `tasks`; keeps spool plus ack, drained by a dedicated akrogon `notices` mod with one block in each herdr-setup layout (hidden if a hidden copy still runs).
- E: prefers `session-status` over a new mod. `herdr-app do <mod>.<cmd>` passes only a raw string to `nextCommand()` (no structured flags), and exit 0 when no copy is shown would be a false `shown`. Fix: `session-status` follows a notices folder with `watchFolder`, plus the `herdr-app ls` window check, or probe `do` first.
