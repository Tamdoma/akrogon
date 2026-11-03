# Move akrogon to herdr-app

## What I want
Move akrogon completely onto herdr-app and herdr-core (`hc`). I use herdr-app now. The old `herdr` terminal multiplexer is legacy, and after this it should not exist anywhere in akrogon: no `herdr` calls, no herdr plugin, no fake herdr in tests, no herdr wording in docs. No compatibility layer, no fallback to the old herdr, no "both supported" period. One cutover.

This covers every touchpoint: the engine (`src/`), leaf slots, chart-issues consultants, watch-issues, install and self-update, tests, docs, README and learnings.

This is a full port from old herdr to herdr-app, not a fix to one script or one skill. Chart it as one complete epic covering every touchpoint below, so that when it lands nothing in akrogon needs old herdr.

Why: hc already does a lot of what akrogon built by hand on top of herdr. A terminal that starts another is its parent. A child can message its parent with `hc send`, and the message arrives as the parent's next input. `hc wait` waits for the turn a send started. Labels put any terminal into a herdr-app space and tab. I expect large parts of akrogon's herdr code to be deleted, not ported.

Values: simplicity, removing over adding, function over form, systems thinking, speed and price.

## Where akrogon touches herdr today
Engine (`src/`):
- `src/shell.ts:226-239`: every call goes through `herdr()` / `herdrArgv()`, with `--session` per repo. `resolveSession` (`shell.ts:379`) finds the repo's herdr session by workspace label (`:404-406`).
- `src/next.ts`: leaf slots. Tab per leaf (`tab create`, `:585`), slot B split right (`pane split`, `:604`), `pane swap` repair (`:644-649`), `tab focus` (`:641`), `agent start --kind` (`:789-800`), `agent prompt --wait --until working` (`:826-828`), `pane close` (`:547`), `pane get` (`:268`), `notification show` for merge and busy notices (`:249-252`, `:1030-1075`).
- `src/next.ts:1603-1620`: `akrogon next` runs from herdr plugin events and reads `HERDR_PLUGIN_EVENT_JSON` and `HERDR_SOCKET_PATH`.
- `plugin/herdr-plugin.toml`, `plugin/next.sh`, `plugin/pull.sh`: the trigger for the whole engine. `pull.sh --all` and `next.sh --resume` at startup, and `next.sh` on `pane.agent_status_changed`, `pane.exited`, `pane.closed`, `tab.closed`.
- `src/state.ts:26,99`: leaf state stores herdr pane ids for A and B.
- `src/reconcile.ts:402-429` plus keep reasons through `:688-1397`: tab list and close in the repo session.
- `src/scope.ts:123-124`: `pane process-info`.
- `src/log.ts:36-51`, `src/verify.ts:33,328`, `src/phase.ts:33-70`: pane lookup, notices, retry on herdr failure.
- `src/install.ts:136-137`: `herdr integration install <kind>` per harness and `herdr plugin link`. `src/self-update.ts:283-288`: `herdr plugin link`.
- `src/AREA.md:15-33`: the session model.

Skills:
- `skills/chart-issues/`: `SKILL.md:27` (`HERDR_ENV=1`), `assets/questions.md:46,50` (peer panes and the peer exchange), `assets/shapes.md:57,217`, and the scripts `peer-create.ts`, `peer-ask.ts`, `peer-wait.ts`, `peer-anchor.ts`, `peer-restart.ts`, `door-reset.ts`.
- `skills/watch-issues/`: `SKILL.md:22-44` (`--session`, `agent read`, `notification show`, `agent send-keys esc`, `agent wait`, `agent prompt`), `scripts/observe.ts`, and the fixtures `herdr-agent-list.json`, `herdr-session-list.json`, `herdr-workspace-list.json`.

Tests: `tests/fake-herdr.ts` (fake binary driven by `FAKE_HERDR`), `tests/isolation.ts:64-78`, `tests/helpers.ts:132-146`, 703 matching lines across 48 files in `tests/` (887 lines in 62 files counting `skills/*/scripts`; recounted 2026-11-03 at dbd22640), `HERDR_PANE_ID: ''` in many setups, and `skills/watch-issues/scripts/observe.test.ts` (`OBSERVE_HERDR`).

Docs: `README.md:3,13` (Herdr as a prerequisite), `docs/start/install.md`, `docs/start/what-it-is.md`, `docs/reference/state-and-phases.md`, `docs/reference/releases-and-updates.md`, `docs/reference-index.md`, and single mentions in `checks.md`, `commands.md`, `run-work.md`, `watch-while-away.md`, `plan-work.md`, `autopilot.md`, `one-change.md`. `learnings/` has 21 lines: 2 in `LESSONS.md` (`:11`, `:21`) and 19 across 13 `learnings/history/` files.

Also mentioning herdr, found 2026-11-03 at dbd22640 and not listed above: `src/land.ts:16` (`HERDR_PANE_ID` comment), `tests/AREA.md`, `tests/fake-proc.ts`, `tests/deploy-fixture.ts`, `skills/watch-issues/scripts/observe-log-tail.test.ts`, the fixtures `skills/watch-issues/scripts/fixtures/claude-session.jsonl` and `codex-session.jsonl`, `skills/implement-issue/brief-template.md`, `docs/pictures/machine-parts.svg` (`:2`, `:49`, `:60`).

Outside the repo: `~/.claude/skills/herdr` is the old Herdr skill. It is not akrogon's, but agents load it and reach for the old `herdr`. It should go too. Also: the installed chart-issues skill (`~/.claude/skills/chart-issues/SKILL.md`) differs from the repo's `skills/chart-issues/SKILL.md` (repo copy 4 minutes newer, 2026-11-01); which one doors load matters for the port.

## What I already tested (2026-10-30, by hand, nothing in the repo changed)
Slot A was a Claude session in herdr-app. Consultants ran as `hc` children with no panes.
1. Consultants report back themselves. B (`claude`), C (`pi`) and D (`codex --no-daemon`) each got a one-line pointer to a past brief (`issues/chart/autopilot-new-chart/slots/map-brief-*.md`, copied with new return paths). Each brief ended with `hc send <A> "done <slot>: <file>"`. All three wrote their maps (43, 53, 45 lines) and the `done` messages arrived in A on their own. No polling, no idle checks, no scripts.
2. All three agents report status to hc (`working`, `idle`, `done`, `blocked`).
3. Restart works: `hc kill` then `hc run` under the same name, still a child of A. The address changes, so use names.
4. When A's Claude process crashes, A's terminal stays open and the children survive. When A's whole terminal is killed, the children die, unless started with `--outlive-parent`.
5. A child that stops without reporting sends no message. One `hc wait --children all --timeout <budget>` catches it: it returns when the child's turn ends.
6. Giving the first task in the start command (`hc run --bg --name x codex --no-daemon "<pointer>"`) worked 9 out of 9 across codex, claude and pi. A second task typed with `hc send` afterwards also worked 9 out of 9.
7. `/clear` sent by an agent's own terminal, then a prompt: claude 10/10, pi 10/10.

## Things hc got wrong in testing
- Text one terminal sends to another arrives wrapped as `<hc from="t15">...</hc>`. So `/clear` or `/new` sent by A to a consultant arrives as chat, not a command. Claude answered "Context is cleared" without clearing, and pi went looking for what "/new" meant. Only a terminal's own sends arrive unwrapped. My answer: reset consultants by kill and restart, never by `/clear` or `/new`.
- hc's `started: true` is not proof. Once, a start prompt sat unsubmitted in Claude's input box after a `/clear` while hc reported it started and finished (did not happen again in 10 tries). A codex startup popup ("Set up security for Daybreak mode") swallowed 10 typed prompts while hc reported each as started.
- codex plus `/new`: hc counted `/new`'s own short turn as the prompt's turn, so `hc send --wait` returned early. Without `/new`, codex waits were correct.
- `hc wait` right after a send that starts no turn (like `/clear`) waits for the full timeout.
- The old `door-reset.ts` already guards against this kind of thing: it waits for a new session id before the start prompt and checks the agent went `working`.

Evidence logs: `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/9a9ea106-f459-45d5-8b3a-7c3fb2eaa22c/scratchpad/` (`chart/`, `reset-test/`, `way2/`).

## Found 2026-11-01: the chart door cannot run in herdr-app
Agent findings from a framework session (Claude in herdr-core terminal `t5`), not operator words. The operator asked for `/chart-issues` on autopilot with B (codex) and C (pi) consultants to chart framework seeds #506-#520. The door refused to start. Nothing was charted and nothing changed in either repo.

Why it stopped, by layer:
- Rule text: `skills/chart-issues/SKILL.md:27` creates peer panes only when `HERDR_ENV=1`, and `SKILL.md:135` says autopilot cannot start outside herdr (`assets/questions.md:46` repeats the pane rule). This is a rule the model follows, not a code check. herdr-app does not set `HERDR_ENV`. It sets `HC_SESSION`, `HC_TERMINAL_ID`, `HC_TERMINAL_SOCKET` and `HERDR_APP_HOME`.
- Door scripts: `peer-create`, `peer-ask`, `peer-wait`, `peer-restart` and `door-reset` call `herdr agent ...` and `herdr pane ...`. From a herdr-app terminal those calls reach the old herdr `default` server, whose `herdr agent list` showed one unrelated pane (`w1:p1`, another Claude session in `/home/ivan`) and not `t5`. The `infra` herdr session was stopped. The scripts would target the wrong pane or fail.
- Session id: seat records (`seats.yaml`), usage measurement and the per-harness end-of-turn signals are keyed on `agent_session.value` from `herdr agent list`. `hc get t5 --json` gives address, labels, foreground process and status, but no agent session id.
- Waits: `hc wait` returns `reason: timeout` after 180 seconds by default as a check-in, not a failure, and `hc send --wait` can return `not_started` (`hc --skill`). `peer-wait.ts` logic does not map one-to-one.
- Engine: even with the door fixed, handoff goes to `akrogon next`, which starts leaf slots through `src/shell.ts` `herdr()` (about 20 calls in `src/next.ts`). Charting in herdr-app alone would produce leaves that still dispatch into old herdr.

What it costs while unported: in herdr-app, no chart pass can use consultants or autopilot, and no handed-off leaf can run. Every repo's intake waits on this or on going back to old herdr.

Added open question: what replaces `agent_session.value` for seat records, usage measurement and end-of-turn signals?

## How I picture it
- A consultant's or slot's own `done` message, with its file path, is the signal that work finished. One wait with a budget is only the safety net for a child that went silent.
- Consultants are `hc` children of the door. First task goes in the start command. Later tasks go with `hc send`. Reset is kill and restart from the seat record, never from `hc get`, because that still holds the old task.
- The briefs keep the rule that consultants write their own files where the chart rules say. The brief adds the `hc send` report line. That line belongs in the brief rule, not hardcoded in an hc template.
- Most of `peer-create`, `peer-wait` and `peer-anchor` should go away. `peer-ask` and `peer-restart` should get very small or become commands in the skill text.
- Leaf slots should show up in herdr-app: a space per repo and a tab per leaf, using the `herdr.space` and `herdr.tab` labels, so I can still see and take over A and B.

## Consultant panes: one column, in order (added 2026-11-03)
Operator words, 2026-11-03: "can you actually stack b,c,d slots below each other, and not next to each other? In order." and "So, slot A (you) has to take 50% of the width. The other 50% is stacked vertically by b, c and d."

Then: "They should all take the same amount of height (33% each)."

The rule: A takes the left 50% of its tab. Consultants show as panes in the right 50%, stacked top to bottom in naming order (B, then C, then D, ...), never side by side, each with an equal share of the height (33% each for three).

Agent findings from doing it by hand in herdr-app, 2026-11-03 (chart door t15, consultants chart-b codex, chart-c pi, chart-d agy):
- `hc run --bg --name <x> --label herdr.space=<A's space> --label herdr.tab=<A's tab> ...` makes each consultant a pane in A's tab, but placed side by side in arrival order (A | D | B | C seen), not in a column.
- Re-placing worked with `herdr-app do terminal.park --terminal <t>` for each (the agent keeps running), then `terminal.keep --terminal <B> --place right` with A focused, then `pane.focus` on the previous consultant and `terminal.keep --place down` for each next one.
- `terminal.park` and `terminal.keep` answer `pending: true`. A `pane.focus` sent right after fails with "no such pane", and the next `keep` then lands in the wrong place. Waiting ~2 s until `herdr-app ls` shows the new pane fixed it.
- Splits halve the focused pane, and herdr-app has no pane-resize command (only `layout.resize` for layout nodes). Three consultants come out 1/2, 1/4, 1/4 tall, not equal. Equal heights need a drag by hand or a herdr-app feature.
- Starting consultants without the labels (as plain `hc` children) and then placing each with `terminal.keep` in order avoids the park step.
- A sub-agent that gets its own pane was listed twice in the Agents sidebar: once on its own and once under its parent. Fixed 2026-11-03 in the operator's `agents-by-tab` mod (omarchy-customizations), which now drops a row whose parent is also listed.

## Consultant names (added 2026-11-03)
Operator words, 2026-11-03: "Also, the names for those consultants should be "slot-b", "slot-c" and "slot-d" for the charting process. Just put it into the intake, so we don't forget that, and apply immediately."

The rule: chart consultants run under the `hc` names `slot-b`, `slot-c`, `slot-d` (the seat letter, lowercase). A restart reuses the same name.

Agent finding, 2026-11-03: the stored tab tree (`~/.local/state/herdr-core/<session>/docs.json`, `herdr-app` document) keeps a column's children as one n-ary list with `size.weight` per pane. After a hand drag the three consultants read 0.68 / 0.68 / 0.64, so equal shares are representable. No command sets them.

Agent finding, 2026-11-03: `hc` has no rename. A live terminal's name is fixed at `hc run --name`, so changing it means kill and restart (`hc label` sets labels only).

## Chart work lives in the chart folder from the start (added 2026-11-03)
Operator words, 2026-11-03, after a consultant's report arrived as `<hc from="t2k chart-b">done B: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/<session>/scratchpad/map/map-B.md</hc>`: "the work needs to be written in a proper folder, according to the current akrogon rules, not randomly like this into the tmp folder. As I'm giving you these instructions, keep looking at how akrogon works today, and then fill out and update the intake.md file so we have the file up to date for later charting."

How akrogon works today (agent reading, 2026-11-03):
- `skills/chart-issues/assets/questions.md` "Blind peer exchange": every peer task travels as a brief under `<chart>/slots/`, but "Before chart folders exist, the temporary-path rule applies": opening-map briefs and returns go to `/tmp/<session>/map-<seat>.md` and move into `slots/` once the folder exists.
- `skills/chart-issues/SKILL.md` "Open": the seat record is "kept with the door's temporary files while no chart folder exists and written to `<chart>/seats.yaml` when the chart folder is created".
- `skills/chart-issues/assets/shapes.md` "Chart records": `issues/chart/<chart-slug>/` holds CHART.md, INTAKE.md, seats.yaml, USAGE.md, forks/, slots/. With `repo: none` from `akrogon config`, the chart is made locally in that repo and stops before leaf handoff.

What the operator wants instead: no temporary paths. The door creates `issues/chart/<chart-slug>/` at open (CHART.md with a pending Destination, INTAKE.md, seats.yaml, slots/) before the opening map. Every brief, return and `done` report names a path under `<chart>/slots/`. This removes the temporary-path rule and the move-into-slots step.

Applied by hand 2026-11-03 for `herdr-panels`: the opening map had already gone to /tmp, so its brief and returned maps were copied into a chart folder. The operator then had that folder filed in akrogon as intake only (`issues/chart/herdr-panels/`, not charted yet).

## Test run: chart door on herdr-panels in herdr-app (2026-11-03)
Operator words, 2026-11-03: "We are using the current chart to test and make improvements so that the issue intake.md file gets filled out with all the details. So when we actually chart out both the herder app and herder panels, we already have it all prepared." and "Prepare everything here inside of this repo as an issue."

Door A = Claude in t15 (herdr-app session infra). Consultants: codex (`codex --no-daemon -a never -s danger-full-access`), pi (`pi -a --exclude-tools request_user_input`), agy (`agy --dangerously-skip-permissions -i "<task>"`), each on its default model. Agent findings:
- First task in the start command worked for all three, agy included (`-i` keeps agy interactive after the first prompt). agy reports status to hc (`working`, `done`) like the other three harnesses.
- Each brief ended with `hc send t15 "done <letter>: <path>"`. All `done` reports arrived. In Claude Code they show up mid-turn as user input wrapped `<hc from="t2k chart-b">...</hc>`. A foreground `hc wait --children all` was moved to the background by Claude Code when a message arrived. The `done` message is the real signal, the wait only a net.
- The opening map took about 6 minutes (pi), 10 (codex), 13 (agy). Map sizes: B 163 lines, C 101, D 300.
- A cheap readiness check works: start a seat with the task "only run: hc send t15 'ready <letter>'". All three answered.
- Late messages: seats killed right after their `ready` still delivered it afterwards. A door must ignore reports from a seat it already replaced.
- Placing panes: `terminal.keep --place right` for a codex seat started a second earlier failed silently the first time (pending, then no pane). The next `pane.focus` on it then failed, so the following `keep --place down` calls landed under A instead of under B. Retrying keep until `herdr-app ls` shows the pane fixed it.
- Heights: keeping C below B and D below C (or D below B) always gives B weight 1 (unset), C 0.5, D 0.5 in the stored tab tree, so 50% / 25% / 25%. No command sets weights, so the operator's 33% each cannot be reached without a drag. This needs a herdr-app feature (a weight or ratio on `terminal.keep` / `pane.split`) or a tab-tree write.
- Every seat restart lost its pane placement and needed the full park/keep sequence again.
- Later tasks by `hc send`: `hc send --if idle` refused two seats that had finished their last brief ("t2t is done, not idle", nothing typed). `done` means finished while nobody looked. A seat waiting for its next brief is `idle` or `done`; plain `hc send` (no `--if`) started both. Never `--force`: that is only for `blocked`.

## Open questions
- What triggers `akrogon next` without the herdr plugin? `hc events` (follows status, turn and exit changes), a herdr-app mod, or something else? Startup `pull` and `--resume` need a home too.
- How does the per-repo herdr session map: one herdr-app space per repo, a label, or a separate `HC_SESSION`?
- What replaces `notification show`? herdr-app has `notify` for mods. Is there a CLI path, or does akrogon need a small mod?
- What replaces `pane process-info` in `scope.ts` and `pane swap` repair in `next.ts`? `hc get` gives the foreground process.
- Leaf state stores herdr pane ids. What does it store now: hc names, addresses, or labels?
- Door reset for A: keep `/clear` sent to itself with the old guards (tested), or kill and restart A's own Claude in the same shell (simpler, untested)?
- Should consultants and slots survive their parent's terminal closing (`--outlive-parent`)?
- What happens to install and self-update: what replaces `herdr integration install` and `herdr plugin link`? Does akrogon need to check that herdr-app and hc are installed?
- How do tests fake `hc` and `herdr-app` once `tests/fake-herdr.ts` is gone?
