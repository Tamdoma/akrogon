# config: merged notes (A,B,C,D,E)

Sources: fork-config-A.md .. -E.md.

## Corrections (A, 2026-11-07)
- `~/.claude/settings.json` already allows `Bash(akrogon:*)` with `defaultMode: auto`, and has an `autoMode.allow` entry pre-approving peer starts through `herdr agent start` (B,C,D,E). The 2026-11-05 refusal was a raw `hc run ... codex -s danger-full-access` that no rule covered (C,E). A's "operator adds one rule" assumed none existed.
- `agy --help` has `--effort low|medium|high|xhigh|max` (B,C,D,E), so `{effort}` maps directly.
- `launch()` requires `argv[0] === config.harness` (`src/next.ts:296-301`; C,D).

## Q1. codex
- Add `--no-daemon` and keep `-a never -s danger-full-access` for leaf seats (all): hc requires it; leaf seats write outside their worktree (`issues/` at the repo root, the shared `.git`, `~/.akrogon/`, leaf temp, `systemd-run`), which `workspace-write` blocks (C,D,E). Consultants keep the recipe recorded for their seat (chart-door Taken); a sandboxed codex consultant keeps the network flag (B,D). C: consultants started from the harness line lose the sandbox, which existed only as the classifier workaround.

## Q2. agy
- Add an entry, the start verb then serves agy like the other kinds and its silent stops are recorded per kind (B,C,E): `agy --model {model} --effort {effort} --mode auto -i` (B,E) or `--dangerously-skip-permissions` instead of `--mode auto` (C; agy's help documents only that flag as auto-approve; a free probe with a write outside cwd decides). `-i` last so the appended task follows it (C,E). No slot changes.
- Leave it out (A,D): no slot uses it; a global entry invites any leaf slot to pick it while agy has no transcript reader (usage, watcher log tail), no proven reset, and showed a silent stop and a swallowed send. Consultants keep their recorded argv (chart-door Taken).

## Q3. Permissions
- Leaf `harnesses.claude` unchanged, `--dangerously-skip-permissions` kept: the listener starts leaf seats outside any Claude classifier, and unattended seats would stall on prompts (all).
- Doors in auto mode: the existing narrow `Bash(akrogon:*)` resolves before the classifier, so the start verb may already pass (C,E); probe before handoff in a throwaway session (B,C,D). If it does not, the operator replaces the legacy `herdr agent start` `autoMode.allow` entry with one naming the start verb and the recorded recipes, preserving the rest (B,D). akrogon install never writes Claude settings (B,D). E: replace dead `Bash(herdr ...)` allow lines with `Bash(hc:*)` at the cutover step.

## Q4. App home
- herdr-setup's convention (all): `default` → `~/.config/herdr-app`, any other session → `~/.config/herdr-app-sessions/<session>` (`herdr-setup/bin/herdrapp:9-10,58-63,178-182`). It works with the window closed, which notices need (all).
  - Implemented as one small function in akrogon's hc module (A,C,D,E); a missing folder is an error naming the expected path (D); `herdr-app.sock` under it confirms a live window (C); the caller's own `HERDR_APP_HOME` wins for its own session (A,D). Drift is caught by the post-update check and an e2e assertion comparing with `herdrapp session list --json` (C,D).
  - Read from herdr-setup's own `herdrapp session list --json` (`session_dir`), once per resolution, so the mapping lives in one place; caller env never used, since detached work can inherit the wrong window (B).
- Rejected by all: a config key (a second copy that drifts); reading the session itself (the core holds no app home; the window process is absent when closed).

## Corrections after rebuttals (2026-11-07)
- B: herdrapp's `running` flag tests a core socket (`<runtime>/herdr-core/<session>.sock`), not the window; never window-liveness proof. agy's `--mode auto` can fall back to default mode by account, platform or sandbox; the probe checks the effective mode and the tool and report behavior for the chosen model and effort, never swapping auto for bypass on failure. The legacy `herdr agent start` `autoMode.allow` entry is retired at cutover either way: removed with nothing added when the start verb passes, replaced by one narrow entry when it does not.
- C: `herdrapp session list --json` knows only ready-marked folders plus `default`, while identity finds sessions from core sockets; a session hc runs before any window opened has a socket and no herdrapp entry, so B's lookup fails in the window-closed case notices need. Keep the function; use the listing only in the e2e assertion. The caller's own `HERDR_APP_HOME` must not win (identity Q1 pins it per resolved session, containment: detached work resolves its own session); a door in `infra` charting a repo in another session writes that session's home. Against E's `Bash(hc:*)`: hc routine calls already pass in auto mode with no rule, and the rule would hide a hand-typed full-access `hc run` from the classifier; dead `herdr agent` lines are just deleted. agy's transcript path is readable from `/proc/<pid>/fd` (session-id); only the watcher's jsonl log tail cannot read agy's sqlite file, which keeps today's no-log path.
- D, E: no disagreement.
- A: accepts C on Q4 (function from the convention, caller env never used) and on `Bash(hc:*)`.
