# Wait mechanism

## Question
Q1. After prompting a peer, how does A know the peer has started, so the wait cannot match the idle state from before the prompt?
Q2. How does A wait for a peer turn longer than the harness's command limit without the wait being killed?

### Carries
- `skills/chart-issues/assets/questions.md:44`: "Pane text, file existence and chart fields cannot establish readiness or stand in for a peer answer."
- Precedent: `src/next.ts:466-476` prompt delivery with `--wait --until working --timeout 5000`.

## Findings
- herdr 0.9.1 `agent prompt --wait` requires an observed working or blocked state within 5000 ms after submission, else `agent_prompt_stalled`. `agent wait` without `--until` matches idle, done or blocked. Without `--timeout` it waits forever.
- Probe 2026-09-30: `herdr agent wait w8:pCT --timeout 1500` on a working pane gave exit 1, code `timeout`.
- Claude Code Bash: default 120000 ms, max 600000 ms. Codex and pi pass their own per-command timeouts, so one fixed number does not fit every harness.

### Operation proof 2026-09-30 (herdr 0.9.1, identity: operator's herdr session `infra`, A pane w8:pCT on Claude Code, B pane w8:pE8 codex `chart-b`)
- `herdr agent wait w8:pE8 --until idle --timeout 5000` → exit 0, `agent_status: idle`.
- `herdr agent prompt w8:pE8 "<final-check prompt>" --wait --until working --timeout 5000` → exit 0, `type: agent_prompted`, `agent_status: working`.
- `herdr agent wait w8:pE8 --timeout 60000`, Bash tool timeout 90000: five runs 17:06:11-17:11:19 UTC each exit 1 `{"error":{"code":"timeout"}}`, sixth run exit 0 at 17:12:17 with `agent_status: done`. Turn length about 6 minutes, the #44 case.
- Return file `slots/wait-mechanism-final-check-B.md` existed and was complete after the sixth wait. `git status` showed no B edits outside it.
- Cleanup: none needed. B's pane stays as the operator's peer. The only write is the return file under this chart.
- Limits: `agent_prompt_stalled`, prompt `timeout`, `agent_blocked` and a `blocked` wait result were not observed. The rule sends each of them to the operator, so no branch acts on an unobserved result.

### B final check (A,B merged)
- (B) Prompt `timeout` is a distinct outcome: `herdr agent prompt --help` "A caller timeout that expires first returns timeout", with caller timeout and startup guard both 5000 ms; `src/next.ts:480-486` handles it separately. (A) agrees. Merge: any non-zero prompt exit means not confirmed started, reported to the operator with herdr's error, never re-prompted.
- (B) The pre-prompt idle wait is unbounded: `herdr agent wait --help` "Without --timeout, waits indefinitely". (A) agrees. Merge: the same bounded repeated wait and `blocked` handling apply before and after the prompt.
- (B) Codex `exec_command` `yield_time_ms` is a yield interval, not a kill deadline (probe: `sleep 2` with `yield_time_ms=250` yielded then exited 0 later), so B would use T=5000 with yield 10000. (A) the rule's "T below the command timeout the harness gives that call" covers both harnesses unchanged.

## Taken
Operator 2026-09-30, verbatim: "1a | 2a | you must test it out yourself if possible. Use slot b consultant, the pane is active to your right"

- Q1 → 1a: prompt with `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000`; on `agent_prompt_stalled` report the peer as not started to the operator, never re-prompt automatically. Reason: herdr's own guard removes the race, matches `src/next.ts:466`. Foreclosed: 1b automatic re-prompt (double prompt risk).
- Q2 → 2a: repeat `herdr agent wait <pane> --timeout <T>` with T below the command timeout the harness gives that call, re-run on code `timeout`; on `blocked` go to the operator; on idle or done read the return file, a missing file is a peer failure to report. Reason: same on every harness. Foreclosed: 2b harness background runner (not portable, caused exit 144), 2c file polling (contradicts the readiness rule).
- The mechanism is proven live against slot B before handoff.

Correction 2026-09-30, operator "Yes" to B1 and B2 after slot B's final check:
- B1: any non-zero exit of the guarded prompt (`agent_prompt_stalled`, `agent_blocked`, `timeout`) means the peer is not confirmed started; A reports herdr's error to the operator and never re-prompts automatically. Changes the Q1 answer's stall-only wording.
- B2: the bounded repeated wait and `blocked` handling apply before the prompt as well as after it. Changes the Q2 answer's after-prompt-only wording.
