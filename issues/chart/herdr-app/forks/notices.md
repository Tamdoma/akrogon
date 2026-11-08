# Notices

## Question

Today akrogon shows four notices with old herdr's `herdr notification show <title> --body --sound`, which answers `{shown, reason}`: busy leaf after 60 minutes (`src/next.ts:242-262`, recorded in `busy_notified`), "merged, move it back" (`src/next.ts:1043-1080`), main red and merge slow (`src/verify.ts:325-360`, recorded as `notice: shown|pending|error`, retried until shown). herdr-app has no notification command; a mod's `notify({title, body, level, icon, timeout, action})` posts a toast (AGENTS.md "Mods"), and a mod can follow a folder with `watchFolder(dir)` without polling. akrogon already installs a herdr-app mod, `tasks` (`src/install.ts:29-48`, linked to `~/.config/herdr-app/mods/tasks`).

1. Which channel shows a notice: akrogon's own `tasks` mod (or a second akrogon mod) fed by akrogon, a herdr-setup mod, a desktop notification (`notify-send`), or something hc carries (a label or event on the seat terminal)?
2. How does akrogon hand a notice to it and learn it was shown (today's `shown`/`pending`/`error` records and retries), including with the herdr-app window closed?
3. Do sound and click actions stay as today (`--sound request|none`, the merge notice's next step)?

### Carries

- Signposts: forks/signposts.md `## Taken` and its 2026-11-06 directions (behavior like old akrogon; no polling or waiting, `<hc>` where possible; fewest moving parts, nothing that works today may break).
- Engine-shape, identity, start-and-pane, delivery, session-id: `## Taken` in each fork file (binding).
- Map: slots/map-merged.md fork "notices".

## Findings

- Merged notes: slots/fork-notices-merged.md (A,B,C,D,E with rebuttal corrections).
- Verified by A: `tasks` is `place: none` and in none of the operator's layouts (herdr-setup `board`, `flat`); `session-status` (herdr-setup) is in both. Callers: busy, merged, failed (`src/phase.ts:98-134`), main red, merge slow, and the watcher's needs-you notices.
- Q1: receiver in herdr-setup's `session-status` mod (C,E) vs an akrogon `notices` mod plus a block in each herdr-setup layout (D). `tasks` dropped (all). Native command patch needs source (B).
- Q2: a notice file the mod picks up by folder watch and deletes after posting, waiting while the window is closed (D,E variants) vs a direct `herdr-app do` command answering at once (C), unproven: raw string only, asynchronous, possible false `shown` (B,E).
- Q3: sounds as today (busy silent per old source, B); click none as today (B,C) vs focus the seat (D,E).

## Taken

Operator 2026-11-06, door t15, verbatim: "1a - where is session-status? I can't see it anywhere | 2a | 3a |"

A's answer to the question (not a change): `session-status` is herdr-setup's bottom status bar (`/home/ivan/Work/infra/herdr-setup/mods/session-status/main.js`): the strip along the bottom of the window showing the session name, "This computer", the branch, the agent count with "needs you", and "Ctrl Shift P commands". The active layout is `flat` (`~/.config/herdr-app/shared.json`), which holds it; `board` does too.

Read as:
- Q1 1a: herdr-setup's `session-status` mod shows akrogon's notices; it gains a small handler, no new mod and no layout change. The handler's contract (folder, file shape) is akrogon's, pinned by an e2e test in both repos.
- Q2 2a: akrogon writes one notice file per notice atomically into a notices folder under the resolved session's herdr-app home; `session-status` follows the folder with `watchFolder` (no polling), posts `notify()` with the sound, then deletes the file. akrogon's next event-driven pass reads a deleted file as `shown` and a remaining one as `pending`, folding that into today's records (`busy_notified`, merge `batch.notified`, `failure.delivery`, verify `notice`). With the window closed the file waits and shows when herdr-app opens; a notice whose condition cleared (busy seat finished, failed leaf recovered) is removed before it shows. verify's `noticeCovers` (`src/verify.ts:237-239`) gets a rule for a pending file that outlives the sending pid. Callers covered: busy, merged, failed, main red, merge slow, watcher needs-you (the watcher writes through one akrogon verb, not `herdr notification show`).
- Q3 3a: titles, bodies and sounds as today: attention sound (`playSound("blocked")`, honoring herdr-app sound settings) for failed, merged and needs-you; busy, main red and merge slow silent; no click action; the merge step stays body text.
