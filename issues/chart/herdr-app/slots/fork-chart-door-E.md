# Fork: chart-door (Seat E)

## Q1. Consultants: safety net and surviving scripts

1. **Pick:** Create and restart consultants through akrogon's start command (`hc kill <seat>` then start on restart, `start-and-pane` Taken Q4 4a) with `--parent <door>` (`F2`) and equal heights via the `herdr-setup` weights helper only when adding/removing a consultant (`Q3 3a/3c`). Ask by plain `hc send --json` (`delivery` Taken Q2 2a) and collect via each consultant's `<hc from=...>` `done <letter>: <path>` report plus `hc`'s native child notes (`blocked`, `error`, `exited`) **and** one `hc wait --children all --timeout <budget>` run after A finishes its own independent notes. Delete `peer-create.ts`, `peer-restart.ts`, `peer-ask.ts`, `peer-wait.ts`, and `peer-anchor.ts`; keep only `chart-usage.ts` (ported to transcript paths per `session-id` Taken) and `direct-guards.ts` (zero herdr calls).
   - **Reason:** `hc` only types automatic child notes into a parent when a child *cannot* report (`blocked`, `error`, `exited`; `hc --skill` "Talk, wait, and collect results"). When a consultant silently ends its turn in `done`/`idle` without running `hc send` (as happened live with `ak-slot-e` on the N2 check, `INTAKE.md:200`), `hc` sends **no** child note. `hc wait --children all` is `hc`'s event-driven child barrier (not a polling loop): it wakes early on `reason: message` when a report arrives, catches a silent `done`/`idle` stop on the slowest child so A can apply `delivery` Q4 4a's one-nudge-then-drop rule, and keeps A in one turn (`SKILL.md:178`) instead of waking A on every child report before all peers finish.
   - **Cost:** One `hc wait --children all --timeout <budget>` command in skill text per exchange round after A writes its own notes.
2. **Rejected options:**
   - **Rely on `<hc>` reports + `hc` child notes alone (no `hc wait --children`):** Rejected because `hc` emits no child note when an agent child's turn ends normally in `done` or `idle`; if the last remaining consultant silently stops without running `hc send` (`INTAKE.md:45,200`), nothing ever wakes the door.
   - **Rely on `<hc>` reports only (`--no-notify` and no `hc wait --children`):** Rejected because both silent stops (`done`/`idle`) and child crashes/blocks (`exited`/`blocked`) would go unnoticed.
   - **Keep `peer-*.ts` wrapper scripts:** Rejected by `signposts.md` Taken 1a ("akrogon code only for starting an agent... every other hc step is plain `hc` commands in skill text") and `map-merged.md:23`.
3. **Evidence:**
   - `operator`: `INTAKE.md:41-45,73-76,142-150,200` (live door `t15`: `done` reports arrive as `<hc from=...>`; `ak-slot-e` silent stop in `status: done` turn 12 sent no message and was caught by `hc wait --children all`); `forks/signposts.md` (`## Taken` 1a, 2026-11-06 directions), read 2026-11-06.
   - `practitioner`: Multi-agent tmux/Claude Code orchestrators (`ccmux`, Mager's tmux subagent loop, Duotach `SKILL.md` subagent handshakes) pair file-based return artifacts with a parent barrier/status hook because raw terminal messages miss silent worker exits or permission stalls, read 2026-11-06.
   - `better-than-training`: `hc --skill` ("hc itself notifies you when a child cannot report (blocked, error, exited)"), `hc wait --help`, `skills/chart-issues/scripts/peer-create.ts:1-105`, `peer-ask.ts:1-141`, `peer-restart.ts:1-280`, `peer-anchor.ts:1-84`, `direct-guards.ts:1-21`, `chart-usage.ts:130-148`, read 2026-11-06.
4. **Pitfalls:**
   - **Late report from a killed/restarted consultant accepted for the new exchange (`INTAKE.md:145`):** Removed by design part (`delivery` Taken Q4 4a + `identity` Taken Q2 2a: verify report's `<hc from="<addr> ...">` matches the seat's current recorded `hc` address and the current exchange's return file exists).
   - **Claude Code backgrounding a foreground `hc wait --children all` when a mid-turn `<hc>` message arrives (`INTAKE.md:142`):** Removed by design part in skill text (kill/reap any backgrounded `hc wait` job once all active consultants' return files + reports are collected, or check `hc get` before nudging).
5. **Unasked question:** None.

## Q2. A's own reset at handover and finding the handover entry

1. **Pick:** Self-reset inside A's existing terminal (`$HC_TERMINAL_ID`): a detached helper spawned from A's terminal environment (inheriting `HC_TERMINAL_ID` and `HC_TERMINAL_SOCKET`) follows `hc events --terminal $HC_TERMINAL_ID` until A's outgoing turn ends (`idle`/`done`), checks A's transcript byte boundary for superseding operator input (`SKILL.md:163`), sends unwrapped `/clear` (`claude`) or `/new` (`codex`, `pi`) via `hc send $HC_TERMINAL_ID`, confirms a new transcript path via the `session-id` resolver (`session-id` Taken line 36, 39), and sends the `<start prompt>` via `hc send $HC_TERMINAL_ID "<start prompt>"`. Fresh A finds the handover entry from the `<start prompt>` (which names `$HC_TERMINAL_ID`, handover `<time>`, next chart, absolute `<chart-folder>`, and `SKILL.md` path) and verifies it against the latest unconsumed `handover <time>` line in `<chart-folder>/CHART.md` `## Mode record` (`SKILL.md:159-161`). `agy` keeps same-session handover (`SKILL.md:165`).
   - **Reason:** By `start-and-pane` Taken Q1 1a, consultants run with `--parent <door>` and die if A's terminal is killed (`INTAKE.md:44`). Resetting inside `$HC_TERMINAL_ID` preserves A's terminal ID, its left-50% pane, and its parent link to all surviving consultants. Only a send from inside A's own terminal environment arrives unwrapped as a slash command (`INTAKE.md:50`), and `/clear` starts no turn of its own (`INTAKE.md:53`), so the detached helper must send `<start prompt>` *after* the transcript path rotates (`INTAKE.md:51-54`).
   - **Cost:** One small reset helper (or akrogon verb) using `hc events --terminal` + `session-id` resolver instead of old `door-reset.ts`'s 500ms `herdr` polling loop.
2. **Rejected options:**
   - **Start a successor door via the start command and kill old A:** Rejected because killing old A's terminal kills all child consultants (`--parent <door>`, `INTAKE.md:44`, `start-and-pane` Taken Q1 1a), destroys A's left-50% pane layout, and invalidates the door address in `Mode record`.
   - **Door sends itself `/clear` and `<start prompt>` back-to-back without waiting for turn end and transcript rotation:** Rejected because a second send before `/clear` completes can sit unsubmitted or run in the old context (`INTAKE.md:51-54`), and cannot cancel on operator input (`SKILL.md:163`).
3. **Evidence:**
   - `operator`: `INTAKE.md:44,47,50-54,164`; `forks/start-and-pane.md` (`## Taken` Q1 1a); `forks/session-id.md` (`## Taken` lines 31-39), read 2026-11-06.
   - `practitioner`: Claude Code / tmux handover skills (Duotach / MCPMarket tmux handover pattern) persist handover state to a markdown file and inject a bootstrap prompt naming that file after `/clear` so fresh context resumes deterministically, read 2026-11-06.
   - `better-than-training`: `skills/chart-issues/SKILL.md:155-165` (`## Handover`), `skills/chart-issues/scripts/door-reset.ts:191-286`, read 2026-11-06.
4. **Pitfalls:**
   - **`codex` `/new` short turn or `claude` `/clear` no-turn race (`INTAKE.md:51-53`):** Removed by probe before handoff and leaf done-criterion (`session-id` Taken line 39: confirm the `session-id` resolver returns a new transcript file path before sending `<start prompt>`, then confirm `working` or `turn >= 1` via `hc events`).
   - **Operator types while handover is queued (`SKILL.md:163`):** Removed by design part (keep `door-reset.ts:121-128`'s transcript byte-boundary check for human input before sending `/clear` or `/new`).
5. **Unasked question:** Should the event-driven handover reset live in `skills/chart-issues/scripts/door-reset.ts` (ported to `hc events` + `src/` transcript resolver) or as an `akrogon` CLI subcommand alongside start?

## Q3. Gates, records, and remaining herdr ties in skill text

1. **Pick:** Replace `HERDR_ENV=1` / "Outside herdr" with `HC_TERMINAL_ID` / "Outside hc"; delete the temporary-path rule (`questions.md:60`, `SKILL.md:39`) so `issues/chart/<slug>/` (`CHART.md`, `INTAKE.md`, `seats.yaml`, `slots/`) is created at Open before the opening map (`INTAKE.md:133`); record `pane` as the `hc` terminal address (and `<prefix>-slot-<letter>` name) and `session` as the transcript file path from the `src/` resolver (`session-id` Taken); and update all six remaining `herdr`-tied clauses in `SKILL.md`, `assets/questions.md`, and `assets/shapes.md` listed in Evidence below.
   - **Reason:** Removes every legacy `herdr` reference and aligns skill text with `signposts`, `identity`, `start-and-pane`, `delivery`, and `session-id` Taken decisions.
   - **Cost:** Coordinated edit across `SKILL.md`, `assets/questions.md`, `assets/shapes.md`, and `scripts/chart-usage.ts`.
2. **Rejected options:**
   - **Keep `/tmp/<session>/map-*` before chart folder creation:** Rejected by operator direction (`INTAKE.md:126-134`).
   - **Require non-null `session` onconsultant start/restart (`SKILL.md:29`):** Rejected by `session-id` Taken Q3 3a & line 38 (unknown path is `null` and never fails start or restart).
3. **Evidence:**
   - `operator`: `INTAKE.md:28,37,61-65,80-84,126-134`, `forks/session-id.md` (`## Taken` lines 30-38), `forks/delivery.md` (`## Taken` Q4 4a), read 2026-11-06.
   - `better-than-training`: Remaining `herdr` ties inspected 2026-11-06 across `skills/chart-issues/`:
     1. **Pane width ratio (`SKILL.md:27`, `assets/questions.md:56`):** Change "A 65% wide, all created peers sharing the right 35%" to 50% / 50% with equal consultant heights (`INTAKE.md:84`, `start-and-pane` Taken Q3 3a/3c).
     2. **Seat & Mode records (`SKILL.md:29,39,137,147,153,161`, `assets/shapes.md:52-58,218-235`):** Replace `herdr agent list`, `pane_id`, `agent_session.value`, and "never with a null session" with `hc` address + `src/` transcript-path resolver; unknown current path never counts as the same session on resume (`SKILL.md:147`).
     3. **Consultant drop & collection rules (`SKILL.md:29,145`, `assets/questions.md:56`):** Replace `herdr` prompt refusals and `signal: proven/unproven` with `delivery` Taken Q2 2a (`hc send --json` when `idle`/`done`) and Q4 4a (return file + current address check, one nudge, then drop recording harness kind and model).
     4. **Direct-route reviewer B (`SKILL.md:110`):** Send B's `check-issue direct` prompt via `hc send` and collect by `<hc>` report + return file.
     5. **Duplicate door / busy consultant check (`SKILL.md:143,145`):** Key on live `hc` terminal address and `hc`'s `name_taken` (`identity` Taken Q3 3a).
     6. **Backgrounded Claude door (`INTAKE.md:174`):** Note in `SKILL.md` that a door with `status: null` (`/bg`) cannot receive status updates until resumed.
4. **Pitfalls:**
   - **Installed `~/.claude/skills/chart-issues/SKILL.md` drifts from repo copy (`INTAKE.md:37`):** Removed by leaf done-criterion (`akrogon install` / `self-update` links or copies updated `skills/chart-issues/` so live doors load the new text).
5. **Unasked question:** None.
