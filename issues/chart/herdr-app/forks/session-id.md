# Features keyed on agent session id

## Question

Old herdr reported each agent's session id (`agent_session.value`); hc does not. Features using it today: chart usage (`skills/chart-issues/scripts/chart-usage.ts` finds each seat's transcript by session id for claude, codex, pi), the watcher's log tail (`skills/watch-issues/scripts/observe.ts:157-175` resolves a working seat's transcript, `log-tail.ts` reads it for loop evidence), the `session` field in `issues/log.jsonl` (`src/log.ts:51`, diagnostic) and `issues/timings.jsonl` (`src/timing.ts:31`), and seats.yaml `session`.

1. Which of these features are kept?
2. For kept features, how is a seat's session id or transcript known: akrogon chooses the id at start where the harness takes one (`claude --session-id <uuid>`, `pi --session-id <id>`; codex and agy have no such flag, `--help` 2026-11-06), found afterwards per harness (cwd and start time), a herdr-setup patch, or not at all?
3. What does a kept feature do for a seat whose id is unknown (codex, agy, or a lookup miss)?

### Carries

- Signposts: forks/signposts.md `## Taken` (2a: remove old, no fallbacks; 4a: watcher workflow unchanged).
- Engine-shape, identity, start-and-pane, delivery: `## Taken` in each fork file (binding).
- Map: slots/map-merged.md fork "session-id".

## Findings

- Merged notes: slots/fork-session-id-merged.md (A,B,C,D,E with rebuttal corrections).
- Q1: keep all features (all).
- Q2: read from the live agent (codex and agy open file in `/proc/<pid>/fd`; claude open tasks path or `~/.claude/sessions/<pid>.json`; pi fresh `--session-id` in argv; door A from its own environment), checking `foreground.pid` then `pid`, read where today's code asked herdr and saved on the terminal so it survives exit (A,C,E; D capture once at start; B codex publishes `CODEX_THREAD_ID` by `hc send`). No cwd/time scans (all after rebuttals).
- Q3: today's unknown paths: unmeasured with reason, `log<seat>=-`, `session: null`, never fails a start (all).
- Verified: `claude --help` and `pi --help` list `--session-id`; codex and agy have none; live fds and env per seat as recorded in the merged notes · 2026-11-06.

## Taken

Operator 2026-11-06, door t15, verbatim, first on Q1: "q1 - why does it need to know the id? isn't it enough to just know the file with the response? challenge me"; A answered that the file is what features need and the id is only a lookup step for claude and pi, and proposed "1a (path)"; operator then: "1a 2a 3a"

Read as (A reads the reply as accepting the path form A had just proposed; operator may correct):
- Q1 1a: keep chart usage, seats.yaml session, the watcher's log tail and the `session` field in log.jsonl and timings.jsonl. What is recorded per seat is the agent's transcript file path, not an id; readers open it directly (`observe.ts` and `chart-usage.ts` already accept a path kind).
- Q2 2a: the path is read from the live agent where today's code asked herdr (observe, log, timing, door at each exchange, usage): codex and agy from their open file in `/proc/<pid>/fd`; claude from its open `/tmp/claude-<uid>/<cwd>/<id>/tasks` handle, the id there giving `~/.claude/projects/<cwd>/<id>.jsonl`; pi from the fresh `--session-id` start put in its argv; the door's own from its environment (`CLAUDE_CODE_SESSION_ID`, `CODEX_THREAD_ID`). Lookup checks `foreground.pid` then `pid`. The path read is saved on the terminal (label) so it survives exit; a `/clear` or `/new` is followed because the next read finds the new file. No cwd/time scans.
- Q3 3a: unknown path: usage shows the seat unmeasured with the reason and continues; observe prints `log<seat>=-` and the watcher judges from the screen, "no log"; log and timings write `session: null`; a start never fails over it.
- Corrections from the path check (B,C,D,E, 2026-11-06), no pick changed:
  - One resolver in `src/` owns finding the file, used by engine, watcher, usage and door (D,B): codex and agy from the open file; claude from the open `tasks` handle's id under the same projects root `chart-usage.ts` uses (`CLAUDE_CONFIG_DIR`, else `~/.claude`) (C); pi from the argv id by the `*_<id>.jsonl` match in its session store (today's lookup in `src/session-file.ts:11-34` moves into the resolver, the delivery proof that used it is deleted) (D,E). pi's path is saved at its first read after the file exists (D).
  - Process order: the program hc started (`pid`) first; its foreground process only when `pid` holds no transcript, as for a terminal you opened yourself where `pid` is the shell (C,E). A nested `claude -p` or `codex exec` run as a tool is never picked (C).
  - The door finds its own file by the same resolver on its own terminal, not from environment variables (E: `CLAUDE_CODE_SESSION_ID` is absent from claude's process environment and does not change after `/clear`). One rule for every seat.
  - `chart-usage.ts` takes paths for claude and codex too (today it treats those values as ids, B); a test shows usage numbers unchanged on known transcripts.
  - The chart skill's session wording, the "never with a null session" rule and the handover continuation rules (SKILL.md:39,137,147) move to paths in the chart-door leaf; an unknown current path never counts as the same conversation, and saved older paths stay usable for usage only (B,C).
  - Probes: codex with and without `--no-daemon` holds its rollout (C); claude derived path exists for a worktree seat (C); claude after `/clear`, codex after `/new`, pi after `/new` give the new file (C,E); reset with a late new file and an exited seat (B).

Correction, operator 2026-11-07, door t15 (probe round, forks/proofs.md P3), verbatim: "1a | 2b - if that doesn't work, I'll approve the working akrogon folder manually so it can work in any repo. | 3 - I don't understand, elid. What are the consequences"

Read as (1a): the resolver's claude lookup reads the open `tasks` handle under the seat's own `TMPDIR` (`<TMPDIR>/claude-<uid>/<cwd-mangled>/<id>/tasks`), not `/tmp/claude-<uid>` when `TMPDIR` is set; codex takes the newest rollout the process holds; pi as taken. These hold for seats that are never reset in place (leaf seats and consultants restart by kill and start). After an in-place reset (`/clear`, `/new`), the current transcript is found by a unique code: the first prompt after the reset carries a fresh code, and the transcript is the file in that kind's transcript folder for the seat's cwd that contains it (P3: claude keeps the old handle open, codex opens the new rollout only after the next prompt, pi switches file names).

Final-shape check, 2026-11-07 (slots/final-probe-B..E.md; D no disagreement), applied by A within the operator's 1a:
- The claude handle is found by its fd target pattern `…/claude-<uid>/<cwd-mangled>/<id>/tasks` in `/proc/<pid>/fd`, whatever `TMPDIR` is (C).
- The code lookup runs only after the warm-up turn has ended (turn advanced, status idle or done) and is bounded: claude `~/.claude/projects/<cwd-mangled>/` and pi's sessions folder for the cwd, files modified after the reset began; codex the rollouts open in `/proc/<pid>/fd`, newest first (codex stores rollouts by date, not cwd) (B,C,E).
- The found path is saved as the terminal's transcript label (as taken), and later lookups without a code return the label's path, so fresh A, usage and the watcher see the post-reset transcript (E).
- Stated limit: a reset akrogon did not perform (an operator typing `/clear` in a supplied consultant or door) is not detected; that seat's usage may count the old file until its next akrogon reset or restart (B).
