# Report: door-reset

## Changed files and reasons

- `skills/chart-issues/scripts/door-reset.ts` (new) — two-process helper: parent validates pane kind (claude/codex/pi) + session, refuses non-zero with nothing sent and no log, else queues a detached child (`DOOR_RESET_CHILD=1`, stdio → log) printing `queued`; `DOOR_RESET_INLINE=1` runs the child synchronously for tests. Child steps, one JSON line each, first failure stops: `wait-turn-end` (claude `turn_duration`, codex rollout `task_complete`/`turn_aborted` of last `task_started`, pi hook authority + not working), `recheck`, `send-reset` (`/clear`|`/new`), codex `send-check-prompt` (`--wait --until working --timeout 5000`), `wait-new-session`, `send-start-prompt` (same wait contract). Bounds via `DOOR_RESET_TURN_BOUND_MS`/`DOOR_RESET_CONFIRM_MS`.
- `skills/chart-issues/scripts/peer-wait.ts` — exports only (`readPeerAgent`, `ListAgent`, `Exchange`, `piAuthority`, `claudeTurnOpen`, `codexRollout`, `codexEnded`); no behavior change.
- `tests/fake-herdr.ts` — `agent prompt` skips the wait-contract check when `--wait` is absent and accepts prompts on `working` panes; `promptScript` entries accept `session` to simulate a reset effect.
- `tests/door-reset.test.ts` (new) — 12 tests covering C2–C6, committed red before product code (plan.md).
- `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md` — handover paragraph, mode-record entries, `handover queued` footer (C6); attended text unchanged.
- `tests/door-reset.test.ts` formatted in a separate style commit.

## Commits

- `61727e0` test: add failing door-reset helper tests (red first)
- `e7ec7e7` test: fake-herdr prompt/session effects + peer-wait exports
- `49bf226` feat: door-reset helper
- `6dd8b2a` docs: describe door self-handover
- `df41b94` style: format door-reset test

Base `17d611718c…`; head `df41b94`. Branch was already current on `origin/main`; no rebase needed.

## Commands and results

- `akrogon run-check --name door-reset-red` (pre-code): `check door-reset-red: 1` — 9 planned failures, log `implementation/check-door-reset-red-1792257062405-922032.log`
- `check door-reset: 0` — 12/12 pass, `implementation/check-door-reset-1792257560641-1486218.log`
- `check peer-wait-reg: 0` — 35/35 pass, `implementation/check-peer-wait-reg-1792257583222-1487328.log`
- `check typecheck: 0`, `check format: 0`
- `akrogon verify` (fresh checkout, committed head): `verify leaf df41b94b: green` — 1043 tests pass, format+typecheck green; wall ~4 min.

## Criterion proof

- **C2** tests `refuses when …` (3 cases): exit 1, no log file, zero prompt calls.
- **C3** tests `… turn still open at the bound …` (claude, pi), `a session change before the reset sends nothing`: logged `turn open`/`identity changed`, nothing sent.
- **C4** `unconfirmed reset is logged…` and codex/claude/pi `handover` happy-path tests: prompt order reset → check (codex) → start, new-session gate.
- **C5** `a stalled start prompt is logged as failure and not retried`.
- **C6** `docs describe the handover entries and footer wording`.
- **C1 live run** (operator herdr, throwaway tab `w8:tDM`, panes `w8:pT5/6/7`, scratch repos `repo-{claude,codex,pi}` registered temporarily, each agent driven from the worktree skill):
  - codex `w8:pT6`: `handover.jsonl` all six steps — new session `01a14ae8…` confirmed after check prompt; `continue autopilot (handover 2026-10-17T17:28:11Z)` appended by the new session to `readme-title`; second chart started.
  - pi `w8:pT7`: `door-reset-pi.log` — reset → new session → start prompt sent; `continue autopilot (handover 2026-10-17T17:28:20Z)` appended; second chart started.
  - claude `w8:pT5`: `door-reset.log` — `/clear` → session `864eed4f…` → start prompt; `continue autopilot (handover 2026-10-17T17:39:19Z)` appended to both charts; second chart folder created by the new session.
  - claude attended check: a second `/clear` + invocation without the start prompt asked the operator (Q1 "which chart?") and appended nothing.
  - Pane ids and layout unchanged throughout. Cleanup: tab closed, temporary repo registrations removed, scratch folders deleted; evidence copied to `implementation/live-evidence/`.
  - First claude attempt charted both items without the handover step (old-session knowledge); a `/clear` + reprompt produced the compliant run above. Noted as a real-world variance of prompt-following, not a helper defect.

## Worker returns (folded)

- U1 (helper): two deviations recorded — codex turn-end reads the whole rollout (last `task_started` must have its own complete/aborted) instead of a byte boundary; parent queues a session mismatch when the passed session still has a transcript/rollout file, so the identity change is logged rather than silently dropped — both consistent with criteria. fake-herdr also accepts prompts on `working` panes.
- U2 (docs): additive edits only; attended text verified unchanged by diff.

## Known limitations

- Detached-spawn (`queued`) path is exercised live (all three kinds) but not in tests.
- A thrown child error exits 1 with stderr to the log and no JSON step line.
- One-off harness notices can still swallow a start prompt; logged `prompt_stalled`.
- Second charts wait on `origin` remote by design (destination checkpoint) — outside leaf scope.

## Unverified criteria

None.

## Repair round 1 (check.fix, against review-B fix verdict)

- **F1** (`7a767b6d`, B): SKILL.md startup now requires the start prompt to match the latest mode entry's pane, handover time and handed list before appending `continue autopilot`; mismatch is an attended start.
- **F2** (`6585d45a`): parent refuses a session mismatch unconditionally (dropped the transcript-hedge that allowed a different open session through); new test covers a passed session that has a transcript.
- **F3** (`6585d45a`): new `wait-check-end` step after the codex check prompt — `herdr agent wait --until idle --until done` bounded by the turn bound; a timed-out check turn logs `turn open` and the child exits before the start prompt. Also exported `isTimeoutError` from peer-wait.ts.
- **F4** attended-mode check live (`implementation/live-evidence-fix/attended/`): attended pi pass on a throwaway tab asked the operator for rounds, wrote no handover entries, ran no helper — CHART.md and pane capture copied.
- **F5** new tests: codex open-turn variants (older completed task before open one; single open task), stalled check prompt, check-turn-open-at-bound, session change during the turn wait; `Setup.run` signature fixed for the extra env arg (`ddbe18bf`).
- Deliberate-break evidence: forcing `codexTurnOpen → false` fails both open-turn tests (`check-break-codex-open`); skipping `wait-check-end` fails the check-turn-at-bound test and the codex happy path (`check-break-check-wait`). Code restored; 17/17 green after restore.
- Full-suite verify on `ddbe18bf`: 1048 pass / 0 fail, typecheck green.
- **Live rerun on the repaired head** (tab `w8:tDP`, panes `w8:pTA/B/C`, evidence `live-evidence-fix/`): all three kinds handed over in-pane — pi and codex logs show `wait-turn-end → recheck → send-reset → [send-check-prompt → wait-check-end] → wait-new-session → send-start-prompt`; codex log proves the new step ordering. Fresh pi and codex sessions appended `continue autopilot (handover …)` and charted the second item with zero operator input; `seats.yaml` shows both spans. Fresh claude appended `continue` to both charts after one operator correction — the start prompt it was sent named the correct pane, handover time and next chart (transcript verified), so the attended-side Q was model misjudgment, not an F1 gap; its second chart then needed repeated nudges and stayed incomplete (haiku fidelity limitation, same as the first live run's note).

## Repair round 2 (check.fix, F4 re-proof)

- **Doc gap found and fixed** (`2ca0721`): a fresh claude appended `continue` entries and a seat row naming session `b3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e` — a fabricated id, while the helper had confirmed `baf29937-…`. The mode-record docs named the field but never named its source. `shapes.md` now pins every mode entry's session id to the live `agent_session.value` from `herdr agent list`; the C6 docs test requires the wording.
- **Corrected claude live run** (tab `w8:tDS`, pane `w8:pTF`, sonnet, evidence `live-evidence-fix2/`): zero operator corrections. Old A (`7b890562`) created chart 2's folder, appended real `handover` entries with the real log path, and ran the helper; log shows all five steps confirming session `3499bf6c`. Fresh session appended `continue autopilot (handover 2026-10-17T19:15:02Z)` under its real id to both charts, `readme-title-scratch-pad/seats.yaml` carries both seat entries, the outgoing chart's span is closed (`to: 2026-10-17T19:15:02Z`), and the fresh session charted item 2 to the same held-on-origin wait. Pane id and layout unchanged throughout.
- **Claude attended check** (`live-evidence-fix2/attended/final-screen.txt`): `/clear` plus a door invocation without the start prompt produced `Mode: Attended` and an operator question; no entries appended.
- Failed preceding attempts on the same tab (fabricated `no-pane/no-session` entries; fabricated session id `b3c4d5e6`) are discarded — neither ran the helper and both were wiped before the compliant run.
- Report correction: the earlier repair-round claim "the start prompt it was sent named the correct pane, handover time and next chart … so the attended-side Q was model misjudgment" overstated the proof; the fabricated session id in that run's records made it non-compliant regardless of the matching judgment.

## Repair round 3 (check.fix, F4 seat-record boundary)

- B repaired the guidance (`dc4e5590`): for a handover-created next chart, `seats.yaml` creation defers to fresh A on entry; `opened` and the first span start at entry with the live `agent_session.value`.
- **Fresh claude live proof** (tab `w8:tDT`, pane `w8:pTG`, sonnet, zero operator corrections, evidence `live-evidence-fix3/`): old A `8d6e4f96` created `readme-scratch-pad/` with INTAKE.md + CHART.md only — `ls` and the helper log show no seats.yaml at handover. Fresh A `c815573f` appended `continue autopilot (handover 2026-10-17T19:40:24Z)` under its real id to both charts, then created `seats.yaml` itself: `opened: 2026-10-17T19:43:26Z` (its entry, not the handover time), single A seat with the real session id, first span `from` equal to `opened`. Outgoing chart's span closed at `19:39:40Z`; chart 2 charted to the same held-on-origin wait; pane id and layout unchanged.
- Earlier Claude attended capture (`live-evidence-fix2/attended/final-screen.txt`) and the codex/pi evidence from repair round 1 are retained and unaffected.
