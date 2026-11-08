# Round 18, slot C: review a9cac8c4 (S1)

Verdict: ready. One edge in the pi label rule (F1) is a one-condition hardening, not a blocker.

Outside reads after the reset: none. `door-reset.ts:97` types the keys, `:100` sends the start prompt, nothing reads A's transcript or terminal after `:90-94`. The last `transcriptFor` is `:75`, before the turn-end wait.

Failed reset, per harness: the receiving session's own `transcript.ts` answers the pre-reset path for every kind. claude, the unchanged `sessions/<pid>.json` (`src/transcript.ts` claudeTranscript); codex, the same open rollout (`:159-164`); agy, the same lock (`:137-142`); pi, `PI_SESSION_FILE` names the conversation still being written (`scripts/transcript.ts:17-19`). Equal to the entry, so SKILL.md:163's second run and `handover not continued: same transcript` close it. No hole found.

F1. Stale pi label, pi seat relaunched in the same terminal. `src/transcript.ts:197-204` lets any existing pi label beat pi's argv path. hc labels live on the terminal, so an operator who quits pi and starts a new pi in the same hc terminal gets a new argv start file while the old label still names the previous pi conversation; the label wins until a self call relabels it, which a supplied consultant never runs. Before this commit the argv path won and `:205-206` relabeled. Door-created seats are not affected: a restart gets a new address (SKILL.md:29, `src/seat.ts` has no `keep`). Hardening: add `statSync(recorded).mtimeMs >= statSync(named.path).mtimeMs` to the condition. After `/new` the current file is the newer one, after a relaunch the new start file is. Untested.

Other pi edges, no defect:
- Non-pi seat with a pi label (terminal reuse): `transcriptKind(named.path) !== 'pi'` skips the rule, `:205-206` relabels. A pi seat with a non-pi label: rule skipped, argv path labels.
- pi seat without `--session-id`: `fromProcess` null, `:194` returns the label the self call published, or null; the helper stops at `started: transcript unknown` (`:76`) when no label exists, so a handover never launches for it. Consistent with SKILL.md:163's `-` rule.
- Label file deleted: `existsSync(recorded)` fails, argv path answers.
- `scripts/transcript.ts:19` prints `PI_SESSION_FILE` without `existsSync`. pi persists the prompt before the tool runs, so the file exists. Low risk, no change needed.

Tests. The pi stage case (`tests/door-reset.test.ts:226`) feeds `PI_SESSION_FILE` from the fake, so it proves akrogon's plumbing, not that pi 1.5.0 sets the variable at the self call. That is documented (`pi/docs/environment-variables.md:26-27`, CHANGELOG.md:1361) but not seen live here. One live pi handover before relying on it. F1 has no test; one case with a label naming an older pi file than the argv file would cover it.
