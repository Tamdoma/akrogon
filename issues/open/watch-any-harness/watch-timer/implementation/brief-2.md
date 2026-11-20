# Worker brief 2 — watch-issues skill text and docs (plan U2)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/watch-timer-u2 (created at commit 83961ae8).

## 1. Goal

Rewrite `skills/watch-issues/SKILL.md` invocations and the human docs for the timer watch (plan U2, decisions D10/D20; done-criterion 10). Claude Code cron is gone; the watch works identically from claude, codex, pi and agy.

## 2. Acceptance criteria

1. `skills/watch-issues/SKILL.md`: frontmatter `description` loses "cron" (a plain-text timer watch started and stopped only by the operator). `## Invocations` rewritten: every harness, the operator sends `watch-issues <root>` (claude alias `/watch-issues`), `watch-issues stop <root>` (`/watch-issues stop`), and ticks arrive as `watch-issues tick timer=<address> pid=<pid> due=<n> <root>`. The mechanical steps run scripts in `<skill-folder>/scripts/`: `start.ts <root>` (run `akrogon status <root>` as the one check ONLY when its line begins `started` or `running`; `refused`/`conflict` → report, no check, nothing started), `tick.ts <tick tail>` (on exit 0/`accept` run one check — the script already set the `akrogon.watch-due` receipt first; `no-watch`/`stopped` → report, no check), `stop.ts <root>` (report its line). First-prompt rule kept, generalized: a tick that is the first prompt of its conversation while a verified timer is live runs the stop steps instead of a check (for codex/pi `/new` this is attempted, not guaranteed); a compaction summary before a tick is not a reset. Stated limits stay in the text: a tick hc holds behind an unfinished operator draft may land in the shell left behind when the operator exits a shell-launched agent (a replacement agent refuses it by `pid=`); codex and pi `/new` may leave the watch running into the new conversation.
2. `## Never` keeps all current lines, and the "Kill or remove an hc terminal." line gains this single carve-out: killing/removing is allowed only for the verified watch timer on `/watch-issues stop` and when a tick's `pid=` mismatches. Nothing else in Never changes. Remove the now-dead "Create a job from a tick." line — no jobs exist anymore (record this decision in your report).
3. Observe, Judge and Reply sections are unchanged.
4. `docs/use/watch-while-away.md`: rewrite start/stop sections for all four harnesses (any agent CLI in the repo's hc session; a timer terminal `<prefix>-watch` sends the tick; stop works from any terminal; the watch ends on stop, agent exit, terminal reuse, or a reset the harness shows — name the codex/pi `/new` and held-draft limits; keep "a tick that queues while a check runs gets its own check"; keep the "What stays yours" section).
5. `docs/reference/skills.md` watch-issues block: same facts, same four-harness wording.
6. `docs/pictures/watch-loop.svg`: the `cron every 20 min` text element becomes timer wording (e.g. `timer every 20 min`); no other drawing change needed.
7. `tests/AREA.md` line 15: name `tests/watch-timer.test.ts`, `tests/e2e/watch-live.e2e.ts`, `tests/fixtures/watch-agent.sh`/`watch-hook.sh`; `watch-check.e2e.ts` is deleted (its line goes); `watch-stop.e2e.ts` stays. Keep the file at ≤40 lines with exactly `## Commands`, `## Key files`, `## Non-obvious patterns`, `## See also`.
8. `skills/AREA.md` watch-issues line: loses "cron watch", gains the timer script set mention.
9. Hard wording gate (the docs test asserts it): none of the six files may contain `cron` (any case), `CronCreate`, `CronList`, `CronDelete`, or `expir` (any case — so write "no expiry" as "runs until stopped"). SKILL.md MUST contain `claude`, `codex`, `pi`, `agy`, `/new`, `compaction`, `draft`; watch-while-away.md must contain all four harness names.

## 3. Read-first list

Current `skills/watch-issues/SKILL.md` (full), `docs/use/watch-while-away.md`, `docs/reference/skills.md` §watch-issues, `docs/pictures/watch-loop.svg` (grep the text element), `tests/AREA.md`, `skills/AREA.md`, leaf `design.md` items 4-7 + corrections and leaf `plan.md` D8-D10/D20, `tests/watch-timer.test.ts` final docs test, and this skill folder's `ponytail.md` (`/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`).

## 4. Change list

Owns: `skills/watch-issues/SKILL.md`, `docs/use/watch-while-away.md`, `docs/reference/skills.md`, `docs/pictures/watch-loop.svg`, `tests/AREA.md`, `skills/AREA.md`. Nothing else.

## 5. Do-not

- No code/script/test edits (U1/U4 own those); no `src/` edits.
- Keep facts verifiable from the design: do not invent behaviors (e.g. do not claim the timer expires, do not claim compaction stops the watch).
- The word "expire/expiry" is forbidden by the docs test — phrase duration as "runs until stopped" / "no expiry" is NOT allowed because it contains "expir"; write "never ends on its own" or similar.
- Never `git stash`; set work aside as a WIP commit, and before returning `git reset --soft <creation commit>` + one final commit.
- Restated: scope/interface conflicts return a mismatch with evidence; the exception is a revised brief from A.

## 6. Ordered steps

1. SKILL.md frontmatter + Invocations rewrite (criterion shape §2.1-2).
2. watch-while-away.md and reference/skills.md.
3. watch-loop.svg text element; tests/AREA.md; skills/AREA.md.
4. Run the commands in §7; commit as one commit.

Advisory size: 6 files, under 25 turns.

## 7. Commands

- `bun test --timeout=30000 tests/docs-links.test.ts` (link/anchor/image integrity)
- `bun test --timeout=30000 tests/watch-timer.test.ts --test-name-pattern "docs describe"` (the docs gate; it only reads files)
Keep output via `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` line. (The rest of watch-timer.test.ts needs U1's scripts; ignore other failures in that file.)

## 8. Done-when / report

§2 holds and the docs gate passes; one commit on the detached HEAD. Report the four fill-ins:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
