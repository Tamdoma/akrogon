# Fork Notes: `notices` (Seat E)

## Q1. Which channel shows a notice?

1. **Pick:** **Akrogon's existing `tasks` mod ([`herdr-app/tasks/main.js`](file:///home/ivan/Work/infra/akrogon/herdr-app/tasks/main.js#L1-L334), linked by [`src/install.ts:29-49`](file:///home/ivan/Work/infra/akrogon/src/install.ts#L29-L49) to `~/.config/herdr-app/mods/tasks`) calling herdr-app's `notify()` and `playSound()`.**
   - **Reason:** `tasks` is already installed by `akrogon install`, docked in the layout ([`herdr-app/tasks/mod.json`](file:///home/ivan/Work/infra/akrogon/herdr-app/tasks/mod.json)), alive even when hidden in a stack/column (`AGENTS.md:733-736`), and unit-tested in [`tests/tasks-mod-host.test.ts`](file:///home/ivan/Work/infra/akrogon/tests/tasks-mod-host.test.ts#L1-L435). Keeping toast delivery inside `tasks` avoids adding a second mod or cross-repo dependency while using native `herdr-app` toasts (`toast` mod).
   - **Cost:** ~25 lines added to `herdr-app/tasks/main.js` and `tests/tasks-mod-host.test.ts`.
2. **Rejected options:**
   - **A second akrogon mod:** Rejected. A mod with `"place": "none"` never starts unless placed in the active layout (`AGENTS.md:725-733`), whereas `tasks` is already docked and running.
   - **A `herdr-setup` mod:** Rejected. All notice callers (`next.ts`, `phase.ts`, `verify.ts`, `watch-issues`) and tests live in `akrogon`, which already ships `herdr-app/tasks/`.
   - **Desktop notification (`notify-send`):** Rejected. Bypasses `herdr-app`'s `toast` mod, `settings.json` `sounds`, and click actions (`pane.focus` / `space.select`), and does not verify `herdr-app` window presence.
   - **Something `hc` carries (label or event on the seat terminal):** Rejected. `main red`, `merge slow`, and `merged, move it back` have no live seat terminal (`verify` runs in a detached service; `merge` seat B has finished), and `hc` labels do not trigger `herdr-app` toasts (`herdr.d.ts:366`).
3. **Evidence:**
   - `operator` · [`forks/signposts.md` `## Taken` and 2026-11-06 directions](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/signposts.md#L47-L66) (behavior like old akrogon, no polling, fewest moving parts) · read 2026-11-06.
   - `better-than-training` · [`herdr-app/tasks/main.js:51-82,166-179`](file:///home/ivan/Work/infra/akrogon/herdr-app/tasks/main.js#L51-L179), [`src/install.ts:29-49`](file:///home/ivan/Work/infra/akrogon/src/install.ts#L29-L49), [`~/.config/herdr-app/AGENTS.md:725-738,896,911,919-930`](file:///home/ivan/.config/herdr-app/AGENTS.md#L725-L930), [`~/.config/herdr-app/herdr.d.ts:41,365-374,396-403`](file:///home/ivan/.config/herdr-app/herdr.d.ts#L365-L403) · read 2026-11-06.
   - `practitioner` · Modern CLI/agent notification patterns (Kitty OSC 99, Ghostty/WezTerm OSC 777, `libnotify`): headless background services without a controlling PTY cannot emit OSC escape sequences and require an IPC/file bridge to the GUI host · searched 2026-11-06.
4. **Pitfalls & removals:**
   - *`<mod>.<command>` (`nextCommand()`) only reaches currently shown mod copies (`AGENTS.md:738`), dropping notices when `tasks` is in a hidden stack/column:* Removed by **design part** (Q2): feed `tasks` via `watchFolder` (which stays active while hidden, `AGENTS.md:733-736`), not `nextCommand()`.
5. **Unasked question:** Should `watch-issues` (`skills/watch-issues/SKILL.md:42-44`, which currently calls `herdr --session <name> notification show ...`) call a small `akrogon` CLI verb that uses the same notice writer as `next.ts`, `phase.ts`, and `verify.ts`?

## Q2. How does akrogon hand a notice to it and learn it was shown (including with the window closed)?

1. **Pick:** **Synchronous window check via `herdr-app ls` + atomic notice file in `${appHome()}/notices/<id>.json` watched by `tasks` via `watchFolder("${appHome()}/notices")` (push, zero polling/waiting):**
   - **Window open (`herdr-app ls` with session `HERDR_APP_HOME` exits `0`):** Akrogon atomically writes `${appHome()}/notices/<id>.json` (`{ id, ts, repo, title, body, sound, level, action }`) and immediately returns `{ shown: true, reason: 'shown' }` (`busy_notified` set in `next.ts:261`, `batch.notified = true` in `next.ts:1142`, `failure.delivery = 'shown'` in `phase.ts:123`, `notice = 'shown'` in `verify.ts:348,360`). `tasks` wakes immediately on `watchFolder("${appHome()}/notices")`, calls `notify(...)` (and `playSound` if requested), and unlinks `${appHome()}/notices/<id>.json` (`fs.unlink` is allowed under `~/.config/herdr-app`, `AGENTS.md:930`). On `init()`, `tasks` also drains any existing `notices/*.json`.
   - **Window closed or unreachable (`herdr-app ls` fails):** Akrogon writes no file and returns/throws `error`, preserving all existing retry loops without polling: `verify.ts` records `notice: 'error'` (retried on the next in-episode verify run, `verify.ts:238,294,406`), `phase.ts` records `failure.delivery: 'error'` (retried by `watch-issues`, `SKILL.md:42`), `mergeNotice` returns `false` (retried on next pass), and `observeBusy` leaves `busy_notified` unset.
   - **Reason:** Matches old herdr's synchronous `{ shown, reason }` contract and all existing `tests/verify.test.ts`, `tests/phase.test.ts`, and `tests/next.test.ts` expectations with zero polling or waiting (`forks/signposts.md:64-66`), while reusing the exact `herdr-app ls` window-liveness check from `forks/start-and-pane.md:58`.
   - **Cost:** One `herdr-app ls` check plus an atomic file write per notice; `watchFolder` drain loop in `tasks`.
2. **Rejected options:**
   - **Write the file and poll/wait for `tasks` to write an ack file:** Rejected. Violates the operator's "no polling or waiting" rule (`forks/signposts.md:206`) and adds timeout delays whenever the window is closed.
   - **Write the file blindly when the window is closed and mark `shown` immediately:** Rejected. Breaks `verify.ts`, `phase.ts`, and `next.ts` retry semantics when no GUI is running.
3. **Evidence:**
   - `better-than-training` · [`src/verify.ts:237-240,325-360,406`](file:///home/ivan/Work/infra/akrogon/src/verify.ts#L237-L406), [`src/phase.ts:98-134`](file:///home/ivan/Work/infra/akrogon/src/phase.ts#L98-L134), [`src/next.ts:249-265,1043-1085`](file:///home/ivan/Work/infra/akrogon/src/next.ts#L249-L1085), [`tests/verify.test.ts:752-796`](file:///home/ivan/Work/infra/akrogon/tests/verify.test.ts#L752-L796), [`tests/phase.test.ts:1387-1455`](file:///home/ivan/Work/infra/akrogon/tests/phase.test.ts#L1387-L1455), [`forks/start-and-pane.md:58`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/start-and-pane.md#L58), [`~/.config/herdr-app/AGENTS.md:919-930`](file:///home/ivan/.config/herdr-app/AGENTS.md#L919-L930) · read 2026-11-06.
4. **Pitfalls & removals:**
   - *Hot-reload of `tasks` mod re-runs `init()` and re-toasts already-shown files if not unlinked:* Removed by **design part** + **leaf done-criterion**: `tasks` unlinks each `${appHome()}/notices/<id>.json` before/upon calling `notify()` and tracks seen IDs in `shared("tasks.notices.seen")`.
5. **Unasked question:** None.

## Q3. Do sound and click actions stay as today (`--sound request|none`, the merge notice's next step)?

1. **Pick:** **Keep `--sound request|none` and all existing notice titles/bodies (`next: akrogon phase <slug> merge`), mapped to `herdr-app` primitives:**
   - **Sound:** `notify()` in `herdr-app` does not play audio itself (`herdr.d.ts:367-374`). When a notice specifies `sound: "request"` (`failed`, `merged, move it back`, `needs you`, and `busy leaf`), `tasks` calls `playSound("blocked")` (`herdr.d.ts:41`, gated by `settings().sounds?.enabled !== false`); when `sound: "none"` (`main red`, `merge slow`), `tasks` omits `playSound()`.
   - **Body & click action:** Keep `next: akrogon phase <slug> merge` as the merge notice `body` (`src/next.ts:1055`). Set toast click `action` (`herdr.d.ts:373`) to focus the relevant context (`pane.focus` `{ terminal }` or `tab.select` `{ id: tab }` for leaf notices with a live terminal/tab; `space.select` `{ id: space }` for repo-level notices), never auto-running `akrogon phase <slug> merge` on click.
   - **Reason:** Preserves old akrogon's exact sound and merge-step behavior (`forks/signposts.md:64-66`) while using `herdr-app`'s click-to-focus toast action where safe.
   - **Cost:** Passing optional `action` and `sound` fields in the notice JSON payload.
2. **Rejected options:**
   - **Drop sound on `request` notices:** Rejected; loses audio alerts for failed leaves and finished merges that `settings.json` `sounds` enables.
   - **Run `akrogon phase <slug> merge` automatically when the merge toast is clicked:** Rejected; moving the repo root checkout back to `main` is an intentional operator step.
3. **Evidence:**
   - `better-than-training` · [`src/next.ts:249-256,1050-1058`](file:///home/ivan/Work/infra/akrogon/src/next.ts#L249-L1058), [`src/phase.ts:106-114`](file:///home/ivan/Work/infra/akrogon/src/phase.ts#L106-L114), [`src/verify.ts:333-341,353`](file:///home/ivan/Work/infra/akrogon/src/verify.ts#L333-L353), [`skills/watch-issues/SKILL.md:42`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md#L42), [`~/.config/herdr-app/AGENTS.md:601-606,911,923`](file:///home/ivan/.config/herdr-app/AGENTS.md#L601-L923) · read 2026-11-06.
4. **Pitfalls & removals:**
   - *`playSound("blocked")` plays even when the user disabled sounds in `settings.json`:* Removed by **probe before handoff** + **design part**: check `settings().sounds?.enabled !== false` (and probe `playSound` behavior) before calling `playSound("blocked")`.
5. **Unasked question:** Should `busy leaf` (`src/next.ts:249-256`, which omitted `--sound` in old herdr) use `sound: "request"` (`playSound("blocked")`) or `sound: "none"`?
